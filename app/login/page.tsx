'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Presentation, ShieldCheck, User, KeyRound, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

const ROLES = [
  { key: 'STUDENT', label: 'Student', icon: GraduationCap, idLabel: 'Admission No. or school email', placeholder: 'e.g. DIS-2026-001' },
  { key: 'TEACHER', label: 'Teacher', icon: Presentation, idLabel: 'Employee ID or school email', placeholder: 'e.g. EMP-101' },
  { key: 'ADMIN', label: 'Admin', icon: ShieldCheck, idLabel: 'Administrator email', placeholder: 'admin@doonimperial.com' },
] as const;

export default function Login() {
  const [role, setRole] = useState<(typeof ROLES)[number]['key']>('STUDENT');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const r = ROLES.find(x => x.key === role)!;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, identifier, password }) });
      const d = await res.json();
      if (!res.ok) { setErr(d.error || 'Login failed'); setBusy(false); return; }
      router.replace(d.redirect);
      router.refresh();
    } catch {
      setErr('Could not reach the server. Please try again.'); setBusy(false);
    }
  }

  return (
    <main className="login">
      <div className="login-hero">
        <div className="eyebrow">Est. Dehradun · Grow Tall</div>
        <h1>Doon Imperial Residential School</h1>
        <p>Academics, attendance, fees and boarding — one secure portal for students, faculty and administration.</p>
      </div>

      <section className="login-card">
        <div className="login-top">
          <img src="/assets/school-logo.png" alt="Doon Imperial crest" />
          <h2>Doon Imperial Residential School</h2>
          <p>School ERP Portal</p>
        </div>
        <div className="login-body">
          <div className="role-tabs" role="tablist" aria-label="Choose portal">
            {ROLES.map(x => (
              <button key={x.key} type="button" role="tab" aria-selected={role === x.key} className={role === x.key ? 'on' : ''}
                onClick={() => { setRole(x.key); setErr(''); }}>
                <x.icon />{x.label}
              </button>
            ))}
          </div>

          {err && <div className="flash err" style={{ marginBottom: 14 }}><AlertCircle />{err}</div>}

          <form className="form" onSubmit={submit}>
            <div className="field">
              <label htmlFor="id">{r.idLabel}</label>
              <div className="input-ico">
                <User />
                <input id="id" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder={r.placeholder} autoComplete="username" required />
              </div>
            </div>
            <div className="field">
              <label htmlFor="pw">Password</label>
              <div className="input-ico">
                <KeyRound />
                <input id="pw" value={password} onChange={e => setPassword(e.target.value)} type={show ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password" required />
                <button type="button" className="eye" onClick={() => setShow(v => !v)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff /> : <Eye />}</button>
              </div>
            </div>
            <button className="btn btn-primary btn-block" style={{ height: 44 }} disabled={busy}>
              {busy ? 'Signing in…' : <>Sign in to {r.label} Portal <ArrowRight /></>}
            </button>
          </form>

          <div className="login-foot">
            <span>Forgot password? Contact the school office.</span>
          </div>

          {(process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_SHOW_DEMO_LOGINS === 'true') && (
            <div className="login-demo">
              <b>Demo accounts</b><br />
              Student: DIS-2026-001 / Student@123<br />
              Teacher: EMP-101 / Teacher@123<br />
              Admin: admin@doonimperial.com / Admin@12345
            </div>
          )}
        </div>
      </section>

      <div className="login-mark" aria-hidden="true">co. by designby2111</div>
    </main>
  );
}
