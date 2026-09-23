import Link from 'next/link';
import {
  GraduationCap, Users, CalendarCheck, ClipboardList, IndianRupee, Wallet, BedDouble, DoorOpen, Megaphone,
  UserCircle, BookOpenCheck, type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/lib/session';

type Tile = [label: string, href: string, icon: LucideIcon];

/** The dashboard tiles are the main navigation for each portal (there is no sidebar). */
export const MODULES: Record<Role, Tile[]> = {
  ADMIN: [
    ['Students', '/admin/students', GraduationCap], ['Teachers', '/admin/teachers', Users],
    ['Attendance', '/admin/attendance', CalendarCheck], ['Results', '/admin/results', ClipboardList],
    ['Fees', '/admin/fees', IndianRupee], ['Wallet', '/admin/wallet', Wallet],
    ['Hostel', '/admin/hostel', BedDouble], ['Leave', '/admin/leave', DoorOpen],
    ['Notices', '/admin/notices', Megaphone], ['Account', '/admin/account', UserCircle],
  ],
  TEACHER: [
    ['Attendance', '/teacher/attendance', CalendarCheck], ['Marks Entry', '/teacher/marks', ClipboardList],
    ['My Class', '/teacher/students', GraduationCap], ['Leave', '/teacher/leave', DoorOpen],
    ['Notices', '/teacher/notices', Megaphone], ['Profile', '/teacher/profile', UserCircle],
  ],
  STUDENT: [
    ['Attendance', '/student/attendance', CalendarCheck], ['Results', '/student/results', BookOpenCheck],
    ['Fees', '/student/fees', IndianRupee], ['Wallet', '/student/wallet', Wallet],
    ['Leave', '/student/leave', DoorOpen], ['Notices', '/student/notices', Megaphone],
  ],
};

export default function ModuleTiles({ role }: { role: Role }) {
  return (
    <nav className="tiles" aria-label="Modules">
      {MODULES[role].map(([label, href, Icon]) => <Link key={href} href={href} className="tile"><span><Icon /></span>{label}</Link>)}
    </nav>
  );
}
