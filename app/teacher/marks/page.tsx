import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { getClasses } from '@/lib/data';
import MarksSheet, { EXAMS, SUBJECTS } from '@/components/MarksSheet';
import { PageHeader, Flash, Empty, q, type SP } from '@/components/ui';

export const metadata = { title: 'Marks Entry' };

export default async function TeacherMarks({ searchParams }: { searchParams: SP }) {
  const s = await requireRole('TEACHER');
  const [t, classes] = await Promise.all([prisma.teacher.findUnique({ where: { id: s.teacherId || '' }, select: { classTeacherOf: true, subjects: true } }), getClasses()]);
  const mySubject = SUBJECTS.find(x => t?.subjects?.toLowerCase().includes(x.toLowerCase()));
  const cls = q(searchParams, 'class') || (t?.classTeacherOf && classes.includes(t.classTeacherOf) ? t.classTeacherOf : classes[0]) || '';
  return (
    <>
      <PageHeader eyebrow="Academics" title="Marks entry" sub="Choose the class, exam and subject, then enter marks for each student." />
      <Flash sp={searchParams} />
      {classes.length ? (
        <MarksSheet basePath="/teacher/marks" classes={classes} cls={cls}
          exam={q(searchParams, 'exam') || EXAMS[0]} subject={q(searchParams, 'subject') || mySubject || SUBJECTS[0]} max={Number(q(searchParams, 'max')) || 100} />
      ) : <div className="card"><Empty title="No classes yet" /></div>}
    </>
  );
}
