import { Save } from 'lucide-react';
import Avatar from './Avatar';
import SubmitButton from './SubmitButton';
import { Empty } from './ui';
import { prisma } from '@/lib/prisma';
import { classWhere } from '@/lib/data';
import { photoUrl } from '@/lib/photo';
import { grade } from '@/lib/format';
import { saveMarks } from '@/app/actions/academic';

export const EXAMS = ['Unit Test 1', 'Half Yearly', 'Unit Test 2', 'Pre-Board', 'Annual Examination'];
export const SUBJECTS = ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'Sanskrit', 'Physics', 'Chemistry', 'Biology', 'Accountancy', 'Economics'];

export default async function MarksSheet({ basePath, classes, cls, exam, subject, max }: {
  basePath: string; classes: string[]; cls: string; exam: string; subject: string; max: number;
}) {
  const students = cls
    ? await prisma.student.findMany({
        where: { ...classWhere(cls), status: 'ACTIVE' },
        orderBy: [{ rollNo: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, rollNo: true, admissionNo: true, updatedAt: true, marks: { where: { exam, subject } } },
      })
    : [];
  const maxMarks = students.find(s => s.marks[0])?.marks[0].maxMarks || max;

  return (
    <div className="card">
      <form className="toolbar" method="get" action={basePath}>
        <div className="field"><label>Class</label><select name="class" defaultValue={cls}>{classes.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="field"><label>Examination</label><select name="exam" defaultValue={exam}>{EXAMS.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="field"><label>Subject</label><select name="subject" defaultValue={subject}>{SUBJECTS.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="field" style={{ minWidth: 110 }}><label>Max marks</label><input type="number" name="max" min={1} max={1000} defaultValue={maxMarks} /></div>
        <button className="btn btn-outline">Load</button>
      </form>

      {!students.length ? <Empty title="No students in this class" /> : (
        <form action={saveMarks}>
          <input type="hidden" name="class" value={cls} />
          <input type="hidden" name="exam" value={exam} />
          <input type="hidden" name="subject" value={subject} />
          <input type="hidden" name="maxMarks" value={maxMarks} />
          <input type="hidden" name="back" value={`${basePath}?class=${encodeURIComponent(cls)}&exam=${encodeURIComponent(exam)}&subject=${encodeURIComponent(subject)}&max=${maxMarks}`} />
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Roll</th><th>Student</th><th>Marks (out of {maxMarks})</th><th>Grade</th></tr></thead>
              <tbody>
                {students.map(s => {
                  const m = s.marks[0];
                  return (
                    <tr key={s.id}>
                      <td className="num muted">{s.rollNo || '—'}</td>
                      <td><div className="person"><Avatar src={photoUrl('student', s.id, s.updatedAt)} name={s.name} size={34} /><div><b>{s.name}</b><small>{s.admissionNo}</small></div></div></td>
                      <td><input className="input num" type="number" step="0.5" min={0} max={maxMarks} name={'m_' + s.id} defaultValue={m ? Number(m.marks) : ''} style={{ width: 110, height: 34 }} /></td>
                      <td>{m ? <span className="grade">{grade((Number(m.marks) / m.maxMarks) * 100)}</span> : <span className="muted small">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="card-head" style={{ borderTop: '1px solid var(--border-2)', borderBottom: 0 }}>
            <span className="small muted">{cls} · {exam} · {subject}. Leave a box empty to skip a student.</span>
            <SubmitButton><Save />Save marks</SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
