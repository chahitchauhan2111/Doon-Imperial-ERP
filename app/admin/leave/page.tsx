import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import LeaveTable from '@/components/LeaveTable';
import { PageHeader, Flash, q, type SP } from '@/components/ui';

export const metadata = { title: 'Leave & Outing' };

const TABS = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const;

export default async function AdminLeave({ searchParams }: { searchParams: SP }) {
  const tab = (TABS as readonly string[]).includes(q(searchParams, 'status')) ? q(searchParams, 'status') : 'PENDING';
  const [rows, counts] = await Promise.all([
    prisma.leaveRequest.findMany({ where: tab === 'ALL' ? {} : { status: tab as 'PENDING' }, include: { student: true }, orderBy: { createdAt: 'desc' }, take: 200 }),
    prisma.leaveRequest.groupBy({ by: ['status'], _count: true }),
  ]);
  const n = (s: string) => (s === 'ALL' ? counts.reduce((a, c) => a + c._count, 0) : counts.find(c => c.status === s)?._count || 0);

  return (
    <>
      <PageHeader eyebrow="Boarding" title="Leave & outing" sub="Review home leave and day-outing requests from boarders." />
      <Flash sp={searchParams} />
      <div className="tabs">
        {TABS.map(t => <Link key={t} href={`/admin/leave?status=${t}`} className={tab === t ? 'on' : ''}>{t.charAt(0) + t.slice(1).toLowerCase()} ({n(t)})</Link>)}
      </div>
      <div className="card"><LeaveTable rows={rows} canReview /></div>
    </>
  );
}
