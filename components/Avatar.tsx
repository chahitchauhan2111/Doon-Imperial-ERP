'use client';
import { useEffect, useRef, useState } from 'react';
import { initials } from '@/lib/format';

export default function Avatar({ src, name, size = 36 }: { src?: string | null; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  // A missing photo can 404 before React hydrates, in which case onError never fires; check once mounted.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, [src]);
  const style = { width: size, height: size, fontSize: Math.max(11, size * 0.36) };
  if (src && !failed) return <img ref={img} className="avatar" src={src} alt={name} style={style} onError={() => setFailed(true)} />;
  return <span className="avatar" style={style} aria-label={name}>{initials(name)}</span>;
}
