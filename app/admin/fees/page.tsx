import Link from 'next/link';
import { IndianRupee, Receipt, AlertTriangle, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getClasses } from '@/lib/data';
import { classLabel, fmtDate, inr } from '@/lib/format';
import { photoUrl } from '@/lib/photo';
import Avatar from '@/components/Avatar';
import SubmitButton from '@/components/SubmitButton';
import { PageHeader, Flash, Stat, CardHead, Badge, Empty, q, type SP } from '@/components/ui';
import { createFee, recordPayment, deleteFee } from '@/app/actions/admin';

export const metadata = { title: 'Fees' };

export default async function Fees({ searchParams }: { searchParams: SP }) {
  const show = q(searchParams, 'show') || 'due';
  const [classes, students, fees, totals] = await Promise.all([
    getClasses(),
    prisma.student.findMany({ where: { status: 'ACTIVE' }, orderBy: { name: 'asc' }, select: { id: true, name: true, admissionNo: true } }),
    prisma.feeRecord.findMany({ where: show === 'due' ? { status: { not: 'PAID' } } : {}, include: { student: true }, orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }], take: 200 }),
    prisma.feeRecord.aggregate({ _sum: { amount: true, paid: true }, _count: true }),
  ]);
  const billed = Number(totals._sum.amount || 0), paid = Number(totals._sum.paid || 0);
  const now = new Date();

  return (
    <>
      <PageHeader eyebrow="Finance" title="Fees" sub="Tuition, boarding and other school charges. Bill a student or a whole class." />
      <Flash sp={searchParams} />
      <div className="grid g-4">
        <Stat icon={Receipt} label="Total billed" value={inr(billed)} sub={`${totals._count} fee records`} />
        <Stat icon={CheckCircle2} label="Collected" value={inr(paid)} sub={billed ? Math.round((paid / billed) * 100) + '% collected' : ''} tone="green" />
        <Stat icon={AlertTriangle} label="Outstanding" value={inr(billed - paid)} tone="gold" />
        <Stat icon={IndianRupee} label="Open records" value={fees.filter(f => f.status !== 'PAID').length} sub="Awaiting payment" tone="blue" />
      </div>

      <div className="grid g-side mt">
        <div className="card">
          <CardHead icon={Receipt} title="Fee records">
            <div className="tabs" style={{ margin: 0, border: 0 }}>
              <Link href="/admin/fees?show=due" className={show === 'due' ? 'on' : ''}>Outstanding</Link>
              <Link href="/admin/fees?show=all" className={show === 'all' ? 'on' : ''}>All</Link>
            </div>
          </CardHead>
          {fees.length ? (
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Student</th><th>Fee head</th><th className="r">Amount</th><th className="r">Paid</th><th>Due date</th><th>Status</th><th className="r">Record payment</th></tr></thead>
              <tbody>{fees.map(f => {
                const due = Number(f.amount) - Number(f.paid);
                const overdue = f.status !== 'PAID' && f.dueDate && f.dueDate < now;
                return (
                  <tr key={f.id}>
                    <td><div className="person"><Avatar src={photoUrl('student', f.student.id, f.student.updatedAt)} name={f.student.name} size={32} /><div><b>{f.student.name}</b><small>{classLabel(f.student)}</small></div></div></td>
                    <td>{f.title}</td>
                    <td className="r num">{inr(f.amount)}</td>
                    <td className="r num">{inr(f.paid)}</td>
                    <td className="num">{fmtDate(f.dueDate)}</td>
                    <td><Badge v={overdue ? 'OVERDUE' : f.status} /></td>
                    <td className="r">
                      {due > 0 ? (
                        <form action={recordPayment} style={{ display: 'inline-flex', gap: 6 }}>
                          <input type="hidden" name="id" value={f.id} />
                          <input className="input num" name="pay" type="number" min={1} step="0.01" max={due} defaultValue={due} style={{ width: 110, height: 32 }} aria-label="Payment amount" />
                          <SubmitButton className="btn btn-sm btn-gold" pendingText="…">Pay</SubmitButton>
                        </form>
                      ) : (
                        <form action={deleteFee} style={{ display: 'inline' }}>
                          <input type="hidden" name="id" value={f.id} />
                          <SubmitButton className="btn btn-sm btn-ghost" confirm="Remove this fee record?" pendingText="…"><Trash2 /></SubmitButton>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}</tbody>
            </table></div>
          ) : <Empty title={show === 'due' ? 'Nothing outstanding' : 'No fee records yet'} text="Create a fee record using the form." />}
        </div>

        <div className="card">
          <CardHead icon={Plus} title="Create fee record" />
          <form action={createFee} className="card-body form">
            <div className="field"><label>Bill to</label>
              <select name="target" required defaultValue="">
                <option value="" disabled>Choose a class or student</option>
                <optgroup label="Whole class">{classes.map(c => <option key={c} value={'class:' + c}>Class {c} (all students)</option>)}</optgroup>
                <optgroup label="Single student">{students.map(s => <option key={s.id} value={s.id}>{s.name} · {s.admissionNo}</option>)}</optgroup>
              </select>
            </div>
            <div className="field"><label>Fee head</label>
              <input name="title" list="fee-heads" required placeholder="Tuition Fee – Term 2" />
              <datalist id="fee-heads">{['Tuition Fee', 'Boarding & Lodging', 'Mess Charges', 'Transport', 'Examination Fee', 'Annual Charges', 'Uniform & Books'].map(x => <option key={x} value={x} />)}</datalist>
            </div>
            <div className="form-grid">
              <div className="field"><label>Amount (₹)</label><input name="amount" type="number" min={1} step="0.01" required /></div>
              <div className="field"><label>Due date</label><input name="dueDate" type="date" /></div>
            </div>
            <SubmitButton className="btn btn-primary btn-block">Create</SubmitButton>
          </form>
        </div>
      </div>
    </>
  );
}
