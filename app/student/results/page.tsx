import { Award } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { resultsFor } from '@/lib/data';
import { grade } from '@/lib/format';
import { PageHeader, CardHead, Empty } from '@/components/ui';

export const metadata = { title: 'Results' };

export default async function StudentResults() {
  const s = await requireRole('STUDENT');
  const exams = (await resultsFor(s.studentId || '')).reverse();
  return (
    <>
      <PageHeader eyebrow="Academics" title="Examination results" sub="Subject-wise marks and grades as entered by your teachers." />
      {exams.length ? exams.map(e => (
        <div className="card exam-block" key={e.exam}>
          <CardHead icon={Award} title={e.exam}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="small muted">{e.got} / {e.max}</span><b>{e.pct}%</b><span className="grade">{grade(e.pct)}</span></div>
          </CardHead>
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Subject</th><th className="r">Marks</th><th style={{ width: '35%' }}>Score</th><th className="r">Grade</th></tr></thead>
            <tbody>{e.rows.map(m => {
              const p = (Number(m.marks) / m.maxMarks) * 100;
              return (
                <tr key={m.id}>
                  <td><b style={{ fontWeight: 600 }}>{m.subject}</b></td>
                  <td className="r num">{Number(m.marks)} / {m.maxMarks}</td>
                  <td><div className="meter"><i style={{ width: p + '%' }} /></div></td>
                  <td className="r"><span className="grade">{grade(p)}</span></td>
                </tr>
              );
            })}</tbody>
          </table></div>
        </div>
      )) : <div className="card"><Empty title="No results published yet" text="Results appear here once your teachers enter marks." /></div>}
    </>
  );
}
