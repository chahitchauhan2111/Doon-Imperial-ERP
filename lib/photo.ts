/** Stable photo URL; the version query busts the browser cache after a new upload. */
export const photoUrl = (kind: 'student' | 'teacher', id: string, updatedAt?: Date | null) =>
  `/api/photo/${kind}/${id}${updatedAt ? `?v=${updatedAt.getTime()}` : ''}`;

const MAX_PHOTO_CHARS = 400_000; // ~300 KB image

/** Validates a data URL coming from <PhotoInput>. Returns undefined when no new photo was chosen. */
export function readPhoto(f: FormData): string | null | undefined {
  if (f.get('removePhoto') === '1') return null;
  const v = f.get('photo');
  if (typeof v !== 'string' || !v) return undefined;
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v)) throw new Error('Invalid photo format.');
  if (v.length > MAX_PHOTO_CHARS) throw new Error('Photo is too large.');
  return v;
}
