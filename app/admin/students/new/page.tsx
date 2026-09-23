import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { StudentForm } from '@/components/PersonForms';
import { PageHeader, Flash, type SP } from '@/components/ui';

export const metadata = { title: 'Add Student' };

export default function NewStudent({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageHeader eyebrow="People" title="Add a student" sub="Creates the student record and their portal login.">
        <Link href="/admin/students" className="btn btn-outline"><ArrowLeft />Back</Link>
      </PageHeader>
      <Flash sp={searchParams} />
      <StudentForm />
    </>
  );
}
