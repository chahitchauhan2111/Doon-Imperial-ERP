import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { classWhere, getClasses } from '@/lib/data';
import { photoUrl } from '@/lib/photo';
import Avatar from '@/components/Avatar';
import { PageHeader, Empty, q, type SP } from '@/components/ui';

export const metadata = { title: 'My Class' };

export default async function TeacherStudents({ searchParams }: { searchParams: SP }) {
  const s = await requireRole('TEACHER');
  const [t, classes] = await Promise.all([prisma.teacher.findUnique({ where: { id: s.teacherId || '' }, select: { classTeacherOf: true } }), getClasses()]);
  const cls = q(searchParams, 'class') || t?.classTeacherOf || classes[0] || '';
  const students = cls ? await prisma.student.findMany({ where: { ...classWhere(cls), status: 'ACTIVE' }, orderBy: [{ rollNo: 'asc' }, { name: 'asc' }] }) : [];

  return (
    <>
      <PageHeader eyebrow="My Class" title={cls ? `Class ${cls}` : 'Students'} sub={`${students.length} students${cls === t?.classTeacherOf ? ' · you are the class teacher' : ''}`}>
        <form method="get" style={{ display: 'flex', gap: 8 }}>
          <select className="input" name="class" defaultValue={cls} style={{ width: 140 }}>{classes.map(c => <option key={c}>{c}</option>)}</select>
          <button className="btn btn-outline">View</button>
        </form>
      </PageHeader>
      {students.length ? (
        <div className="grid g-4">
          {students.map(st => (
            <Link key={st.id} href={`/teacher/students/${st.id}`} className="tile" style={{ padding: '20px 14px' }}>
              <Avatar src={photoUrl('student', st.id, st.updatedAt)} name={st.name} size={72} />
              <div><div style={{ fontSize: 14 }}>{st.name}</div><div className="small muted" style={{ fontWeight: 500 }}>Roll {st.rollNo || '—'} · {st.admissionNo}</div></div>
            </Link>
          ))}
        </div>
      ) : <div className="card"><Empty title="No students in this class" /></div>}
    </>
  );
}
