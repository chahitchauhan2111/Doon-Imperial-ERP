import Link from 'next/link';
import { BedDouble, Building2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { classLabel } from '@/lib/format';
import { photoUrl } from '@/lib/photo';
import Avatar from '@/components/Avatar';
import { PageHeader, Stat, CardHead, Empty } from '@/components/ui';

export const metadata = { title: 'Hostel' };

export default async function Hostel() {
  const students = await prisma.student.findMany({ where: { status: 'ACTIVE' }, orderBy: [{ hostelBlock: 'asc' }, { room: 'asc' }, { bed: 'asc' }] });
  const boarders = students.filter(s => s.hostelBlock);
  const blocks = [...new Set(boarders.map(s => s.hostelBlock!))];
  const houses = [...new Set(students.map(s => s.house).filter(Boolean))] as string[];

  return (
    <>
      <PageHeader eyebrow="Boarding" title="Hostel & houses" sub="Boarding blocks, rooms and bed allocation. Edit a student to change their room." />
      <div className="grid g-4">
        <Stat icon={BedDouble} label="Boarders" value={boarders.length} sub={`${students.length - boarders.length} day scholars`} />
        {blocks.slice(0, 3).map(b => <Stat key={b} icon={Building2} label={b} value={boarders.filter(s => s.hostelBlock === b).length} sub={`${new Set(boarders.filter(s => s.hostelBlock === b).map(s => s.room)).size} rooms in use`} tone="gold" />)}
      </div>

      {houses.length > 0 && (
        <div className="grid g-4 mt">
          {houses.map(h => {
            const n = students.filter(s => s.house === h).length;
            return (
              <div key={h} className="card card-pad">
                <div className="kv" style={{ padding: 0 }}><b>{h}</b><span>{n} students</span></div>
                <div className="meter mt" style={{ marginTop: 10 }}><i style={{ width: Math.round((n / students.length) * 100) + '%' }} /></div>
              </div>
            );
          })}
        </div>
      )}

      {blocks.length ? blocks.map(b => (
        <div className="card mt" key={b}>
          <CardHead icon={Building2} title={b} />
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Room</th><th>Bed</th><th>Student</th><th>Class</th><th>House</th><th>Parent contact</th></tr></thead>
            <tbody>{boarders.filter(s => s.hostelBlock === b).map(s => (
              <tr key={s.id}>
                <td className="num"><b>{s.room || '—'}</b></td>
                <td className="num">{s.bed || '—'}</td>
                <td><Link href={`/admin/students/${s.id}`} className="person"><Avatar src={photoUrl('student', s.id, s.updatedAt)} name={s.name} size={32} /><div><b>{s.name}</b><small>{s.admissionNo}</small></div></Link></td>
                <td>{classLabel(s)}</td><td>{s.house || '—'}</td><td>{s.parentPhone || '—'}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
      )) : <div className="card mt"><Empty title="No boarders allocated" text="Assign a hostel block and room from a student's profile." /></div>}
    </>
  );
}
