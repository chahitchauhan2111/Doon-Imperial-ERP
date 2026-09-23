'use client';
import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';

/** Resizes the chosen image in the browser to a 360px square JPEG and submits it as a data URL. */
export default function PhotoInput({ current, label = 'Profile photo' }: { current?: string | null; label?: string }) {
  const [preview, setPreview] = useState<string | null>(current || null);
  const [data, setData] = useState('');
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState('');
  const file = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setError('');
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('Please choose an image file.'); return; }
    const img = new Image();
    img.onload = () => {
      const size = 360, c = document.createElement('canvas');
      c.width = c.height = size;
      const s = Math.min(img.width, img.height);
      c.getContext('2d')!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      const url = c.toDataURL('image/jpeg', 0.85);
      setPreview(url); setData(url); setRemoved(false);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => setError('Could not read that image.');
    img.src = URL.createObjectURL(f);
  }

  return (
    <div className="photo-input">
      <div className="ph">{preview ? <img src={preview} alt="" onError={() => setPreview(null)} /> : <Camera size={26} />}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{label}</div>
        <div className="small muted" style={{ margin: '2px 0 8px' }}>JPG or PNG. Cropped to a square automatically.</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => file.current?.click()}><Camera />{preview ? 'Change' : 'Upload'}</button>
          {preview && <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setPreview(null); setData(''); setRemoved(true); }}><Trash2 />Remove</button>}
        </div>
        {error && <div className="small" style={{ color: 'var(--red)', marginTop: 6 }}>{error}</div>}
      </div>
      <input ref={file} type="file" accept="image/*" hidden onChange={onPick} />
      <input type="hidden" name="photo" value={data} />
      <input type="hidden" name="removePhoto" value={removed ? '1' : ''} />
    </div>
  );
}
