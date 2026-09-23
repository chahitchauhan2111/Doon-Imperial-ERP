import { CalendarCheck, Save } from 'lucide-react';
import Avatar from './Avatar';
import SubmitButton from './SubmitButton';
import { Empty } from './ui';
import { prisma } from '@/lib/prisma';
import { classWhere } from '@/lib/data';
import { dayStart, fmtDate } from '@/lib/format';
import { photoUrl } from '@/lib/photo';
import { saveAttendance } from '@/app/actions/academic';

export default async function AttendanceSheet({ basePath, classes, cls, date }: { basePath: string; classes: string[]; cls: string; date: string }) {
  const students = cls
    ? await prisma.student.findMany({
        where: { ...classWhere(cls), status: 'ACTIVE' },
        orderBy: [{ rollNo: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, rollNo: true, admissionNo: true, updatedAt: true, attendances: { where: { date: dayStart(date) } } },
      })
    : [];
  const marked = students.filter(s => s.attendances.length).length;
  const count = (st: string) => students.filter(s => s.attendances[0]?.status === st).length;

  return (
    <div className="card">
      <form className="toolbar" method="get" action={basePath}>
        <div className="field"><label>Class</label>
          <select name="class" defaultValue={cls}>{classes.map(c => <option key={c}>{c}</option>)}</select>
        </div>
        <div className="field"><label>Date</label><input type="date" name="date" defaultValue={date} /></div>
        <button className="btn btn-outline">Load register</button>
        <div className="grow" />
        {students.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge b-gray">{marked}/{students.length} marked</span>
            <span className="badge b-green">{count('PRESENT')} present</span>
            <span className="badge b-red">{count('ABSENT')} absent</span>
            <span className="badge b-amber">{count('LATE')} late</span>
          </div>
        )}
      </form>

      {!students.length ? <Empty title="No students in this class" text="Choose another class to take attendance." /> : (
        <form action={saveAttendance}>
          <input type="hidden" name="class" value={cls} />
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="back" value={`${basePath}?class=${encodeURIComponent(cls)}&date=${date}`} />
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Roll</th><th>Student</th><th>Status</th><th>Remark</th></tr></thead>
              <tbody>
                {students.map(s => {
                  const cur = s.attendances[0]?.status || 'PRESENT';
                  return (
                    <tr key={s.id}>
                      <td className="num muted">{s.rollNo || '—'}</td>
                      <td><div className="person"><Avatar src={photoUrl('student', s.id, s.updatedAt)} name={s.name} size={34} /><div><b>{s.name}</b><small>{s.admissionNo}</small></div></div></td>
                      <td>
                        <div className="seg" role="radiogroup" aria-label={`Attendance for ${s.name}`}>
                          {([['PRESENT', 'p', 'Present'], ['ABSENT', 'a', 'Absent'], ['LATE', 'l', 'Late']] as const).map(([v, c, l]) => (
                            <label key={v}><input type="radio" name={'s_' + s.id} value={v} defaultChecked={cur === v} /><span className={c}>{l}</span></label>
                          ))}
                        </div>
                      </td>
                      <td><input className="input" name={'n_' + s.id} defaultValue={s.attendances[0]?.note || ''} placeholder="Optional" style={{ height: 34, minWidth: 160 }} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="card-head" style={{ borderTop: '1px solid var(--border-2)', borderBottom: 0 }}>
            <span className="small muted"><CalendarCheck size={14} style={{ verticalAlign: -2 }} /> {cls} · {fmtDate(dayStart(date))}</span>
            <SubmitButton><Save />Save attendance</SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
