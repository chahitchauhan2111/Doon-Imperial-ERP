import Link from 'next/link';
import { GraduationCap, Users, CalendarCheck, IndianRupee, Megaphone, DoorOpen, UserPlus, School } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { getClasses, classWhere, noticesFor } from '@/lib/data';
import { classLabel, dayStart, fmtDate, greeting, inr, pct, todayISO } from '@/lib/format';
import { photoUrl } from '@/lib/photo';
import Avatar from '@/components/Avatar';
import NoticeList from '@/components/NoticeList';
import ModuleTiles from '@/components/ModuleTiles';
import LeaveTable from '@/components/LeaveTable';
import { Stat, CardHead, Empty } from '@/components/ui';

export const metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboard() {
  const s = await requireRole('ADMIN');
  const today = dayStart(todayISO());
  const [students, teachers, attToday, fees, notices, recent, leaves, classes] = await Promise.all([
    prisma.student.count({ where: { status: 'ACTIVE' } }),
    prisma.teacher.count({ where: { status: 'ACTIVE' } }),
    prisma.attendance.groupBy({ by: ['status'], where: { date: today }, _count: true }),
    prisma.feeRecord.aggregate({ _sum: { amount: true, paid: true } }),
    noticesFor('ADMIN', 4),
    prisma.student.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.leaveRequest.findMany({ where: { status: 'PENDING' }, include: { student: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
    getClasses(),
  ]);
  const strength = await Promise.all(classes.map(async c => ({ c, n: await prisma.student.count({ where: { ...classWhere(c), status: 'ACTIVE' } }) })));
  const maxN = Math.max(1, ...strength.map(x => x.n));
  const marked = attToday.reduce((a, r) => a + r._count, 0);
  const present = attToday.filter(r => r.status !== 'ABSENT').reduce((a, r) => a + r._count, 0);
  const billed = Number(fees._sum.amount || 0), paid = Number(fees._sum.paid || 0);

  return (
    <>
      <section className="welcome">
        <div>
          <div className="eyebrow">Administration</div>
          <h2>{greeting()}, {s.name}</h2>
          <p>Here is how Doon Imperial is doing today. Attendance, fees, boarding and notices at a glance.</p>
        </div>
        <div className="welcome-chips">
          <div className="chip-glass"><small>Academic session</small><b>2026–27</b></div>
          <div className="chip-glass"><small>Pending requests</small><b>{leaves.length}</b></div>
        </div>
      </section>

      <ModuleTiles role="ADMIN" />

      <div className="grid g-4 mt">
        <Stat icon={GraduationCap} label="Active students" value={students} sub={`${classes.length} classes`} />
        <Stat icon={Users} label="Teaching staff" value={teachers} sub="Active faculty" tone="blue" />
        <Stat icon={CalendarCheck} label="Present today" value={marked ? pct(present, marked) + '%' : '—'} sub={marked ? `${present} of ${marked} marked` : 'Not marked yet'} tone="green" />
        <Stat icon={IndianRupee} label="Fees collected" value={inr(paid)} sub={`${inr(billed - paid)} outstanding`} tone="gold" />
      </div>

      <div className="grid g-main mt">
        <div className="card">
          <CardHead icon={UserPlus} title="Recent admissions" href="/admin/students" />
          {recent.length ? (
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Student</th><th>Class</th><th>House</th><th>Admitted</th></tr></thead>
              <tbody>{recent.map(st => (
                <tr key={st.id}>
                  <td><Link href={`/admin/students/${st.id}`} className="person"><Avatar src={photoUrl('student', st.id, st.updatedAt)} name={st.name} size={34} /><div><b>{st.name}</b><small>{st.admissionNo}</small></div></Link></td>
                  <td>{classLabel(st)}</td><td>{st.house || '—'}</td><td className="muted">{fmtDate(st.createdAt)}</td>
                </tr>
              ))}</tbody>
            </table></div>
          ) : <Empty title="No students yet" text="Add your first student to get started." />}
        </div>
        <div className="card">
          <CardHead icon={Megaphone} title="Latest notices" href="/admin/notices" linkText="Manage" />
          <div className="card-body"><NoticeList notices={notices} compact /></div>
        </div>
      </div>

      <div className="grid g-main mt">
        <div className="card">
          <CardHead icon={DoorOpen} title="Pending leave & outing requests" href="/admin/leave" />
          <LeaveTable rows={leaves} canReview />
        </div>
        <div className="card">
          <CardHead icon={School} title="Class strength" />
          <div className="card-body">
            {strength.length ? strength.map(({ c, n }) => (
              <div key={c} style={{ marginBottom: 12 }}>
                <div className="kv" style={{ padding: '0 0 5px' }}><span>Class {c}</span><b>{n}</b></div>
                <div className="meter gold"><i style={{ width: (n / maxN) * 100 + '%' }} /></div>
              </div>
            )) : <Empty title="No classes yet" />}
          </div>
        </div>
      </div>
    </>
  );
}
