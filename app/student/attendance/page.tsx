import { CalendarCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { attendanceSummary } from '@/lib/data';
import { fmtDate } from '@/lib/format';
import { PageHeader, Stat, CardHead, Badge, Empty } from '@/components/ui';

export const metadata = { title: 'Attendance' };

export default async function StudentAttendance() {
  const s = await requireRole('STUDENT');
  const id = s.studentId || '';
  const [sum, rows] = await Promise.all([
    attendanceSummary(id),
    prisma.attendance.findMany({ where: { studentId: id }, orderBy: { date: 'desc' }, take: 120 }),
  ]);
  // Group by month for a readable history.
  const months = new Map<string, typeof rows>();
  for (const r of rows) {
    const k = r.date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    months.set(k, [...(months.get(k) || []), r]);
  }

  return (
    <>
      <PageHeader eyebrow="Academics" title="My attendance" sub={sum.pct < 75 && sum.total ? 'Your attendance is below 75%. Please speak to your class teacher.' : 'Daily attendance recorded by your class teacher.'} />
      <div className="grid g-4">
        <Stat icon={CalendarCheck} label="Overall" value={sum.pct + '%'} sub={`${sum.total} working days`} tone="gold" />
        <Stat icon={CheckCircle2} label="Present" value={sum.present} tone="green" />
        <Stat icon={Clock} label="Late" value={sum.late} tone="blue" />
        <Stat icon={XCircle} label="Absent" value={sum.absent} />
      </div>
      {rows.length ? [...months.entries()].map(([m, list]) => (
        <div className="card mt" key={m}>
          <CardHead icon={CalendarCheck} title={m}>
            <span className="small muted">{list.filter(r => r.status !== 'ABSENT').length}/{list.length} days present</span>
          </CardHead>
          <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {list.slice().reverse().map(r => (
              <div key={r.id} title={`${fmtDate(r.date)} · ${r.status}${r.note ? ' · ' + r.note : ''}`}
                style={{ width: 64, padding: '8px 0', textAlign: 'center', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{r.date.getUTCDate()}</div>
                <div className="small muted" style={{ marginBottom: 4 }}>{r.date.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' })}</div>
                <Badge v={r.status} label={r.status[0]} />
              </div>
            ))}
          </div>
        </div>
      )) : <div className="card mt"><Empty title="No attendance recorded yet" /></div>}
    </>
  );
}
