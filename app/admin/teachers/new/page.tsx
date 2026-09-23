import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getClasses } from '@/lib/data';
import { TeacherForm } from '@/components/PersonForms';
import { PageHeader, Flash, type SP } from '@/components/ui';

export const metadata = { title: 'Add Teacher' };

export default async function NewTeacher({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageHeader eyebrow="People" title="Add a teacher" sub="Creates the teacher record and their faculty portal login.">
        <Link href="/admin/teachers" className="btn btn-outline"><ArrowLeft />Back</Link>
      </PageHeader>
      <Flash sp={searchParams} />
      <TeacherForm classes={await getClasses()} />
    </>
  );
}
