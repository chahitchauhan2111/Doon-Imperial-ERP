import { getClasses } from '@/lib/data';
import MarksSheet, { EXAMS, SUBJECTS } from '@/components/MarksSheet';
import { PageHeader, Flash, Empty, q, type SP } from '@/components/ui';

export const metadata = { title: 'Exams & Results' };

export default async function AdminResults({ searchParams }: { searchParams: SP }) {
  const classes = await getClasses();
  return (
    <>
      <PageHeader eyebrow="Academics" title="Exams & results" sub="Enter or correct marks by class, examination and subject." />
      <Flash sp={searchParams} />
      {classes.length ? (
        <MarksSheet basePath="/admin/results" classes={classes}
          cls={q(searchParams, 'class') || classes[0]} exam={q(searchParams, 'exam') || EXAMS[0]}
          subject={q(searchParams, 'subject') || SUBJECTS[0]} max={Number(q(searchParams, 'max')) || 100} />
      ) : <div className="card"><Empty title="No classes yet" text="Add students first." /></div>}
    </>
  );
}
