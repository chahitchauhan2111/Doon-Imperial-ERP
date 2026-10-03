export const inr = (n: number | string | { toString(): string } | null | undefined) =>
  '₹' + Number(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const fmtDate = (d?: Date | null) =>
  d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '—';

/** Today's date in India as YYYY-MM-DD. */
export const todayISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

/** Attendance is stored at UTC midnight of the school's calendar day. */
export const dayStart = (iso: string) => new Date(iso + 'T00:00:00.000Z');

export const classLabel = (s: { className: string; section?: string | null }) => s.className + (s.section ? '-' + s.section : '');

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export function grade(p: number) {
  if (p >= 91) return 'A1'; if (p >= 81) return 'A2'; if (p >= 71) return 'B1'; if (p >= 61) return 'B2';
  if (p >= 51) return 'C1'; if (p >= 41) return 'C2'; if (p >= 33) return 'D'; return 'E';
}

export const str = (f: FormData, k: string) => {
  const v = f.get(k); return typeof v === 'string' && v.trim() ? v.trim() : null;
};
export const dateOrNull = (f: FormData, k: string) => { const v = str(f, k); return v ? new Date(v + 'T00:00:00.000Z') : null; };
export const isoDate = (d?: Date | null) => (d ? d.toISOString().slice(0, 10) : '');
export const greeting = () => {
  const h = Number(new Date().toLocaleString('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }));
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

/** Every student and staff member has a school account on this domain. */
export const SCHOOL_DOMAIN = '@doonimperial.com';
export function schoolEmail(email: string) {
  const e = email.trim().toLowerCase();
  if (!e.endsWith(SCHOOL_DOMAIN) || e.length === SCHOOL_DOMAIN.length) throw new Error(`Email must be a school address ending in ${SCHOOL_DOMAIN}.`);
  return e;
}

/** Validates an optional Google Drive link (folder or file) pasted by the admin. */
export function driveUrl(raw: string | null) {
  if (!raw) return null;
  let u: URL;
  try { u = new URL(raw); } catch { throw new Error('Documents link must be a valid Google Drive URL.'); }
  if (u.protocol !== 'https:' || !['drive.google.com', 'docs.google.com'].includes(u.hostname))
    throw new Error('Documents link must be a Google Drive link (https://drive.google.com/...).');
  return u.toString();
}
