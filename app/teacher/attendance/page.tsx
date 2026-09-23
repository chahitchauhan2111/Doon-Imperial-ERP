import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { getClasses } from '@/lib/data';
import { todayISO } from '@/lib/format';
import AttendanceSheet from '@/components/AttendanceSheet';
import { PageHeader, Flash, Empty, q, type SP } from '@/components/ui';

export const metadata = { title: 'Attendance' };

export default async function TeacherAttendance({ searchParams }: { searchParams: SP }) {
  const s = await requireRole('TEACHER');
  const [t, classes] = await Promise.all([prisma.teacher.findUnique({ where: { id: s.teacherId || '' }, select: { classTeacherOf: true } }), getClasses()]);
  const cls = q(searchParams, 'class') || (t?.classTeacherOf && classes.includes(t.classTeacherOf) ? t.classTeacherOf : classes[0]) || '';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(q(searchParams, 'date')) ? q(searchParams, 'date') : todayISO();
  return (
    <>
      <PageHeader eyebrow="My Class" title="Take attendance" sub="Everyone is marked Present by default. Change the ones who are absent or late, then save." />
      <Flash sp={searchParams} />
      {classes.length ? <AttendanceSheet basePath="/teacher/attendance" classes={classes} cls={cls} date={date} /> : <div className="card"><Empty title="No classes yet" /></div>}
    </>
  );
}
