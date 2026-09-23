import { getClasses } from '@/lib/data';
import { todayISO } from '@/lib/format';
import AttendanceSheet from '@/components/AttendanceSheet';
import { PageHeader, Flash, Empty, q, type SP } from '@/components/ui';

export const metadata = { title: 'Attendance' };

export default async function AdminAttendance({ searchParams }: { searchParams: SP }) {
  const classes = await getClasses();
  const cls = q(searchParams, 'class') || classes[0] || '';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(q(searchParams, 'date')) ? q(searchParams, 'date') : todayISO();
  return (
    <>
      <PageHeader eyebrow="Academics" title="Attendance register" sub="Mark or correct daily attendance for any class." />
      <Flash sp={searchParams} />
      {classes.length ? <AttendanceSheet basePath="/admin/attendance" classes={classes} cls={cls} date={date} /> : <div className="card"><Empty title="No classes yet" text="Add students first." /></div>}
    </>
  );
}
