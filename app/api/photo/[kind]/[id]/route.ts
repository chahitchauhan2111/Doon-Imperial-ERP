import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: { kind: string; id: string } }) {
  const s = await getSession();
  if (!s) return new NextResponse(null, { status: 401 });
  const { kind, id } = params;

  // Students can see their own photo and staff photos, but not other students'.
  if (kind === 'student' && s.role === 'STUDENT' && s.studentId !== id) return new NextResponse(null, { status: 403 });

  const row = kind === 'student'
    ? await prisma.student.findUnique({ where: { id }, select: { photo: true } })
    : kind === 'teacher'
      ? await prisma.teacher.findUnique({ where: { id }, select: { photo: true } })
      : null;

  const m = row?.photo?.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!m) return new NextResponse(null, { status: 404 });

  return new NextResponse(Buffer.from(m[2], 'base64'), {
    headers: { 'Content-Type': m[1], 'Cache-Control': 'private, max-age=86400' },
  });
}
