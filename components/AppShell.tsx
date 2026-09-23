import Frame from './Frame';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { photoUrl } from '@/lib/photo';
import { classLabel } from '@/lib/format';
import type { Role } from '@/lib/session';

/** Role-guarded layout used by /admin, /teacher and /student. */
export default async function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const s = await requireRole(role);
  let user = { name: s.name, sub: 'Administrator', photo: null as string | null, profileHref: '/admin/account' };

  if (role === 'STUDENT' && s.studentId) {
    const st = await prisma.student.findUnique({ where: { id: s.studentId }, select: { name: true, className: true, section: true, updatedAt: true } });
    if (st) user = { name: st.name, sub: 'Class ' + classLabel(st), photo: photoUrl('student', s.studentId, st.updatedAt), profileHref: '/student/profile' };
  }
  if (role === 'TEACHER' && s.teacherId) {
    const t = await prisma.teacher.findUnique({ where: { id: s.teacherId }, select: { name: true, designation: true, updatedAt: true } });
    if (t) user = { name: t.name, sub: t.designation || 'Teacher', photo: photoUrl('teacher', s.teacherId, t.updatedAt), profileHref: '/teacher/profile' };
  }

  return <Frame role={role} user={user}>{children}</Frame>;
}
