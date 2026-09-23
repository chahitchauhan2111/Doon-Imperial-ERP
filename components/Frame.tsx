'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, LogOut } from 'lucide-react';
import Avatar from './Avatar';
import { logout } from '@/app/actions/account';
import type { Role } from '@/lib/session';

const LABEL: Record<Role, string> = { ADMIN: 'Administration', TEACHER: 'Faculty Portal', STUDENT: 'Student Portal' };

/** Top bar only: school brand, a way back to the dashboard, and the signed-in user. */
export default function Frame({ role, user, children }: {
  role: Role; user: { name: string; sub: string; photo?: string | null; profileHref: string }; children: React.ReactNode;
}) {
  const path = usePathname();
  const home = '/' + role.toLowerCase();
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="shell">
      <header className="topbar">
        <Link href={home} className="tb-brand">
          <img src="/assets/school-logo.png" alt="Doon Imperial crest" />
          <div><b>Doon Imperial</b><small>{LABEL[role]}</small></div>
        </Link>
        {path !== home && <Link href={home} className="btn btn-outline btn-sm"><LayoutGrid />Dashboard</Link>}
        <div className="tb-spacer" />
        <div className="tb-date">{today}</div>
        <Link href={user.profileHref} className="tb-user">
          <div><b>{user.name}</b><small>{user.sub}</small></div>
          <Avatar src={user.photo} name={user.name} size={32} />
        </Link>
        <form action={logout}><button className="icon-btn" aria-label="Sign out" title="Sign out"><LogOut size={16} /></button></form>
      </header>
      <main className="content">{children}</main>
      <footer className="footer">© {new Date().getFullYear()} Doon Imperial Residential School · Grow Tall</footer>
    </div>
  );
}
