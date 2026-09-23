'use client';
import { useFormStatus } from 'react-dom';

export default function SubmitButton({ children, className = 'btn btn-primary', pendingText = 'Saving…', confirm, name, value }: {
  children: React.ReactNode; className?: string; pendingText?: string; confirm?: string; name?: string; value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending} name={name} value={value}
      onClick={e => { if (confirm && !window.confirm(confirm)) e.preventDefault(); }}>
      {pending ? pendingText : children}
    </button>
  );
}
