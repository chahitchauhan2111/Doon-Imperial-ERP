import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { classWhere } from '@/lib/data';
import LeaveTable from '@/components/LeaveTable';
import { PageHeader, Flash, Empty, type SP } from '@/components/ui';

export const metadata = { title: 'Leave Requests' };

export default async function TeacherLeave({ searchParams }: { searchParams: SP }) {
  const s = await requireRole('TEACHER');
  const t = await prisma.teacher.findUnique({ where: { id: s.teacherId || '' }, select: { classTeacherOf: true } });
  const cls = t?.classTeacherOf;
  const rows = cls ? await prisma.leaveRequest.findMany({ where: { student: classWhere(cls) }, include: { student: true }, orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], take: 100 }) : [];
  return (
    <>
      <PageHeader eyebrow="My Class" title="Leave & outing requests" sub={cls ? `Requests from students of Class ${cls}.` : 'Only class teachers review requests.'} />
      <Flash sp={searchParams} />
      <div className="card">{cls ? <LeaveTable rows={rows} canReview /> : <Empty title="You are not a class teacher" text="The administrator can assign you a class." />}</div>
    </>
  );
}
