import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { photoUrl } from '@/lib/photo';
import { getClasses } from '@/lib/data';
import { TeacherProfileCard } from '@/components/ProfileCard';
import { TeacherForm } from '@/components/PersonForms';
import SubmitButton from '@/components/SubmitButton';
import { PageHeader, Flash, type SP } from '@/components/ui';
import { deleteTeacher } from '@/app/actions/admin';

export default async function TeacherDetail({ params, searchParams }: { params: { id: string }; searchParams: SP }) {
  const [t, classes] = await Promise.all([prisma.teacher.findUnique({ where: { id: params.id } }), getClasses()]);
  if (!t) notFound();
  const photo = photoUrl('teacher', t.id, t.updatedAt);

  return (
    <>
      <PageHeader eyebrow={t.designation || 'Teacher'} title={t.name} sub={`Employee ID ${t.employeeId}`}>
        <Link href="/admin/teachers" className="btn btn-outline"><ArrowLeft />All teachers</Link>
      </PageHeader>
      <Flash sp={searchParams} />
      <div className="grid g-profile">
        <TeacherProfileCard t={t} />
        <div>
          <TeacherForm t={t} photo={photo} classes={classes} />
          <form action={deleteTeacher} className="card card-body mt" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <input type="hidden" name="id" value={t.id} />
            <div><b>Delete this teacher</b><div className="small muted">Removes the teacher and their login. Mark as Inactive instead to keep the record.</div></div>
            <SubmitButton className="btn btn-danger" confirm={`Permanently delete ${t.name}?`} pendingText="Deleting…"><Trash2 />Delete teacher</SubmitButton>
          </form>
        </div>
      </div>
    </>
  );
}
