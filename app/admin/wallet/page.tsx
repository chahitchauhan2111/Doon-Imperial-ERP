import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, ListOrdered } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { classLabel, fmtDate, inr, todayISO } from '@/lib/format';
import { photoUrl } from '@/lib/photo';
import Avatar from '@/components/Avatar';
import SubmitButton from '@/components/SubmitButton';
import { PageHeader, Flash, Stat, CardHead, Badge, Empty, q, type SP } from '@/components/ui';
import { addTransaction } from '@/app/actions/admin';

export const metadata = { title: 'Student Wallet' };

export default async function WalletPage({ searchParams }: { searchParams: SP }) {
  const sid = q(searchParams, 'student');
  const [students, tx, sums] = await Promise.all([
    prisma.student.findMany({ where: { status: 'ACTIVE' }, orderBy: { name: 'asc' }, select: { id: true, name: true, admissionNo: true } }),
    prisma.transaction.findMany({ where: sid ? { studentId: sid } : {}, include: { student: true }, orderBy: { date: 'desc' }, take: 100 }),
    prisma.transaction.groupBy({ by: ['type'], where: sid ? { studentId: sid } : {}, _sum: { amount: true }, _count: true }),
  ]);
  const credit = Number(sums.find(s => s.type === 'CREDIT')?._sum.amount || 0);
  const debit = Number(sums.find(s => s.type === 'DEBIT')?._sum.amount || 0);

  return (
    <>
      <PageHeader eyebrow="Finance" title="Student wallet" sub="Pocket money deposits and spending on canteen, stationery, laundry, outings and more." />
      <Flash sp={searchParams} />
      <div className="grid g-4">
        <Stat icon={ArrowDownLeft} label="Deposits" value={inr(credit)} tone="green" />
        <Stat icon={ArrowUpRight} label="Spending" value={inr(debit)} />
        <Stat icon={Wallet} label="Balance" value={inr(credit - debit)} tone="gold" />
        <Stat icon={ListOrdered} label="Transactions" value={sums.reduce((a, s) => a + s._count, 0)} tone="blue" />
      </div>

      <div className="grid g-side mt">
        <div className="card">
          <form className="toolbar" method="get">
            <div className="field grow"><label>Filter by student</label>
              <select name="student" defaultValue={sid}><option value="">All students</option>{students.map(s => <option key={s.id} value={s.id}>{s.name} · {s.admissionNo}</option>)}</select>
            </div>
            <button className="btn btn-outline">Apply</button>
          </form>
          {tx.length ? (
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Date</th><th>Student</th><th>Category</th><th>Type</th><th className="r">Amount</th><th>Note</th></tr></thead>
              <tbody>{tx.map(x => (
                <tr key={x.id}>
                  <td className="num muted">{fmtDate(x.date)}</td>
                  <td><div className="person"><Avatar src={photoUrl('student', x.student.id, x.student.updatedAt)} name={x.student.name} size={30} /><div><b>{x.student.name}</b><small>{classLabel(x.student)}</small></div></div></td>
                  <td>{x.category}</td>
                  <td><Badge v={x.type} label={x.type === 'CREDIT' ? 'Deposit' : 'Spent'} /></td>
                  <td className="r num" style={{ fontWeight: 600, color: x.type === 'CREDIT' ? 'var(--green)' : 'var(--ink)' }}>{x.type === 'CREDIT' ? '+' : '−'}{inr(x.amount)}</td>
                  <td className="small muted">{x.note || '—'}{x.receiptNo && <div>Receipt {x.receiptNo}</div>}</td>
                </tr>
              ))}</tbody>
            </table></div>
          ) : <Empty title="No transactions" />}
        </div>

        <div className="card">
          <CardHead icon={Plus} title="Add transaction" />
          <form action={addTransaction} className="card-body form">
            <div className="field"><label>Student</label>
              <select name="studentId" required defaultValue={sid}><option value="" disabled>Choose student</option>{students.map(s => <option key={s.id} value={s.id}>{s.name} · {s.admissionNo}</option>)}</select>
            </div>
            <div className="field"><label>Type</label>
              <select name="type" defaultValue="DEBIT"><option value="DEBIT">Spending (debit)</option><option value="CREDIT">Deposit (credit)</option></select>
            </div>
            <div className="field"><label>Category</label>
              <input name="category" list="wallet-cats" required placeholder="Canteen" />
              <datalist id="wallet-cats">{['Pocket Money Deposit', 'Canteen', 'Stationery', 'Laundry', 'Medical', 'Outing', 'Haircut', 'Sports Kit', 'Excursion'].map(x => <option key={x} value={x} />)}</datalist>
            </div>
            <div className="form-grid">
              <div className="field"><label>Amount (₹)</label><input name="amount" type="number" min={1} step="0.01" required /></div>
              <div className="field"><label>Date</label><input name="date" type="date" defaultValue={todayISO()} /></div>
            </div>
            <div className="field"><label>Receipt no.</label><input name="receiptNo" /></div>
            <div className="field"><label>Note</label><input name="note" /></div>
            <SubmitButton className="btn btn-primary btn-block">Add transaction</SubmitButton>
          </form>
        </div>
      </div>
    </>
  );
}
