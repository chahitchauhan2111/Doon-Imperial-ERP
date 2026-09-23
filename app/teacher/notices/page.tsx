import { noticesFor } from '@/lib/data';
import NoticeList from '@/components/NoticeList';
import { PageHeader } from '@/components/ui';

export const metadata = { title: 'Notices' };

export default async function TeacherNotices() {
  const notices = await noticesFor('TEACHER');
  return (
    <>
      <PageHeader eyebrow="General" title="Notices & circulars" sub="Announcements from the school administration." />
      <div className="card card-body"><NoticeList notices={notices} /></div>
    </>
  );
}
