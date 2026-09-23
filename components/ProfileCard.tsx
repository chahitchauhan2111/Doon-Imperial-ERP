import { Mail, Phone } from 'lucide-react';
import Avatar from './Avatar';
import { classLabel, fmtDate } from '@/lib/format';
import { photoUrl } from '@/lib/photo';

type Row = [label: string, value: React.ReactNode];

function Card({ photo, name, id, email, phone, rows, footer }: {
  photo: string; name: string; id: string; email: string; phone?: string | null; rows: Row[]; footer?: React.ReactNode;
}) {
  return (
    <div className="card profile">
      <div className="profile-top">
        <div className="profile-photo"><Avatar src={photo} name={name} size={110} /></div>
        <h2>{name}</h2>
        <span className="profile-id">{id}</span>
        <div className="profile-contact">
          <div><Mail />{email}</div>
          {phone && <div><Phone />{phone}</div>}
        </div>
      </div>
      <dl className="details">
        {rows.filter(([, v]) => v !== null && v !== undefined && v !== '').map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
      {footer}
    </div>
  );
}

type StudentLike = {
  id: string; name: string; admissionNo: string; email: string; phone: string | null; className: string; section: string | null;
  rollNo: string | null; dob: Date | null; gender: string | null; bloodGroup: string | null; fatherName: string | null; motherName: string | null;
  house: string | null; hostelBlock: string | null; room: string | null; bed: string | null; parentPhone: string | null; updatedAt: Date;
};

export function StudentProfileCard({ s, footer }: { s: StudentLike; footer?: React.ReactNode }) {
  return (
    <Card photo={photoUrl('student', s.id, s.updatedAt)} name={s.name} id={s.admissionNo} email={s.email} phone={s.phone} footer={footer}
      rows={[
        ['Class', classLabel(s)], ['Roll No.', s.rollNo], ['Father’s Name', s.fatherName], ['Mother’s Name', s.motherName],
        ['Date of Birth', s.dob ? fmtDate(s.dob) : null], ['Gender', s.gender], ['Blood Group', s.bloodGroup], ['House', s.house],
        ['Hostel', [s.hostelBlock, s.room && `Room ${s.room}`, s.bed && `Bed ${s.bed}`].filter(Boolean).join(' · ')],
        ['Parent Phone', s.parentPhone],
      ]} />
  );
}

type TeacherLike = {
  id: string; name: string; employeeId: string; email: string; phone: string | null; designation: string | null; department: string | null;
  subjects: string | null; qualification: string | null; classTeacherOf: string | null; joiningDate: Date | null; updatedAt: Date;
};

export function TeacherProfileCard({ t, footer }: { t: TeacherLike; footer?: React.ReactNode }) {
  return (
    <Card photo={photoUrl('teacher', t.id, t.updatedAt)} name={t.name} id={t.employeeId} email={t.email} phone={t.phone} footer={footer}
      rows={[
        ['Designation', t.designation], ['Department', t.department], ['Subjects', t.subjects], ['Class Teacher', t.classTeacherOf],
        ['Qualification', t.qualification], ['Joined', t.joiningDate ? fmtDate(t.joiningDate) : null],
      ]} />
  );
}
