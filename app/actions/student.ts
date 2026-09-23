'use server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { str, dateOrNull } from '@/lib/format';
import { act, need } from './util';

export async function applyLeave(f: FormData) {
  const s = await requireRole('STUDENT');
  await act('/student/leave', 'Request submitted to your class teacher.', async () => {
    const studentId = need(s.studentId, 'Student account');
    const fromDate = need(dateOrNull(f, 'fromDate'), 'From date');
    const toDate = need(dateOrNull(f, 'toDate'), 'To date');
    if (toDate < fromDate) throw new Error('"To" date cannot be before "From" date.');
    const reason = need(str(f, 'reason'), 'Reason');
    if (reason.length > 500) throw new Error('Reason is too long.');
    await prisma.leaveRequest.create({ data: { studentId, fromDate, toDate, reason, type: str(f, 'type') === 'OUTING' ? 'OUTING' : 'LEAVE' } });
  });
}

export async function cancelLeave(f: FormData) {
  const s = await requireRole('STUDENT');
  await act('/student/leave', 'Request withdrawn.', async () => {
    const { count } = await prisma.leaveRequest.deleteMany({ where: { id: need(str(f, 'id'), 'Request'), studentId: s.studentId || '', status: 'PENDING' } });
    if (!count) throw new Error('Only pending requests can be withdrawn.');
  });
}
