import PhotoInput from './PhotoInput';
import SubmitButton from './SubmitButton';
import { saveStudent, saveTeacher } from '@/app/actions/admin';
import { isoDate } from '@/lib/format';

const CLASSES = ['Nursery', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const HOUSES = ['Red House', 'Green House', 'Yellow House', 'Blue House'];
const BLOOD = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function F({ label, name, required, span, children, ...rest }: { label: string; name: string; required?: boolean; span?: boolean; children?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={'field' + (span ? ' span-all' : '')}>
      <label htmlFor={name}>{label}{required && <em> *</em>}</label>
      {children || <input id={name} name={name} required={required} {...rest} />}
    </div>
  );
}

function Select({ name, value, options, blank = 'Select' }: { name: string; value?: string | null; options: string[]; blank?: string }) {
  return <select id={name} name={name} defaultValue={value || ''}><option value="">{blank}</option>{options.map(o => <option key={o}>{o}</option>)}</select>;
}

type StudentData = Partial<Record<string, string | Date | null>> & { id?: string };

export function StudentForm({ s, photo }: { s?: StudentData; photo?: string }) {
  const v = (k: string) => (s?.[k] instanceof Date ? isoDate(s[k] as Date) : ((s?.[k] as string) ?? ''));
  return (
    <form action={saveStudent} className="card card-body form">
      {s?.id && <input type="hidden" name="id" value={s.id} />}
      <PhotoInput current={photo} label="Student photo" />
      <div className="form-grid three">
        <div className="form-section">Basic details</div>
        <F label="Full name" name="name" required defaultValue={v('name')} />
        <F label="Admission no." name="admissionNo" required defaultValue={v('admissionNo')} placeholder="DIS-2026-004" />
        <F label="School email (login)" name="email" type="email" required defaultValue={v('email')} placeholder="firstname@doonimperial.com" pattern=".+@doonimperial\.com" title="Must be a @doonimperial.com school email" />
        <F label="Class" name="className" required><Select name="className" value={v('className')} options={CLASSES} /></F>
        <F label="Section" name="section" defaultValue={v('section')} placeholder="A" maxLength={3} />
        <F label="Roll no." name="rollNo" defaultValue={v('rollNo')} />
        <F label="Date of birth" name="dob" type="date" defaultValue={v('dob')} />
        <F label="Gender" name="gender"><Select name="gender" value={v('gender') || 'Male'} options={['Male', 'Female', 'Other']} /></F>
        <F label="Blood group" name="bloodGroup"><Select name="bloodGroup" value={v('bloodGroup')} options={BLOOD} /></F>
        <F label="Student mobile" name="phone" defaultValue={v('phone')} inputMode="tel" />
        <F label="Status" name="status"><select id="status" name="status" defaultValue={v('status') || 'ACTIVE'}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></F>

        <div className="form-section">Parents & guardian</div>
        <F label="Father’s name" name="fatherName" defaultValue={v('fatherName')} />
        <F label="Mother’s name" name="motherName" defaultValue={v('motherName')} />
        <F label="Local guardian" name="parentName" defaultValue={v('parentName')} />
        <F label="Parent phone" name="parentPhone" defaultValue={v('parentPhone')} inputMode="tel" />
        <F label="Emergency phone" name="emergencyPhone" defaultValue={v('emergencyPhone')} inputMode="tel" />
        <F label="Address" name="address" span><textarea id="address" name="address" defaultValue={v('address')} rows={2} style={{ minHeight: 64 }} /></F>

        <div className="form-section">Boarding</div>
        <F label="House" name="house"><Select name="house" value={v('house')} options={HOUSES} /></F>
        <F label="Hostel block" name="hostelBlock" defaultValue={v('hostelBlock')} placeholder="Boys Block A" />
        <F label="Room / Bed" name="room"><div style={{ display: 'flex', gap: 8 }}><input name="room" defaultValue={v('room')} placeholder="Room" /><input name="bed" defaultValue={v('bed')} placeholder="Bed" /></div></F>

        <div className="form-section">Login</div>
        <F label={s?.id ? 'Reset password (leave blank to keep)' : 'Initial password'} name="password" type="text" minLength={8} required={!s?.id} autoComplete="new-password" placeholder="Min. 8 characters" />
      </div>
      <div className="form-actions"><SubmitButton>{s?.id ? 'Save changes' : 'Create student'}</SubmitButton></div>
    </form>
  );
}

export function TeacherForm({ t, photo, classes }: { t?: StudentData; photo?: string; classes: string[] }) {
  const v = (k: string) => (t?.[k] instanceof Date ? isoDate(t[k] as Date) : ((t?.[k] as string) ?? ''));
  return (
    <form action={saveTeacher} className="card card-body form">
      {t?.id && <input type="hidden" name="id" value={t.id} />}
      <PhotoInput current={photo} label="Teacher photo" />
      <div className="form-grid three">
        <div className="form-section">Basic details</div>
        <F label="Full name" name="name" required defaultValue={v('name')} />
        <F label="Employee ID" name="employeeId" required defaultValue={v('employeeId')} placeholder="EMP-104" />
        <F label="School email (login)" name="email" type="email" required defaultValue={v('email')} placeholder="firstname@doonimperial.com" pattern=".+@doonimperial\.com" title="Must be a @doonimperial.com school email" />
        <F label="Mobile" name="phone" defaultValue={v('phone')} inputMode="tel" />
        <F label="Date of birth" name="dob" type="date" defaultValue={v('dob')} />
        <F label="Gender" name="gender"><Select name="gender" value={v('gender')} options={['Male', 'Female', 'Other']} /></F>

        <div className="form-section">Role</div>
        <F label="Designation" name="designation" defaultValue={v('designation')} placeholder="PGT Mathematics" />
        <F label="Department" name="department" defaultValue={v('department')} placeholder="Science" />
        <F label="Subjects" name="subjects" defaultValue={v('subjects')} placeholder="Mathematics, Physics" />
        <F label="Class teacher of" name="classTeacherOf"><Select name="classTeacherOf" value={v('classTeacherOf')} options={classes} blank="None" /></F>
        <F label="Qualification" name="qualification" defaultValue={v('qualification')} placeholder="M.Sc., B.Ed." />
        <F label="Joining date" name="joiningDate" type="date" defaultValue={v('joiningDate')} />
        <F label="Status" name="status"><select id="status" name="status" defaultValue={v('status') || 'ACTIVE'}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></F>
        <F label="Address" name="address" span><textarea id="address" name="address" defaultValue={v('address')} rows={2} style={{ minHeight: 64 }} /></F>

        <div className="form-section">Login</div>
        <F label={t?.id ? 'Reset password (leave blank to keep)' : 'Initial password'} name="password" type="text" minLength={8} required={!t?.id} autoComplete="new-password" placeholder="Min. 8 characters" />
      </div>
      <div className="form-actions"><SubmitButton>{t?.id ? 'Save changes' : 'Create teacher'}</SubmitButton></div>
    </form>
  );
}
