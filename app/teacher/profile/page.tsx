import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { photoUrl } from '@/lib/photo';
import { TeacherProfileCard } from '@/components/ProfileCard';
import { ProfileEditForm, PasswordForm } from '@/components/AccountForms';
import { PageHeader, Flash, type SP } from '@/components/ui';

export const metadata = { title: 'My Profile' };

export default async function TeacherProfile({ searchParams }: { searchParams: SP }) {
  const s = await requireRole('TEACHER');
  const t = await prisma.teacher.findUnique({ where: { id: s.teacherId || '' } });
  if (!t) redirect('/login');
  return (
    <>
      <PageHeader eyebrow="Account" title="My profile" sub="Other details can be updated by the school office." />
      <Flash sp={searchParams} />
      <div className="grid g-profile">
        <TeacherProfileCard t={t} />
        <div className="grid g-2" style={{ alignItems: 'start' }}>
          <ProfileEditForm photo={photoUrl('teacher', t.id, t.updatedAt)} phone={t.phone} />
          <PasswordForm />
        </div>
      </div>
    </>
  );
}
