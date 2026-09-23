'use server';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { clearSession, getSession } from '@/lib/auth';
import { homeFor } from '@/lib/session';
import { readPhoto } from '@/lib/photo';
import { str } from '@/lib/format';
import { act } from './util';

export async function logout() {
  clearSession();
  redirect('/login');
}

const profilePath = (role: string) => (role === 'ADMIN' ? '/admin/account' : homeFor(role as never) + '/profile');

export async function changePassword(f: FormData) {
  const s = await getSession(); if (!s) redirect('/login');
  await act(profilePath(s.role), 'Password updated successfully.', async () => {
    const current = str(f, 'current') || '', next = str(f, 'next') || '', confirm = str(f, 'confirm') || '';
    if (next.length < 8) throw new Error('New password must be at least 8 characters.');
    if (next !== confirm) throw new Error('New passwords do not match.');
    const u = await prisma.user.findUniqueOrThrow({ where: { id: s.id } });
    if (!(await bcrypt.compare(current, u.password))) throw new Error('Current password is incorrect.');
    await prisma.user.update({ where: { id: s.id }, data: { password: await bcrypt.hash(next, 12) } });
  });
}

/** Students and teachers may update their own photo and phone number. */
export async function updateMyProfile(f: FormData) {
  const s = await getSession(); if (!s) redirect('/login');
  await act(profilePath(s.role), 'Profile updated.', async () => {
    const photo = readPhoto(f);
    const data = { phone: str(f, 'phone'), ...(photo !== undefined && { photo }) };
    if (s.role === 'STUDENT' && s.studentId) await prisma.student.update({ where: { id: s.studentId }, data });
    else if (s.role === 'TEACHER' && s.teacherId) await prisma.teacher.update({ where: { id: s.teacherId }, data });
    else throw new Error('Profile editing is not available for this account.');
  });
}
