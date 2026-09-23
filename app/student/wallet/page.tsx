import { Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { walletBalance } from '@/lib/data';
import { fmtDate, inr } from '@/lib/format';
import { PageHeader, Stat, Badge, Empty } from '@/components/ui';

export const metadata = { title: 'Wallet' };

export default async function StudentWallet() {
  const s = await requireRole('STUDENT');
  const id = s.studentId || '';
  const [w, tx] = await Promise.all([walletBalance(id), prisma.transaction.findMany({ where: { studentId: id }, orderBy: { date: 'desc' }, take: 200 })]);
  return (
    <>
      <PageHeader eyebrow="Accounts" title="My wallet" sub="Pocket money deposited by parents and your spending on campus." />
      <div className="grid g-3">
        <Stat icon={Wallet} label="Current balance" value={inr(w.balance)} tone="gold" />
        <Stat icon={ArrowDownLeft} label="Total deposits" value={inr(w.credit)} tone="green" />
        <Stat icon={ArrowUpRight} label="Total spent" value={inr(w.debit)} />
      </div>
      <div className="card mt">
        {tx.length ? (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Date</th><th>Category</th><th>Type</th><th>Note</th><th className="r">Amount</th></tr></thead>
            <tbody>{tx.map(x => (
              <tr key={x.id}>
                <td className="num muted">{fmtDate(x.date)}</td>
                <td><b style={{ fontWeight: 600 }}>{x.category}</b></td>
                <td><Badge v={x.type} label={x.type === 'CREDIT' ? 'Deposit' : 'Spent'} /></td>
                <td className="small muted">{x.note || '—'}</td>
                <td className="r num" style={{ fontWeight: 600, color: x.type === 'CREDIT' ? 'var(--green)' : 'var(--ink)' }}>{x.type === 'CREDIT' ? '+' : '−'}{inr(x.amount)}</td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : <Empty title="No transactions yet" />}
      </div>
    </>
  );
}
