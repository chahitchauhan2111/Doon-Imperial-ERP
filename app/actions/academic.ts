'use server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { str, dayStart, classLabel } from '@/lib/format';
import type { Session } from '@/lib/session';
import { act, need } from './util';

const STATUSES = ['PRESENT', 'ABSENT', 'LATE'] as const;

/** Only allow redirects back into the caller's own panel. */
function backTo(s: Session, f: FormData, fallback: string) {
  const b = str(f, 'back') || fallback;
  const root = s.role === 'ADMIN' ? '/admin/' : '/teacher/';
  return b.startsWith(root) ? b : fallback;
}

const classFilter = (label: string) => {
  const [className, section] = label.split('-');
  return { className, ...(section ? { section } : {}), status: 'ACTIVE' };
};

export async function saveAttendance(f: FormData) {
  const s = await requireRole('ADMIN', 'TEACHER');
  const back = backTo(s, f, s.role === 'ADMIN' ? '/admin/attendance' : '/teacher/attendance');
  await act(back, 'Attendance saved.', async () => {
    const date = need(str(f, 'date'), 'Date');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid date.');
    const students = await prisma.student.findMany({ where: classFilter(need(str(f, 'class'), 'Class')), select: { id: true } });
    const day = dayStart(date);
    const ops = students.flatMap(({ id }) => {
      const status = str(f, 's_' + id) as (typeof STATUSES)[number] | null;
      if (!status || !STATUSES.includes(status)) return [];
      const note = str(f, 'n_' + id);
      return [prisma.attendance.upsert({
        where: { studentId_date: { studentId: id, date: day } },
        update: { status, note, markedBy: s.name },
        create: { studentId: id, date: day, status, note, markedBy: s.name },
      })];
    });
    if (!ops.length) throw new Error('Mark at least one student.');
    await prisma.$transaction(ops);
  });
}

export async function saveMarks(f: FormData) {
  const s = await requireRole('ADMIN', 'TEACHER');
  const back = backTo(s, f, s.role === 'ADMIN' ? '/admin/results' : '/teacher/marks');
  await act(back, 'Marks saved.', async () => {
    const exam = need(str(f, 'exam'), 'Exam');
    const subject = need(str(f, 'subject'), 'Subject');
    const maxMarks = Number(need(str(f, 'maxMarks'), 'Maximum marks'));
    if (!(maxMarks > 0 && maxMarks <= 1000)) throw new Error('Maximum marks must be between 1 and 1000.');
    const students = await prisma.student.findMany({ where: classFilter(need(str(f, 'class'), 'Class')), select: { id: true, name: true } });
    const ops = students.flatMap(({ id, name }) => {
      const raw = str(f, 'm_' + id);
      if (raw === null) return [];
      const marks = Number(raw);
      if (!(marks >= 0 && marks <= maxMarks)) throw new Error(`Marks for ${name} must be between 0 and ${maxMarks}.`);
      return [prisma.mark.upsert({
        where: { studentId_exam_subject: { studentId: id, exam, subject } },
        update: { marks, maxMarks, enteredBy: s.name },
        create: { studentId: id, exam, subject, marks, maxMarks, enteredBy: s.name },
      })];
    });
    if (!ops.length) throw new Error('Enter marks for at least one student.');
    await prisma.$transaction(ops);
  });
}

export async function reviewLeave(f: FormData) {
  const s = await requireRole('ADMIN', 'TEACHER');
  const back = s.role === 'ADMIN' ? '/admin/leave' : '/teacher/leave';
  const decision = str(f, 'decision') === 'APPROVED' ? 'APPROVED' : 'REJECTED';
  await act(back, decision === 'APPROVED' ? 'Request approved.' : 'Request rejected.', async () => {
    const id = need(str(f, 'id'), 'Request');
    const leave = await prisma.leaveRequest.findUniqueOrThrow({ where: { id }, include: { student: { select: { className: true, section: true } } } });
    if (s.role === 'TEACHER') {
      const t = await prisma.teacher.findUnique({ where: { id: s.teacherId || '' }, select: { classTeacherOf: true } });
      if (!t?.classTeacherOf || t.classTeacherOf !== classLabel(leave.student)) throw new Error('You can only review requests from your own class.');
    }
    await prisma.leaveRequest.update({ where: { id }, data: { status: decision, remarks: str(f, 'remarks'), reviewedBy: s.name } });
  });
}
