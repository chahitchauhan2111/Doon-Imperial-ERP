import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { classLabel } from '@/lib/format';
import { StudentProfileCard } from '@/components/ProfileCard';
import StudentInsights from '@/components/StudentInsights';
import { PageHeader } from '@/components/ui';

export default async function TeacherStudentView({ params }: { params: { id: string } }) {
  const s = await prisma.student.findUnique({ where: { id: params.id } });
  if (!s) notFound();
  return (
    <>
      <PageHeader eyebrow={`Class ${classLabel(s)}`} title={s.name} sub={`Admission no. ${s.admissionNo}`}>
        <Link href={`/teacher/students?class=${encodeURIComponent(classLabel(s))}`} className="btn btn-outline"><ArrowLeft />Back to class</Link>
      </PageHeader>
      <div className="grid g-profile">
        <StudentProfileCard s={s} />
        <div><StudentInsights studentId={s.id} showMoney={false} /></div>
      </div>
    </>
  );
}
