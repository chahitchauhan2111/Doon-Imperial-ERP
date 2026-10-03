import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { PageHeader, Empty } from '@/components/ui';

export const metadata = { title: 'My Documents' };

/** Sends the student straight to their Google Drive documents folder, if the office has linked one. */
export default async function StudentDocuments() {
  const s = await requireRole('STUDENT');
  const st = await prisma.student.findUnique({ where: { id: s.studentId || '' }, select: { documentsUrl: true } });
  if (st?.documentsUrl) redirect(st.documentsUrl);
  return (
    <>
      <PageHeader eyebrow="Account" title="My documents" />
      <div className="card"><Empty title="No documents yet" text="The school office has not added your documents folder yet." /></div>
    </>
  );
}
