import { CalendarCheck, IndianRupee, Wallet, Award, ClipboardList } from 'lucide-react';
import { Stat, CardHead, Badge, Empty } from './ui';
import { prisma } from '@/lib/prisma';
import { attendanceSummary, feeSummary, walletBalance, resultsFor } from '@/lib/data';
import { fmtDate, inr, grade } from '@/lib/format';

/** Attendance, fees, wallet and results for one student. */
export default async function StudentInsights({ studentId, showMoney = true }: { studentId: string; showMoney?: boolean }) {
  const [att, fee, wallet, results, recent] = await Promise.all([
    attendanceSummary(studentId), feeSummary(studentId), walletBalance(studentId), resultsFor(studentId),
    prisma.attendance.findMany({ where: { studentId }, orderBy: { date: 'desc' }, take: 7 }),
  ]);
  const latest = results.at(-1);

  return (
    <>
      <div className={'grid ' + (showMoney ? 'g-4' : 'g-2')}>
        <Stat icon={CalendarCheck} label="Attendance" value={att.pct + '%'} sub={`${att.present + att.late} of ${att.total} days`} tone="green" />
        <Stat icon={Award} label="Latest result" value={latest ? latest.pct + '%' : '—'} sub={latest?.exam || 'No results yet'} tone="gold" />
        {showMoney && <Stat icon={IndianRupee} label="Fee due" value={inr(fee.due)} sub={`of ${inr(fee.billed)} billed`} />}
        {showMoney && <Stat icon={Wallet} label="Wallet balance" value={inr(wallet.balance)} sub={`${inr(wallet.debit)} spent`} tone="blue" />}
      </div>

      <div className="grid g-2 mt">
        <div className="card">
          <CardHead icon={CalendarCheck} title="Recent attendance" />
          {recent.length ? (
            <table className="table"><tbody>
              {recent.map(a => <tr key={a.id}><td>{fmtDate(a.date)}</td><td><Badge v={a.status} /></td><td className="small muted">{a.note || ''}</td></tr>)}
            </tbody></table>
          ) : <Empty title="No attendance recorded" />}
        </div>
        <div className="card">
          <CardHead icon={ClipboardList} title={latest ? `Result · ${latest.exam}` : 'Results'} />
          {latest ? (
            <table className="table">
              <thead><tr><th>Subject</th><th className="r">Marks</th><th className="r">Grade</th></tr></thead>
              <tbody>
                {latest.rows.map(m => (
                  <tr key={m.id}><td>{m.subject}</td><td className="r num">{Number(m.marks)} / {m.maxMarks}</td><td className="r"><span className="grade">{grade((Number(m.marks) / m.maxMarks) * 100)}</span></td></tr>
                ))}
              </tbody>
            </table>
          ) : <Empty title="No marks entered yet" />}
        </div>
      </div>
    </>
  );
}
