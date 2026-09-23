import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarCheck, Megaphone, Users, Clock } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { classWhere, noticesFor } from '@/lib/data';
import { dayStart, greeting, pct, todayISO } from '@/lib/format';
import { TeacherProfileCard } from '@/components/ProfileCard';
import NoticeList from '@/components/NoticeList';
import ModuleTiles from '@/components/ModuleTiles';
import { Stat, CardHead, Empty } from '@/components/ui';

export const metadata = { title: 'Faculty Dashboard' };

export default async function TeacherHome() {
  const s = await requireRole('TEACHER');
  const t = await prisma.teacher.findUnique({ where: { id: s.teacherId || '' } });
  if (!t) redirect('/login');
  const cls = t.classTeacherOf;
  const where = cls ? { ...classWhere(cls), status: 'ACTIVE' } : null;
  const [strength, today, pending, notices] = await Promise.all([
    where ? prisma.student.count({ where }) : 0,
    where ? prisma.attendance.groupBy({ by: ['status'], where: { date: dayStart(todayISO()), student: where }, _count: true }) : [],
    where ? prisma.leaveRequest.count({ where: { status: 'PENDING', student: where } }) : 0,
    noticesFor('TEACHER', 4),
  ]);
  const marked = today.reduce((a, r) => a + r._count, 0);
  const present = today.filter(r => r.status !== 'ABSENT').reduce((a, r) => a + r._count, 0);

  return (
    <>
      <section className="welcome">
        <div>
          <div className="eyebrow">Faculty Portal</div>
          <h2>{greeting()}, {t.name.split(' ')[0]}</h2>
          <p>{cls ? `You are class teacher of ${cls}. ` : ''}{marked ? 'Today’s attendance has been recorded.' : cls ? 'Today’s attendance has not been taken yet.' : 'Take attendance and enter marks for any class.'}</p>
        </div>
        {cls && !marked && <Link href="/teacher/attendance" className="btn btn-primary"><CalendarCheck />Take attendance</Link>}
      </section>

      <div className="grid g-profile">
        <TeacherProfileCard t={t} />
        <div>
          <ModuleTiles role="TEACHER" />

          <div className="grid g-3 mt">
            <Stat icon={Users} label={cls ? `Class ${cls} strength` : 'Class teacher'} value={cls ? strength : '—'} sub={cls ? 'Active students' : 'Not assigned'} />
            <Stat icon={CalendarCheck} label="Present today" value={marked ? pct(present, marked) + '%' : '—'} sub={marked ? `${present} of ${marked}` : 'Not marked'} tone="green" />
            <Stat icon={Clock} label="Pending requests" value={pending} sub="Leave & outing" tone="gold" />
          </div>

          <div className="card mt">
            <CardHead icon={Megaphone} title="Notices for staff" href="/teacher/notices" />
            <div className="card-body">{notices.length ? <NoticeList notices={notices} compact /> : <Empty title="No notices" />}</div>
          </div>
        </div>
      </div>
    </>
  );
}
