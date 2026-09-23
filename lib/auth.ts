import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, signSession, verifySession, type Role, type Session } from './session';

export async function setSession(s: Session) {
  cookies().set(SESSION_COOKIE, await signSession(s), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7, path: '/',
  });
}

export async function getSession() {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}

export function clearSession() { cookies().delete(SESSION_COOKIE); }

/** Use in every page and server action: returns the session or sends the user to login. */
export async function requireRole(...roles: Role[]) {
  const s = await getSession();
  if (!s || !roles.includes(s.role)) redirect('/login');
  return s;
}
