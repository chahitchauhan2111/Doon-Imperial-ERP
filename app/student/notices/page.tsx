import { noticesFor } from '@/lib/data';
import NoticeList from '@/components/NoticeList';
import { PageHeader } from '@/components/ui';

export const metadata = { title: 'Notices' };

export default async function StudentNotices() {
  const notices = await noticesFor('STUDENT');
  return (
    <>
      <PageHeader eyebrow="Campus Life" title="Notices & circulars" sub="Announcements from the school." />
      <div className="card card-body"><NoticeList notices={notices} /></div>
    </>
  );
}
