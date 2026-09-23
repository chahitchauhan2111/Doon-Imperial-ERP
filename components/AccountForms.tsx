import { KeyRound, UserPen } from 'lucide-react';
import PhotoInput from './PhotoInput';
import SubmitButton from './SubmitButton';
import { CardHead } from './ui';
import { changePassword, updateMyProfile } from '@/app/actions/account';

export function ProfileEditForm({ photo, phone }: { photo: string; phone: string | null }) {
  return (
    <div className="card">
      <CardHead icon={UserPen} title="Update photo & contact" />
      <form action={updateMyProfile} className="card-body form">
        <PhotoInput current={photo} />
        <div className="field"><label>Mobile number</label><input name="phone" defaultValue={phone || ''} inputMode="tel" maxLength={20} /></div>
        <div className="form-actions"><SubmitButton>Save changes</SubmitButton></div>
      </form>
    </div>
  );
}

export function PasswordForm() {
  return (
    <div className="card">
      <CardHead icon={KeyRound} title="Change password" />
      <form action={changePassword} className="card-body form">
        <div className="field"><label>Current password</label><input type="password" name="current" autoComplete="current-password" required /></div>
        <div className="field"><label>New password</label><input type="password" name="next" minLength={8} autoComplete="new-password" required /></div>
        <div className="field"><label>Confirm new password</label><input type="password" name="confirm" minLength={8} autoComplete="new-password" required /></div>
        <div className="form-actions"><SubmitButton>Update password</SubmitButton></div>
      </form>
    </div>
  );
}
