import { Send, History, X } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { fmtDate, todayISO } from '@/lib/format';
import SubmitButton from '@/components/SubmitButton';
import { PageHeader, Flash, CardHead, Badge, Empty, type SP } from '@/components/ui';
import { applyLeave, cancelLeave } from '@/app/actions/student';

export const metadata = { title: 'Leave & Outing' };

export default async function StudentLeave({ searchParams }: { searchParams: SP }) {
  const s = await requireRole('STUDENT');
  const rows = await prisma.leaveRequest.findMany({ where: { studentId: s.studentId || '' }, orderBy: { createdAt: 'desc' } });
  const today = todayISO();
  return (
    <>
      <PageHeader eyebrow="Campus Life" title="Leave & outing" sub="Apply for home leave or a day outing. Your class teacher will review it." />
      <Flash sp={searchParams} />
      <div className="grid g-side">
        <div className="card">
          <CardHead icon={History} title="My requests" />
          {rows.length ? (
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th><th></th></tr></thead>
              <tbody>{rows.map(r => (
                <tr key={r.id}>
                  <td><Badge v={r.type} /></td>
                  <td className="num" style={{ whiteSpace: 'nowrap' }}>{fmtDate(r.fromDate)}<div className="small muted">to {fmtDate(r.toDate)}</div></td>
                  <td style={{ maxWidth: 260 }}>{r.reason}{r.remarks && <div className="small muted">Remark: {r.remarks}</div>}</td>
                  <td><Badge v={r.status} />{r.reviewedBy && <div className="small muted" style={{ marginTop: 3 }}>by {r.reviewedBy}</div>}</td>
                  <td className="r">
                    {r.status === 'PENDING' && (
                      <form action={cancelLeave}><input type="hidden" name="id" value={r.id} />
                        <SubmitButton className="btn btn-sm btn-ghost" confirm="Withdraw this request?" pendingText="…"><X />Withdraw</SubmitButton>
                      </form>
                    )}
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
          ) : <Empty title="No requests yet" />}
        </div>
        <div className="card">
          <CardHead icon={Send} title="New request" />
          <form action={applyLeave} className="card-body form">
            <div className="field"><label>Type</label>
              <select name="type" defaultValue="LEAVE"><option value="LEAVE">Home leave</option><option value="OUTING">Day outing</option></select>
            </div>
            <div className="form-grid">
              <div className="field"><label>From</label><input type="date" name="fromDate" min={today} defaultValue={today} required /></div>
              <div className="field"><label>To</label><input type="date" name="toDate" min={today} defaultValue={today} required /></div>
            </div>
            <div className="field"><label>Reason</label><textarea name="reason" required maxLength={500} rows={4} placeholder="e.g. Sister’s wedding, parents will pick me up" /></div>
            <SubmitButton className="btn btn-primary btn-block" pendingText="Submitting…"><Send />Submit request</SubmitButton>
          </form>
        </div>
      </div>
    </>
  );
}
