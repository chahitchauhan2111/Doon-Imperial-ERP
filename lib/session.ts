import { SignJWT, jwtVerify } from 'jose';

// Edge-safe session helpers (used by middleware and server code).
export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';
export type Session = { id: string; role: Role; name: string; email: string; studentId?: string | null; teacherId?: string | null };

export const SESSION_COOKIE = 'di_session';
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'development-only-secret-change-me');

export async function signSession(s: Session) {
  return new SignJWT(s).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(secret);
}

export async function verifySession(token?: string): Promise<Session | null> {
  if (!token) return null;
  try { return (await jwtVerify(token, secret)).payload as unknown as Session; } catch { return null; }
}

export const homeFor = (role: Role) => (role === 'ADMIN' ? '/admin' : role === 'TEACHER' ? '/teacher' : '/student');
