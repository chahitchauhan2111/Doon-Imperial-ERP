import { Check, X } from 'lucide-react';
import Avatar from './Avatar';
import SubmitButton from './SubmitButton';
import { Badge, Empty } from './ui';
import { classLabel, fmtDate } from '@/lib/format';
import { photoUrl } from '@/lib/photo';
import { reviewLeave } from '@/app/actions/academic';

type Leave = {
  id: string; type: string; fromDate: Date; toDate: Date; reason: string; status: string; remarks: string | null; reviewedBy: string | null; createdAt: Date;
  student: { id: string; name: string; admissionNo: string; className: string; section: string | null; updatedAt: Date };
};

export default function LeaveTable({ rows, canReview }: { rows: Leave[]; canReview: boolean }) {
  if (!rows.length) return <Empty title="No requests here" text="Leave and outing requests will appear here." />;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Student</th><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th>{canReview && <th className="r">Action</th>}</tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td><div className="person"><Avatar src={photoUrl('student', r.student.id, r.student.updatedAt)} name={r.student.name} size={34} /><div><b>{r.student.name}</b><small>{classLabel(r.student)} · {r.student.admissionNo}</small></div></div></td>
              <td><Badge v={r.type} /></td>
              <td className="num" style={{ whiteSpace: 'nowrap' }}>{fmtDate(r.fromDate)}<div className="small muted">to {fmtDate(r.toDate)}</div></td>
              <td style={{ maxWidth: 280 }}>{r.reason}{r.remarks && <div className="small muted">Remark: {r.remarks}</div>}</td>
              <td><Badge v={r.status} />{r.reviewedBy && <div className="small muted" style={{ marginTop: 3 }}>by {r.reviewedBy}</div>}</td>
              {canReview && (
                <td className="r">
                  {r.status === 'PENDING' ? (
                    <form action={reviewLeave} style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <input type="hidden" name="id" value={r.id} />
                      <input className="input" name="remarks" placeholder="Remark (optional)" style={{ height: 32, width: 150 }} />
                      <SubmitButton className="btn btn-sm btn-primary" name="decision" value="APPROVED" pendingText="…"><Check />Approve</SubmitButton>
                      <SubmitButton className="btn btn-sm btn-danger" name="decision" value="REJECTED" pendingText="…"><X />Reject</SubmitButton>
                    </form>
                  ) : <span className="small muted">—</span>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
