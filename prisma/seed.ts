import { PrismaClient, Role, TransactionType, AttendanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const d = (iso: string) => new Date(iso + 'T00:00:00.000Z');

// Deterministic pseudo-random so re-running the seed gives stable demo data.
let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const TEACHERS = [
  { employeeId: 'EMP-101', name: 'Meenakshi Rawat', email: 'meenakshi@doonimperial.com', phone: '98XXXXXX11', designation: 'TGT Mathematics', department: 'Mathematics', subjects: 'Mathematics', qualification: 'M.Sc., B.Ed.', classTeacherOf: 'VIII-A', gender: 'Female', joiningDate: d('2019-04-01') },
  { employeeId: 'EMP-102', name: 'Rakesh Negi', email: 'rakesh@doonimperial.com', phone: '98XXXXXX12', designation: 'TGT Science', department: 'Science', subjects: 'Science, Physics', qualification: 'M.Sc. Physics, B.Ed.', classTeacherOf: 'IX-B', gender: 'Male', joiningDate: d('2017-07-10') },
  { employeeId: 'EMP-103', name: 'Sunita Bisht', email: 'sunita@doonimperial.com', phone: '98XXXXXX13', designation: 'PGT English', department: 'Languages', subjects: 'English', qualification: 'M.A. English, B.Ed.', classTeacherOf: 'X-A', gender: 'Female', joiningDate: d('2015-04-01') },
];

const STUDENTS = [
  ['DIS-2026-001', 'Aarav Sharma', 'VIII', 'A', '1', 'Red House', 'Boys Block A', '101', '1', 'Rajesh Sharma', 'Pooja Sharma', 'B+', '2012-05-14'],
  ['DIS-2026-004', 'Kabir Rana', 'VIII', 'A', '2', 'Blue House', 'Boys Block A', '101', '2', 'Vikram Rana', 'Neha Rana', 'O+', '2012-09-02'],
  ['DIS-2026-005', 'Ishaan Chauhan', 'VIII', 'A', '3', 'Green House', 'Boys Block A', '103', '1', 'Manoj Chauhan', 'Ritu Chauhan', 'A+', '2012-01-21'],
  ['DIS-2026-006', 'Reyansh Gupta', 'VIII', 'A', '4', 'Yellow House', 'Boys Block A', '103', '2', 'Anil Gupta', 'Sonia Gupta', 'AB+', '2012-11-30'],
  ['DIS-2026-002', 'Vihaan Singh', 'IX', 'B', '1', 'Green House', 'Boys Block A', '102', '2', 'Amit Singh', 'Kavita Singh', 'O+', '2011-03-08'],
  ['DIS-2026-007', 'Aditya Bhandari', 'IX', 'B', '2', 'Red House', 'Boys Block A', '104', '1', 'Harish Bhandari', 'Meena Bhandari', 'B-', '2011-06-17'],
  ['DIS-2026-008', 'Dhruv Kapoor', 'IX', 'B', '3', 'Blue House', 'Boys Block A', '104', '2', 'Sanjay Kapoor', 'Anjali Kapoor', 'A-', '2011-12-05'],
  ['DIS-2026-003', 'Arjun Thakur', 'X', 'A', '1', 'Yellow House', 'Boys Block B', '201', '1', 'Suresh Thakur', 'Asha Thakur', 'B+', '2010-08-25'],
  ['DIS-2026-009', 'Rudra Pant', 'X', 'A', '2', 'Green House', 'Boys Block B', '201', '2', 'Deepak Pant', 'Lata Pant', 'O-', '2010-02-11'],
  ['DIS-2026-010', 'Yash Mehra', 'X', 'A', '3', 'Red House', 'Boys Block B', '202', '1', 'Rohit Mehra', 'Shalini Mehra', 'A+', '2010-10-19'],
] as const;

const SUBJECTS: Record<string, string[]> = {
  VIII: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  IX: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  X: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
};

/** Last N weekdays (Mon–Sat) before today, as UTC-midnight dates. */
function schoolDays(n: number) {
  const out: Date[] = [];
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const cur = d(today);
  while (out.length < n) {
    cur.setUTCDate(cur.getUTCDate() - 1);
    if (cur.getUTCDay() !== 0) out.push(new Date(cur));
  }
  return out;
}

async function main() {
  // The school domain moved from @doonimperial.edu.in to @doonimperial.com; migrate any existing accounts.
  for (const table of ['User', 'Student', 'Teacher']) {
    const n = await prisma.$executeRawUnsafe(
      `UPDATE "${table}" SET email = replace(email, '@doonimperial.edu.in', '@doonimperial.com') WHERE email LIKE '%@doonimperial.edu.in'`,
    );
    if (n) console.log(`Moved ${n} ${table} email(s) to @doonimperial.com`);
  }

  await prisma.user.upsert({
    where: { email: 'admin@doonimperial.com' }, update: {},
    create: { email: 'admin@doonimperial.com', password: await bcrypt.hash('Admin@12345', 12), name: 'School Administrator', role: Role.ADMIN },
  });

  const teacherPw = await bcrypt.hash('Teacher@123', 12);
  for (const t of TEACHERS) {
    const row = await prisma.teacher.upsert({ where: { employeeId: t.employeeId }, update: t, create: t });
    await prisma.user.upsert({
      where: { email: t.email }, update: { teacherId: row.id },
      create: { email: t.email, password: teacherPw, name: t.name, role: Role.TEACHER, teacherId: row.id },
    });
  }

  const studentPw = await bcrypt.hash('Student@123', 12);
  const days = schoolDays(24);
  for (const [admissionNo, name, className, section, rollNo, house, hostelBlock, room, bed, fatherName, motherName, bloodGroup, dob] of STUDENTS) {
    const email = name.split(' ')[0].toLowerCase() + '@doonimperial.com';
    const data = {
      admissionNo, name, email, className, section, rollNo, house, hostelBlock, room, bed, fatherName, motherName, bloodGroup,
      dob: d(dob), gender: 'Male', parentName: fatherName, parentPhone: '98XXXXXX' + admissionNo.slice(-2), address: 'Dehradun, Uttarakhand',
    };
    const st = await prisma.student.upsert({ where: { admissionNo }, update: data, create: data });
    await prisma.user.upsert({ where: { email }, update: { studentId: st.id }, create: { email, password: studentPw, name, role: Role.STUDENT, studentId: st.id } });

    if (!(await prisma.transaction.count({ where: { studentId: st.id } }))) {
      await prisma.transaction.createMany({ data: [
        { studentId: st.id, type: TransactionType.CREDIT, category: 'Pocket Money Deposit', amount: 2500, note: 'Monthly allowance', date: days[20] },
        { studentId: st.id, type: TransactionType.DEBIT, category: 'Canteen', amount: 180, note: 'Snacks', date: days[15] },
        { studentId: st.id, type: TransactionType.DEBIT, category: 'Stationery', amount: 95, note: 'Notebooks', date: days[9] },
        { studentId: st.id, type: TransactionType.DEBIT, category: 'Laundry', amount: 150, date: days[4] },
      ] });
    }

    await prisma.attendance.createMany({
      data: days.map(date => {
        const r = rand();
        return { studentId: st.id, date, status: r < 0.08 ? AttendanceStatus.ABSENT : r < 0.14 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT, markedBy: 'Seed data' };
      }),
      skipDuplicates: true,
    });

    await prisma.mark.createMany({
      data: SUBJECTS[className].flatMap(subject => [
        { studentId: st.id, exam: 'Unit Test 1', subject, maxMarks: 50, marks: Math.round(28 + rand() * 21) },
        { studentId: st.id, exam: 'Half Yearly', subject, maxMarks: 100, marks: Math.round(55 + rand() * 43) },
      ]),
      skipDuplicates: true,
    });

    if (!(await prisma.feeRecord.count({ where: { studentId: st.id } }))) {
      const partial = rand() < 0.5;
      await prisma.feeRecord.createMany({ data: [
        { studentId: st.id, title: 'Tuition Fee – Term 1', amount: 45000, paid: 45000, status: 'PAID', dueDate: d('2026-04-15') },
        { studentId: st.id, title: 'Boarding & Lodging – Term 1', amount: 60000, paid: 60000, status: 'PAID', dueDate: d('2026-04-15') },
        { studentId: st.id, title: 'Tuition Fee – Term 2', amount: 45000, paid: partial ? 20000 : 0, status: partial ? 'PARTIAL' : 'PENDING', dueDate: d('2026-10-15') },
      ] });
    }
  }

  if (!(await prisma.leaveRequest.count())) {
    const pick = (no: string) => prisma.student.findUniqueOrThrow({ where: { admissionNo: no }, select: { id: true } });
    await prisma.leaveRequest.createMany({ data: [
      { studentId: (await pick('DIS-2026-001')).id, type: 'LEAVE', fromDate: d('2026-10-02'), toDate: d('2026-10-05'), reason: 'Cousin’s wedding in Haridwar. Father will pick up.' },
      { studentId: (await pick('DIS-2026-004')).id, type: 'OUTING', fromDate: d('2026-09-27'), toDate: d('2026-09-27'), reason: 'Day outing with parents on Sunday.' },
      { studentId: (await pick('DIS-2026-002')).id, type: 'LEAVE', fromDate: d('2026-09-12'), toDate: d('2026-09-14'), reason: 'Medical check-up at home.', status: 'APPROVED', reviewedBy: 'Rakesh Negi' },
    ] });
  }

  if (!(await prisma.notice.count({ where: { audience: 'TEACHERS' } }))) {
    await prisma.notice.createMany({ data: [
      { title: 'Half Yearly marks submission', body: 'All subject teachers must submit Half Yearly marks in the ERP by 30 September.', audience: 'TEACHERS', postedBy: 'School Administrator' },
      { title: 'Parent–Teacher Meeting', body: 'PTM for Classes VIII–X will be held on Saturday, 4 October, 10:00 AM – 1:00 PM in the main auditorium.', audience: 'ALL', postedBy: 'School Administrator' },
      { title: 'Inter-House Football Championship', body: 'Trials begin Monday at 4:30 PM on the main ground. House captains to submit team lists by Friday.', audience: 'STUDENTS', postedBy: 'Sports Department' },
    ] });
  }
  if (!(await prisma.notice.count())) {
    await prisma.notice.createMany({ data: [
      { title: 'Welcome to Doon Imperial ERP', body: 'Student information, attendance, academics, fees and boarding records are now available in one place.', audience: 'ALL' },
      { title: 'Boarding House Reminder', body: 'Students must report to their house/hostel roll call at the scheduled evening time.', audience: 'STUDENTS' },
    ] });
  }
  console.log('Seed complete.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
