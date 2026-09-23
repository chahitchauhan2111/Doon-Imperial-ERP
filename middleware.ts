import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession, homeFor } from './lib/session';

const areas: Record<string, string> = { '/admin': 'ADMIN', '/teacher': 'TEACHER', '/student': 'STUDENT' };

export async function middleware(req: NextRequest) {
  const s = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const path = req.nextUrl.pathname;
  if (path === '/login') return s ? NextResponse.redirect(new URL(homeFor(s.role), req.url)) : NextResponse.next();
  const area = Object.keys(areas).find(a => path === a || path.startsWith(a + '/'));
  if (!area) return NextResponse.next();
  if (!s) return NextResponse.redirect(new URL('/login', req.url));
  if (s.role !== areas[area]) return NextResponse.redirect(new URL(homeFor(s.role), req.url));
  return NextResponse.next();
}

export const config = { matcher: ['/login', '/admin/:path*', '/teacher/:path*', '/student/:path*'] };
