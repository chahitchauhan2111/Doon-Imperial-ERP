import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { setSession } from '@/lib/auth';
import { homeFor, type Role } from '@/lib/session';

const ROLES: Role[] = ['STUDENT', 'TEACHER', 'ADMIN'];
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

/** Students may sign in with admission no. or email; teachers with employee ID or email; admins with email. */
async function findUser(role: Role, id: string) {
  if (id.includes('@')) return prisma.user.findUnique({ where: { email: id.toLowerCase() } });
  if (role === 'STUDENT') return prisma.user.findFirst({ where: { student: { admissionNo: { equals: id, mode: 'insensitive' } } } });
  if (role === 'TEACHER') return prisma.user.findFirst({ where: { teacher: { employeeId: { equals: id, mode: 'insensitive' } } } });
  return null;
}

export async function POST(req: Request) {
  try {
    const { role, identifier, password } = await req.json();
    if (!ROLES.includes(role) || typeof identifier !== 'string' || typeof password !== 'string' || !identifier.trim() || !password)
      return NextResponse.json({ error: 'Please enter your ID and password.' }, { status: 400 });

    const user = await findUser(role, identifier.trim());
    // Always run bcrypt so response time doesn't reveal whether the account exists.
    const ok = await bcrypt.compare(password, user?.password || DUMMY_HASH);
    if (!user || !ok || user.role !== role) return NextResponse.json({ error: 'Invalid ID or password for the selected portal.' }, { status: 401 });

    if (user.studentId) {
      const st = await prisma.student.findUnique({ where: { id: user.studentId }, select: { status: true } });
      if (st?.status !== 'ACTIVE') return NextResponse.json({ error: 'This account is inactive. Please contact the school office.' }, { status: 403 });
    }
    if (user.teacherId) {
      const t = await prisma.teacher.findUnique({ where: { id: user.teacherId }, select: { status: true } });
      if (t?.status !== 'ACTIVE') return NextResponse.json({ error: 'This account is inactive. Please contact the school office.' }, { status: 403 });
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await setSession({ id: user.id, role: user.role, name: user.name, email: user.email, studentId: user.studentId, teacherId: user.teacherId });
    return NextResponse.json({ ok: true, redirect: homeFor(user.role) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error. Please check the database connection.' }, { status: 500 });
  }
}
