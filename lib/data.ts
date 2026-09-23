import { prisma } from './prisma';
import { classLabel } from './format';
import type { Role } from './session';

const ORDER = ['NURSERY', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const rank = (c: string) => { const i = ORDER.indexOf(c.toUpperCase()); return i < 0 ? 99 : i; };

/** Every class-section in use, e.g. ["VIII-A", "IX-B"], in school order. */
export async function getClasses() {
  const rows = await prisma.student.findMany({ distinct: ['className', 'section'], select: { className: true, section: true } });
  return rows
    .sort((a, b) => rank(a.className) - rank(b.className) || a.className.localeCompare(b.className) || (a.section || '').localeCompare(b.section || ''))
    .map(classLabel);
}

export function classWhere(label: string) {
  const [className, section] = label.split('-');
  return { className, ...(section ? { section } : {}) };
}

export function noticesFor(role: Role, take?: number) {
  const audience = role === 'ADMIN' ? undefined : { in: ['ALL', role === 'TEACHER' ? 'TEACHERS' : 'STUDENTS'] };
  return prisma.notice.findMany({ where: audience ? { audience } : {}, orderBy: { createdAt: 'desc' }, take });
}

export async function attendanceSummary(studentId: string) {
  const rows = await prisma.attendance.groupBy({ by: ['status'], where: { studentId }, _count: true });
  const get = (s: string) => rows.find(r => r.status === s)?._count || 0;
  const present = get('PRESENT'), late = get('LATE'), absent = get('ABSENT');
  const total = present + late + absent;
  return { present, late, absent, total, pct: total ? Math.round(((present + late) / total) * 100) : 0 };
}

export async function feeSummary(studentId: string) {
  const f = await prisma.feeRecord.aggregate({ where: { studentId }, _sum: { amount: true, paid: true } });
  const billed = Number(f._sum.amount || 0), paid = Number(f._sum.paid || 0);
  return { billed, paid, due: billed - paid };
}

export async function walletBalance(studentId: string) {
  const rows = await prisma.transaction.groupBy({ by: ['type'], where: { studentId }, _sum: { amount: true } });
  const credit = Number(rows.find(r => r.type === 'CREDIT')?._sum.amount || 0);
  const debit = Number(rows.find(r => r.type === 'DEBIT')?._sum.amount || 0);
  return { credit, debit, balance: credit - debit };
}

/** Marks grouped by exam, with totals and percentage. */
export async function resultsFor(studentId: string) {
  const marks = await prisma.mark.findMany({ where: { studentId }, orderBy: [{ createdAt: 'asc' }, { subject: 'asc' }] });
  const exams = new Map<string, typeof marks>();
  for (const m of marks) exams.set(m.exam, [...(exams.get(m.exam) || []), m]);
  return [...exams.entries()].map(([exam, rows]) => {
    const got = rows.reduce((a, r) => a + Number(r.marks), 0), max = rows.reduce((a, r) => a + r.maxMarks, 0);
    return { exam, rows, got, max, pct: max ? Math.round((got / max) * 1000) / 10 : 0 };
  });
}
