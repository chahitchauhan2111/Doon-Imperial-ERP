import { redirect } from 'next/navigation';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { creditSummary, creditPointsEnabled, type CreditSummary } from '@/lib/creditPoints';
import { PageHeader, Stat, Empty } from '@/components/ui';

export const metadata = { title: 'Credit Points' };

const signed = (n: number) => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);

export default async function StudentCredits() {
  const s = await requireRole('STUDENT');
  const st = await prisma.student.findUnique({ where: { id: s.studentId || '' }, select: { boardingNo: true } });
  if (!st) redirect('/login');

  let cp: CreditSummary | null = null, failed = false;
  if (st.boardingNo) {
    try { cp = await creditSummary(st.boardingNo); } catch (e) { console.error('Credit points lookup failed', e); failed = true; }
  }

  return (
    <>
      <PageHeader eyebrow="Conduct" title="My credit points" sub="Points given by your teachers for academics, behaviour, discipline and more." />
      {cp ? (
        <div className="grid g-3">
          <Stat icon={Trophy} label="Total credit points" value={signed(cp.total)} sub={`${cp.entries} ${cp.entries === 1 ? 'entry' : 'entries'}`} tone="gold" />
          <Stat icon={TrendingUp} label="Positive credit points" value={signed(cp.positive)} tone="green" />
          <Stat icon={TrendingDown} label="Negative credit points" value={signed(cp.negative)} />
        </div>
      ) : (
        <div className="card">
          {!creditPointsEnabled
            ? <Empty title="Credit points are coming soon" text="This section is not connected yet." />
            : failed
            ? <Empty title="Credit points are unavailable right now" text="Please try again in a minute." />
            : <Empty title="No credit points yet" text={st.boardingNo ? 'None of your teachers have given you credit points yet.' : 'Your boarding number has not been added yet. Please contact the school office.'} />}
        </div>
      )}
    </>
  );
}
