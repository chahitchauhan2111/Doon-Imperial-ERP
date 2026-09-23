import { ShieldCheck } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { PasswordForm } from '@/components/AccountForms';
import { PageHeader, Flash, CardHead, type SP } from '@/components/ui';

export const metadata = { title: 'My Account' };

export default async function AdminAccount({ searchParams }: { searchParams: SP }) {
  const s = await requireRole('ADMIN');
  return (
    <>
      <PageHeader eyebrow="Account" title="My account" sub="Administrator sign-in details." />
      <Flash sp={searchParams} />
      <div className="grid g-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <CardHead icon={ShieldCheck} title="Administrator" />
          <dl className="details" style={{ paddingTop: 12 }}>
            <div><dt>Name</dt><dd>{s.name}</dd></div>
            <div><dt>Email</dt><dd>{s.email}</dd></div>
            <div><dt>Role</dt><dd>Administrator (full access)</dd></div>
          </dl>
        </div>
        <PasswordForm />
      </div>
    </>
  );
}
