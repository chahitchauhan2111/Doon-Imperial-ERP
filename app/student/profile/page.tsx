import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { photoUrl } from '@/lib/photo';
import { StudentProfileCard } from '@/components/ProfileCard';
import { ProfileEditForm, PasswordForm } from '@/components/AccountForms';
import { PageHeader, Flash, type SP } from '@/components/ui';

export const metadata = { title: 'My Profile' };

export default async function StudentProfile({ searchParams }: { searchParams: SP }) {
  const s = await requireRole('STUDENT');
  const st = await prisma.student.findUnique({ where: { id: s.studentId || '' } });
  if (!st) redirect('/login');
  return (
    <>
      <PageHeader eyebrow="Account" title="My profile" sub="To correct other details, contact the school office." />
      <Flash sp={searchParams} />
      <div className="grid g-profile">
        <StudentProfileCard s={st} />
        <div className="grid g-2" style={{ alignItems: 'start' }}>
          <ProfileEditForm photo={photoUrl('student', st.id, st.updatedAt)} phone={st.phone} />
          <PasswordForm />
        </div>
      </div>
    </>
  );
}
