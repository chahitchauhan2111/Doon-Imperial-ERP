import Link from 'next/link';
import { Plus, Search, Mail, Phone } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { photoUrl } from '@/lib/photo';
import Avatar from '@/components/Avatar';
import { PageHeader, Flash, Badge, Empty, q, type SP } from '@/components/ui';

export const metadata = { title: 'Teachers' };

export default async function Teachers({ searchParams }: { searchParams: SP }) {
  const term = q(searchParams, 'q');
  const teachers = await prisma.teacher.findMany({
    where: term ? { OR: [{ name: { contains: term, mode: 'insensitive' } }, { employeeId: { contains: term, mode: 'insensitive' } }, { subjects: { contains: term, mode: 'insensitive' } }] } : {},
    orderBy: { name: 'asc' },
  });

  return (
    <>
      <PageHeader eyebrow="People" title="Teachers" sub="Faculty profiles, subjects and class-teacher assignments.">
        <Link href="/admin/teachers/new" className="btn btn-primary"><Plus />Add teacher</Link>
      </PageHeader>
      <Flash sp={searchParams} />
      <div className="card" style={{ marginBottom: 18 }}>
        <form className="toolbar" method="get" style={{ borderBottom: 0 }}>
          <div className="field grow"><label>Search</label><div className="input-ico"><Search /><input name="q" defaultValue={term} placeholder="Name, employee ID or subject" /></div></div>
          <button className="btn btn-outline">Search</button>
        </form>
      </div>
      {teachers.length ? (
        <div className="grid g-3">
          {teachers.map(t => (
            <Link key={t.id} href={`/admin/teachers/${t.id}`} className="card card-pad tile" style={{ alignItems: 'stretch', textAlign: 'left', gap: 14 }}>
              <div className="person">
                <Avatar src={photoUrl('teacher', t.id, t.updatedAt)} name={t.name} size={56} />
                <div style={{ minWidth: 0 }}><b style={{ fontSize: 15 }}>{t.name}</b><small>{t.designation || 'Teacher'} · {t.employeeId}</small></div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {t.classTeacherOf && <span className="badge b-maroon">Class teacher {t.classTeacherOf}</span>}
                <Badge v={t.status} />
              </div>
              <div className="small muted" style={{ fontWeight: 500, display: 'grid', gap: 4 }}>
                {t.subjects && <div>Subjects: <span style={{ color: 'var(--ink-2)' }}>{t.subjects}</span></div>}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Mail size={13} />{t.email}</div>
                {t.phone && <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Phone size={13} />{t.phone}</div>}
              </div>
            </Link>
          ))}
        </div>
      ) : <div className="card"><Empty title="No teachers found" text="Add teachers so they can take attendance and enter marks." /></div>}
    </>
  );
}
