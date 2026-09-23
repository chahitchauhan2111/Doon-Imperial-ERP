import { Megaphone, Send, Trash2 } from 'lucide-react';
import { noticesFor } from '@/lib/data';
import NoticeList from '@/components/NoticeList';
import SubmitButton from '@/components/SubmitButton';
import { PageHeader, Flash, CardHead, type SP } from '@/components/ui';
import { createNotice, deleteNotice } from '@/app/actions/admin';

export const metadata = { title: 'Notices' };

export default async function AdminNotices({ searchParams }: { searchParams: SP }) {
  const notices = await noticesFor('ADMIN');
  return (
    <>
      <PageHeader eyebrow="Communication" title="Notices" sub="Publish circulars to everyone, only students, or only teachers." />
      <Flash sp={searchParams} />
      <div className="grid g-side">
        <div className="card">
          <CardHead icon={Megaphone} title={`All notices (${notices.length})`} />
          <div className="card-body">
            <NoticeList notices={notices} action={n => (
              <form action={deleteNotice}>
                <input type="hidden" name="id" value={n.id} />
                <SubmitButton className="btn btn-sm btn-ghost" confirm="Delete this notice?" pendingText="…"><Trash2 /></SubmitButton>
              </form>
            )} />
          </div>
        </div>
        <div className="card">
          <CardHead icon={Send} title="New notice" />
          <form action={createNotice} className="card-body form">
            <div className="field"><label>Title</label><input name="title" required maxLength={160} placeholder="Parent–Teacher Meeting on Saturday" /></div>
            <div className="field"><label>Audience</label>
              <select name="audience" defaultValue="ALL"><option value="ALL">Everyone</option><option value="STUDENTS">Students only</option><option value="TEACHERS">Teachers only</option></select>
            </div>
            <div className="field"><label>Message</label><textarea name="body" required rows={6} /></div>
            <SubmitButton className="btn btn-primary btn-block" pendingText="Publishing…"><Send />Publish notice</SubmitButton>
          </form>
        </div>
      </div>
    </>
  );
}
