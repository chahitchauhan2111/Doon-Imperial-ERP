import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getClasses, classWhere } from '@/lib/data';
import { classLabel } from '@/lib/format';
import { photoUrl } from '@/lib/photo';
import Avatar from '@/components/Avatar';
import { PageHeader, Flash, Badge, Empty, q, type SP } from '@/components/ui';

export const metadata = { title: 'Students' };

export default async function Students({ searchParams }: { searchParams: SP }) {
  const term = q(searchParams, 'q'), cls = q(searchParams, 'class'), status = q(searchParams, 'status') || 'ACTIVE';
  const [classes, students] = await Promise.all([
    getClasses(),
    prisma.student.findMany({
      where: {
        ...(cls && classWhere(cls)),
        ...(status !== 'ALL' && { status }),
        ...(term && { OR: [{ name: { contains: term, mode: 'insensitive' } }, { admissionNo: { contains: term, mode: 'insensitive' } }, { boardingNo: { contains: term, mode: 'insensitive' } }, { email: { contains: term, mode: 'insensitive' } }] }),
      },
      orderBy: [{ className: 'asc' }, { section: 'asc' }, { name: 'asc' }],
    }),
  ]);

  return (
    <>
      <PageHeader eyebrow="People" title="Students" sub="Student profiles, photos, parents and boarding allocation.">
        <Link href="/admin/students/new" className="btn btn-primary"><Plus />Add student</Link>
      </PageHeader>
      <Flash sp={searchParams} />
      <div className="card">
        <form className="toolbar" method="get">
          <div className="field grow"><label>Search</label>
            <div className="input-ico"><Search /><input name="q" defaultValue={term} placeholder="Name, admission no. or email" /></div>
          </div>
          <div className="field"><label>Class</label>
            <select name="class" defaultValue={cls}><option value="">All classes</option>{classes.map(c => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="field"><label>Status</label>
            <select name="status" defaultValue={status}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="ALL">All</option></select>
          </div>
          <button className="btn btn-outline">Apply</button>
        </form>
        {students.length ? (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Student</th><th>Class</th><th>Boarding no.</th><th>House</th><th>Hostel</th><th>Parent contact</th><th>Status</th></tr></thead>
            <tbody>{students.map(s => (
              <tr key={s.id}>
                <td><Link href={`/admin/students/${s.id}`} className="person"><Avatar src={photoUrl('student', s.id, s.updatedAt)} name={s.name} size={38} /><div><b>{s.name}</b><small>{s.admissionNo}</small></div></Link></td>
                <td>{classLabel(s)}</td>
                <td className="num">{s.boardingNo || '—'}</td>
                <td>{s.house || '—'}</td>
                <td>{s.hostelBlock ? `${s.hostelBlock}${s.room ? ' · ' + s.room : ''}` : '—'}</td>
                <td>{s.parentPhone || '—'}<div className="small muted">{s.fatherName || s.parentName || ''}</div></td>
                <td><Badge v={s.status} /></td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : <Empty title="No students found" text="Try a different search or add a new student." />}
        <div className="card-head" style={{ borderTop: '1px solid var(--border-2)', borderBottom: 0 }}><span className="small muted">{students.length} student{students.length === 1 ? '' : 's'}</span></div>
      </div>
    </>
  );
}
