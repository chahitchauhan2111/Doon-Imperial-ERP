import Link from 'next/link';
import { CheckCircle2, AlertCircle, Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SP = Record<string, string | string[] | undefined>;
export const q = (sp: SP, k: string) => (typeof sp[k] === 'string' ? (sp[k] as string) : '');

export function PageHeader({ title, sub, eyebrow, children }: { title: string; sub?: string; eyebrow?: string; children?: React.ReactNode }) {
  return (
    <div className="pagehead">
      <div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{sub && <p>{sub}</p>}</div>
      {children && <div className="actions">{children}</div>}
    </div>
  );
}

export function Flash({ sp }: { sp: SP }) {
  const ok = q(sp, 'ok'), err = q(sp, 'err');
  if (!ok && !err) return null;
  return <div className={'flash ' + (ok ? 'ok' : 'err')} role="status">{ok ? <CheckCircle2 /> : <AlertCircle />}{ok || err}</div>;
}

export function Stat({ icon: Icon, label, value, sub, tone }: { icon: LucideIcon; label: string; value: React.ReactNode; sub?: string; tone?: 'gold' | 'green' | 'blue' }) {
  return (
    <div className="card stat">
      <div className={'stat-ico ' + (tone || '')}><Icon /></div>
      <div><div className="stat-label">{label}</div><div className="stat-value">{value}</div>{sub && <div className="stat-sub">{sub}</div>}</div>
    </div>
  );
}

export function CardHead({ icon: Icon, title, href, linkText = 'View all', children }: { icon?: LucideIcon; title: string; href?: string; linkText?: string; children?: React.ReactNode }) {
  return (
    <div className="card-head">
      <h3>{Icon && <Icon />}{title}</h3>
      {href ? <Link href={href}>{linkText} →</Link> : children}
    </div>
  );
}

export function Empty({ title, text }: { title: string; text?: string }) {
  return <div className="empty"><Inbox /><b>{title}</b>{text}</div>;
}

const tones: Record<string, string> = {
  PRESENT: 'b-green', PAID: 'b-green', APPROVED: 'b-green', ACTIVE: 'b-green', CREDIT: 'b-green',
  ABSENT: 'b-red', REJECTED: 'b-red', DEBIT: 'b-red', OVERDUE: 'b-red', INACTIVE: 'b-gray',
  LATE: 'b-amber', PENDING: 'b-amber', PARTIAL: 'b-blue', ALL: 'b-maroon', STUDENTS: 'b-blue', TEACHERS: 'b-amber',
  LEAVE: 'b-maroon', OUTING: 'b-blue',
};
export function Badge({ v, label }: { v: string; label?: string }) {
  return <span className={'badge ' + (tones[v] || 'b-gray')}>{label || v.charAt(0) + v.slice(1).toLowerCase()}</span>;
}

export function DateChip({ d }: { d: Date }) {
  return (
    <div className="date-chip">
      <b>{d.toLocaleDateString('en-IN', { day: '2-digit', timeZone: 'Asia/Kolkata' })}</b>
      <small>{d.toLocaleDateString('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' })}</small>
    </div>
  );
}
