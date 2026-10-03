import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export function errorText(e: unknown) {
  const code = (e as { code?: string })?.code;
  if (code === 'P2002') return 'A record with the same ID, boarding no. or email already exists.';
  if (code === 'P2025') return 'Record not found.';
  if (e instanceof Error && !('code' in e)) return e.message;
  console.error(e);
  return 'Something went wrong. Please try again.';
}

const withMsg = (to: string, k: 'ok' | 'err', msg: string) => `${to}${to.includes('?') ? '&' : '?'}${k}=${encodeURIComponent(msg)}`;

/**
 * Runs a mutation, then redirects back to `to` with a success or error flash message.
 * If the mutation returns a string, that path is used as the success destination instead.
 */
export async function act(to: string, ok: string, fn: () => Promise<unknown>) {
  let err = '', dest = to;
  try { const r = await fn(); if (typeof r === 'string') dest = r; } catch (e) { err = errorText(e); }
  if (err) redirect(withMsg(to, 'err', err));
  revalidatePath('/', 'layout');
  redirect(withMsg(dest, 'ok', ok));
}

export function need<T>(v: T | null | undefined, label: string): T {
  if (v === null || v === undefined || v === '') throw new Error(`${label} is required.`);
  return v;
}
