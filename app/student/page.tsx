import { redirect } from 'next/navigation';
import { CalendarCheck, IndianRupee, Wallet, Megaphone, Award, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { attendanceSummary, feeSummary, walletBalance, resultsFor, noticesFor } from '@/lib/data';
import { classLabel, fmtDate, grade, greeting, inr } from '@/lib/format';
import { StudentProfileCard } from '@/components/ProfileCard';
import NoticeList from '@/components/NoticeList';
import ModuleTiles from '@/components/ModuleTiles';
import { CardHead, Empty } from '@/components/ui';

export const metadata = { title: 'Student Dashboard' };

export default async function StudentHome() {
  const s = await requireRole('STUDENT');
  const st = await prisma.student.findUnique({ where: { id: s.studentId || '' } });
  if (!st) redirect('/login');
  const [att, fee, wallet, results, notices, tx, nextDue] = await Promise.all([
    attendanceSummary(st.id), feeSummary(st.id), walletBalance(st.id), resultsFor(st.id), noticesFor('STUDENT', 3),
    prisma.transaction.findMany({ where: { studentId: st.id }, orderBy: { date: 'desc' }, take: 4 }),
    prisma.feeRecord.findFirst({ where: { studentId: st.id, status: { not: 'PAID' } }, orderBy: { dueDate: 'asc' } }),
  ]);
  const latest = results.at(-1);

  return (
    <>
      <section className="welcome">
        <div>
          <div className="eyebrow">Student Portal · Class {classLabel(st)}</div>
          <h2>{greeting()}, {st.name.split(' ')[0]}</h2>
          <p>Your attendance, results, fees and notices, all in one place.</p>
        </div>
        <div className="welcome-chips">
          <div className="chip-glass"><small>Attendance</small><b>{att.pct}%</b></div>
          <div className="chip-glass"><small>Wallet balance</small><b>{inr(wallet.balance)}</b></div>
        </div>
      </section>

      <div className="grid g-profile">
        <StudentProfileCard s={st} />

        <div>
          <ModuleTiles role="STUDENT" />

          <div className="grid g-3 mt">
            <div className="card">
              <CardHead icon={CalendarCheck} title="Attendance" href="/student/attendance" linkText="Details" />
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div className="ring" style={{ ['--p' as string]: att.pct }}><div><b>{att.pct}%</b><small>present</small></div></div>
                <div style={{ flex: 1 }}>
                  <div className="kv"><span>Present</span><b>{att.present}</b></div>
                  <div className="kv"><span>Late</span><b>{att.late}</b></div>
                  <div className="kv"><span>Absent</span><b>{att.absent}</b></div>
                </div>
              </div>
            </div>

            <div className="card">
              <CardHead icon={IndianRupee} title="Fees" href="/student/fees" linkText="Details" />
              <div className="card-body">
                <div className="stat-label">Balance due</div>
                <div className="stat-value" style={{ color: fee.due > 0 ? 'var(--maroon-700)' : 'var(--green)' }}>{inr(fee.due)}</div>
                <div className="meter gold" style={{ margin: '12px 0 8px' }}><i style={{ width: (fee.billed ? (fee.paid / fee.billed) * 100 : 0) + '%' }} /></div>
                <div className="small muted">{inr(fee.paid)} paid of {inr(fee.billed)}</div>
                {nextDue && <div className="small" style={{ marginTop: 8 }}>Next: <b>{nextDue.title}</b>{nextDue.dueDate && ` · due ${fmtDate(nextDue.dueDate)}`}</div>}
              </div>
            </div>

            <div className="card">
              <CardHead icon={Award} title="Latest result" href="/student/results" linkText="All results" />
              <div className="card-body">
                {latest ? (
                  <>
                    <div className="stat-label">{latest.exam}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                      <div className="stat-value">{latest.pct}%</div><span className="grade">{grade(latest.pct)}</span>
                    </div>
                    <div className="small muted" style={{ marginTop: 4 }}>{latest.got} / {latest.max} marks · {latest.rows.length} subjects</div>
                  </>
                ) : <Empty title="No results yet" />}
              </div>
            </div>
          </div>

          <div className="grid g-2 mt">
            <div className="card">
              <CardHead icon={Megaphone} title="Circular notices" href="/student/notices" linkText="More" />
              <div className="card-body"><NoticeList notices={notices} compact /></div>
            </div>
            <div className="card">
              <CardHead icon={Wallet} title="Recent wallet activity" href="/student/wallet" linkText="More" />
              <div className="card-body">
                {tx.length ? tx.map(x => (
                  <div className="list-item" key={x.id} style={{ alignItems: 'center' }}>
                    <div className={'stat-ico ' + (x.type === 'CREDIT' ? 'green' : '')} style={{ width: 36, height: 36 }}>{x.type === 'CREDIT' ? <ArrowDownLeft /> : <ArrowUpRight />}</div>
                    <div style={{ flex: 1 }}><h4>{x.category}</h4><p>{fmtDate(x.date)}{x.note ? ` · ${x.note}` : ''}</p></div>
                    <b className="num" style={{ color: x.type === 'CREDIT' ? 'var(--green)' : 'var(--ink)' }}>{x.type === 'CREDIT' ? '+' : '−'}{inr(x.amount)}</b>
                  </div>
                )) : <Empty title="No transactions yet" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
