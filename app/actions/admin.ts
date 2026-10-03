'use server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { readPhoto } from '@/lib/photo';
import { str, dateOrNull, schoolEmail, driveUrl } from '@/lib/format';
import { act, need } from './util';

const password = async (f: FormData, required: boolean) => {
  const p = str(f, 'password');
  if (!p) { if (required) throw new Error('Initial password is required.'); return null; }
  if (p.length < 8) throw new Error('Password must be at least 8 characters.');
  return bcrypt.hash(p, 12);
};

/* ---------------- Students ---------------- */

export async function saveStudent(f: FormData) {
  await requireRole('ADMIN');
  const id = str(f, 'id');
  await act(id ? `/admin/students/${id}` : '/admin/students/new', id ? 'Student details saved.' : 'Student created.', async () => {
    const email = schoolEmail(need(str(f, 'email'), 'Email'));
    const photo = readPhoto(f);
    const data = {
      admissionNo: need(str(f, 'admissionNo'), 'Admission number'),
      name: need(str(f, 'name'), 'Name'),
      email,
      className: need(str(f, 'className'), 'Class'),
      section: str(f, 'section'), rollNo: str(f, 'rollNo'), phone: str(f, 'phone'),
      dob: dateOrNull(f, 'dob'), gender: str(f, 'gender'), bloodGroup: str(f, 'bloodGroup'),
      house: str(f, 'house'), hostelBlock: str(f, 'hostelBlock'), room: str(f, 'room'), bed: str(f, 'bed'),
      fatherName: str(f, 'fatherName'), motherName: str(f, 'motherName'), parentName: str(f, 'parentName'),
      parentPhone: str(f, 'parentPhone'), emergencyPhone: str(f, 'emergencyPhone'), address: str(f, 'address'),
      documentsUrl: driveUrl(str(f, 'documentsUrl')),
      status: str(f, 'status') || 'ACTIVE',
      ...(photo !== undefined && { photo }),
    };
    const hash = await password(f, !id);
    if (id) {
      await prisma.$transaction([
        prisma.student.update({ where: { id }, data }),
        prisma.user.updateMany({ where: { studentId: id }, data: { email, name: data.name, ...(hash && { password: hash }) } }),
      ]);
    } else {
      const st = await prisma.student.create({ data: { ...data, user: { create: { email, name: data.name, role: 'STUDENT', password: hash! } } } });
      return `/admin/students/${st.id}`;
    }
  });
}

export async function deleteStudent(f: FormData) {
  await requireRole('ADMIN');
  const id = need(str(f, 'id'), 'Student');
  await act('/admin/students', 'Student record deleted.', () => prisma.student.delete({ where: { id } }));
}

/* ---------------- Teachers ---------------- */

export async function saveTeacher(f: FormData) {
  await requireRole('ADMIN');
  const id = str(f, 'id');
  await act(id ? `/admin/teachers/${id}` : '/admin/teachers/new', id ? 'Teacher details saved.' : 'Teacher created.', async () => {
    const email = schoolEmail(need(str(f, 'email'), 'Email'));
    const photo = readPhoto(f);
    const data = {
      employeeId: need(str(f, 'employeeId'), 'Employee ID'),
      name: need(str(f, 'name'), 'Name'),
      email,
      phone: str(f, 'phone'), dob: dateOrNull(f, 'dob'), gender: str(f, 'gender'),
      designation: str(f, 'designation'), department: str(f, 'department'), subjects: str(f, 'subjects'),
      qualification: str(f, 'qualification'), classTeacherOf: str(f, 'classTeacherOf'),
      joiningDate: dateOrNull(f, 'joiningDate'), address: str(f, 'address'), status: str(f, 'status') || 'ACTIVE',
      ...(photo !== undefined && { photo }),
    };
    const hash = await password(f, !id);
    if (id) {
      await prisma.$transaction([
        prisma.teacher.update({ where: { id }, data }),
        prisma.user.updateMany({ where: { teacherId: id }, data: { email, name: data.name, ...(hash && { password: hash }) } }),
      ]);
    } else {
      const t = await prisma.teacher.create({ data: { ...data, user: { create: { email, name: data.name, role: 'TEACHER', password: hash! } } } });
      return `/admin/teachers/${t.id}`;
    }
  });
}

export async function deleteTeacher(f: FormData) {
  await requireRole('ADMIN');
  const id = need(str(f, 'id'), 'Teacher');
  await act('/admin/teachers', 'Teacher record deleted.', () => prisma.teacher.delete({ where: { id } }));
}

/* ---------------- Fees ---------------- */

export async function createFee(f: FormData) {
  await requireRole('ADMIN');
  await act('/admin/fees', 'Fee record created.', async () => {
    const amount = Number(need(str(f, 'amount'), 'Amount'));
    if (!(amount > 0)) throw new Error('Amount must be greater than zero.');
    const title = need(str(f, 'title'), 'Fee head');
    const dueDate = dateOrNull(f, 'dueDate');
    const target = need(str(f, 'target'), 'Student or class');
    // "class:VIII-A" bills every active student in that class; otherwise it is a single student id.
    const ids = target.startsWith('class:')
      ? (await prisma.student.findMany({ where: classWhere(target.slice(6)), select: { id: true } })).map(s => s.id)
      : [target];
    if (!ids.length) throw new Error('No active students found in that class.');
    await prisma.feeRecord.createMany({ data: ids.map(studentId => ({ studentId, title, amount, dueDate })) });
  });
}

export async function recordPayment(f: FormData) {
  await requireRole('ADMIN');
  await act('/admin/fees', 'Payment recorded.', async () => {
    const id = need(str(f, 'id'), 'Fee record');
    const pay = Number(need(str(f, 'pay'), 'Amount'));
    if (!(pay > 0)) throw new Error('Payment must be greater than zero.');
    const fee = await prisma.feeRecord.findUniqueOrThrow({ where: { id } });
    const paid = Math.min(Number(fee.amount), Number(fee.paid) + pay);
    await prisma.feeRecord.update({ where: { id }, data: { paid, status: paid >= Number(fee.amount) ? 'PAID' : 'PARTIAL' } });
  });
}

export async function deleteFee(f: FormData) {
  await requireRole('ADMIN');
  const id = need(str(f, 'id'), 'Fee record');
  await act('/admin/fees', 'Fee record removed.', () => prisma.feeRecord.delete({ where: { id } }));
}

/* ---------------- Wallet ---------------- */

export async function addTransaction(f: FormData) {
  await requireRole('ADMIN');
  await act('/admin/wallet', 'Transaction added.', async () => {
    const amount = Number(need(str(f, 'amount'), 'Amount'));
    if (!(amount > 0)) throw new Error('Amount must be greater than zero.');
    const type = str(f, 'type') === 'CREDIT' ? 'CREDIT' : 'DEBIT';
    await prisma.transaction.create({
      data: {
        studentId: need(str(f, 'studentId'), 'Student'), type, amount,
        category: need(str(f, 'category'), 'Category'), note: str(f, 'note'), receiptNo: str(f, 'receiptNo'),
        date: dateOrNull(f, 'date') || new Date(),
      },
    });
  });
}

/* ---------------- Notices ---------------- */

export async function createNotice(f: FormData) {
  const s = await requireRole('ADMIN');
  await act('/admin/notices', 'Notice published.', () => prisma.notice.create({
    data: { title: need(str(f, 'title'), 'Title'), body: need(str(f, 'body'), 'Message'), audience: str(f, 'audience') || 'ALL', postedBy: s.name },
  }));
}

export async function deleteNotice(f: FormData) {
  await requireRole('ADMIN');
  const id = need(str(f, 'id'), 'Notice');
  await act('/admin/notices', 'Notice removed.', () => prisma.notice.delete({ where: { id } }));
}

function classWhere(label: string) {
  const [className, section] = label.split('-');
  return { className, ...(section ? { section } : {}), status: 'ACTIVE' };
}
