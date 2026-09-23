import { Receipt, CheckCircle2, AlertTriangle } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { feeSummary } from '@/lib/data';
import { fmtDate, inr } from '@/lib/format';
import { PageHeader, Stat, Badge, Empty } from '@/components/ui';

export const metadata = { title: 'Fees' };

export default async function StudentFees() {
  const s = await requireRole('STUDENT');
  const id = s.studentId || '';
  const [sum, fees] = await Promise.all([feeSummary(id), prisma.feeRecord.findMany({ where: { studentId: id }, orderBy: [{ dueDate: 'desc' }, { createdAt: 'desc' }] })]);
  const now = new Date();
  return (
    <>
      <PageHeader eyebrow="Accounts" title="Fee statement" sub="For payments or queries please contact the accounts office." />
      <div className="grid g-3">
        <Stat icon={Receipt} label="Total billed" value={inr(sum.billed)} />
        <Stat icon={CheckCircle2} label="Paid" value={inr(sum.paid)} tone="green" />
        <Stat icon={AlertTriangle} label="Balance due" value={inr(sum.due)} tone="gold" />
      </div>
      <div className="card mt">
        {fees.length ? (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Fee head</th><th>Due date</th><th className="r">Amount</th><th className="r">Paid</th><th className="r">Balance</th><th>Status</th></tr></thead>
            <tbody>{fees.map(f => {
              const due = Number(f.amount) - Number(f.paid);
              return (
                <tr key={f.id}>
                  <td><b style={{ fontWeight: 600 }}>{f.title}</b></td>
                  <td className="num">{fmtDate(f.dueDate)}</td>
                  <td className="r num">{inr(f.amount)}</td>
                  <td className="r num">{inr(f.paid)}</td>
                  <td className="r num" style={{ fontWeight: 600 }}>{inr(due)}</td>
                  <td><Badge v={f.status !== 'PAID' && f.dueDate && f.dueDate < now ? 'OVERDUE' : f.status} /></td>
                </tr>
              );
            })}</tbody>
          </table></div>
        ) : <Empty title="No fee records" />}
      </div>
    </>
  );
}
