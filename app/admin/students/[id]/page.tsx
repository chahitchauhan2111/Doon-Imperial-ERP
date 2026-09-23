import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { photoUrl } from '@/lib/photo';
import { classLabel } from '@/lib/format';
import { StudentProfileCard } from '@/components/ProfileCard';
import StudentInsights from '@/components/StudentInsights';
import { StudentForm } from '@/components/PersonForms';
import SubmitButton from '@/components/SubmitButton';
import { PageHeader, Flash, q, type SP } from '@/components/ui';
import { deleteStudent } from '@/app/actions/admin';

export default async function StudentDetail({ params, searchParams }: { params: { id: string }; searchParams: SP }) {
  const s = await prisma.student.findUnique({ where: { id: params.id } });
  if (!s) notFound();
  const tab = q(searchParams, 'tab') === 'edit' ? 'edit' : 'overview';
  const photo = photoUrl('student', s.id, s.updatedAt);

  return (
    <>
      <PageHeader eyebrow={`Class ${classLabel(s)}`} title={s.name} sub={`Admission no. ${s.admissionNo}`}>
        <Link href="/admin/students" className="btn btn-outline"><ArrowLeft />All students</Link>
      </PageHeader>
      <Flash sp={searchParams} />
      <div className="tabs">
        <Link href={`/admin/students/${s.id}`} className={tab === 'overview' ? 'on' : ''}>Overview</Link>
        <Link href={`/admin/students/${s.id}?tab=edit`} className={tab === 'edit' ? 'on' : ''}>Edit details & photo</Link>
      </div>

      {tab === 'overview' ? (
        <div className="grid g-profile">
          <StudentProfileCard s={s} />
          <div><StudentInsights studentId={s.id} /></div>
        </div>
      ) : (
        <>
          <StudentForm s={s} photo={photo} />
          <form action={deleteStudent} className="card card-body mt" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <input type="hidden" name="id" value={s.id} />
            <div><b>Delete this student</b><div className="small muted">Removes the student, their login and all attendance, fee, wallet and result records. Mark as Inactive instead to keep history.</div></div>
            <SubmitButton className="btn btn-danger" confirm={`Permanently delete ${s.name} and all their records?`} pendingText="Deleting…"><Trash2 />Delete student</SubmitButton>
          </form>
        </>
      )}
    </>
  );
}
