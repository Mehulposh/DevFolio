import { useState } from 'react';
import { Save, Upload, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SettingsAdmin() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    socialLinks: {
      github: user?.socialLinks?.github || '',
      linkedin: user?.socialLinks?.linkedin || '',
      twitter: user?.socialLinks?.twitter || '',
      website: user?.socialLinks?.website || ''
    }
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(p => ({ ...p, avatar: res.data.url }));
      toast.success('Avatar uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploadingAvatar(false); }
  };

  const handleProfileSave = async () => {
    if (!profile.name.trim()) { toast.error('Name is required'); return; }
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', profile);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSavingProfile(false); }
  };

  const handlePasswordSave = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error('Please fill all password fields'); return;
    }
    if (passwords.newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (passwords.newPassword !== passwords.confirm) { toast.error('Passwords do not match'); return; }

    setSavingPass(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally { setSavingPass(false); }
  };

  return (
    <div className="settings-page">
      <div className="page-top">
        <h2 className="page-title">Settings</h2>
        <p className="page-desc">Manage your profile and account</p>
      </div>

      {/* Profile */}
      <div className="settings-section">
        <h3 className="section-title">Profile</h3>
        <div className="settings-card">
          {/* Avatar */}
          <div className="avatar-row">
            <div className="avatar-lg">
              {profile.avatar
                ? <img src={profile.avatar} alt={profile.name} />
                : <span>{profile.name?.[0] || 'A'}</span>
              }
            </div>
            <div>
              <label className="upload-btn-label">
                {uploadingAvatar
                  ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  : <><Upload size={14} /> Upload Photo</>
                }
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
              </label>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>JPG, PNG · Max 2MB · Recommended 200×200</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                className="form-input"
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              className="form-textarea"
              value={profile.bio}
              onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
              placeholder="A brief bio shown on your blog posts..."
              rows={3}
            />
          </div>

          <div className="section-subtitle">Social Links</div>
          <div className="settings-grid">
            {Object.entries({
              github: 'GitHub URL',
              linkedin: 'LinkedIn URL',
              twitter: 'Twitter URL',
              website: 'Personal Website'
            }).map(([key, label]) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input
                  type="url"
                  className="form-input"
                  value={profile.socialLinks[key]}
                  onChange={e => setProfile(p => ({
                    ...p,
                    socialLinks: { ...p.socialLinks, [key]: e.target.value }
                  }))}
                  placeholder={`https://...`}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={handleProfileSave} className="btn btn-primary" disabled={savingProfile}>
              {savingProfile
                ? <span className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} />
                : <Save size={14} />
              }
              Save Profile
            </button>
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="settings-section">
        <h3 className="section-title">Change Password</h3>
        <div className="settings-card">
          <div className="pass-fields">
            {[
              { key: 'currentPassword', label: 'Current Password' },
              { key: 'newPassword', label: 'New Password' },
              { key: 'confirm', label: 'Confirm New Password' }
            ].map(({ key, label }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <div className="pass-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    value={passwords[key]}
                    onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                    placeholder="••••••••"
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={handlePasswordSave} className="btn btn-primary" disabled={savingPass}>
              {savingPass
                ? <span className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} />
                : <Save size={14} />
              }
              Change Password
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .settings-page { max-width: 800px; }
        .page-top { margin-bottom: 32px; }
        .page-title { font-size: 1.8rem; margin-bottom: 4px; }
        .page-desc { font-size: 13px; color: var(--text-3); }
        .settings-section { margin-bottom: 32px; }
        .section-title { font-family: var(--font-display); font-size: 1.2rem; color: var(--text); margin-bottom: 16px; }
        .section-subtitle { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-3); margin: 20px 0 12px; border-top: 1px solid var(--border); padding-top: 16px; }
        .settings-card { background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; display: flex; flex-direction: column; gap: 16px; }
        .avatar-row { display: flex; align-items: center; gap: 20px; }
        .avatar-lg { width: 80px; height: 80px; border-radius: 50%; background: var(--bg-4); border: 2px solid var(--border); overflow: hidden; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 28px; color: var(--text-2); flex-shrink: 0; }
        .avatar-lg img { width: 100%; height: 100%; object-fit: cover; }
        .upload-btn-label { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: var(--bg-3); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-2); font-size: 13px; cursor: pointer; transition: all 0.15s; }
        .upload-btn-label:hover { border-color: var(--accent); color: var(--accent); }
        .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .pass-fields { display: flex; flex-direction: column; gap: 16px; }
        .pass-wrap { position: relative; }
        .pass-wrap .form-input { padding-right: 40px; }
        .pass-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-3); cursor: pointer; display: flex; align-items: center; }
        .pass-toggle:hover { color: var(--text); }
        @media (max-width: 600px) { .settings-grid { grid-template-columns: 1fr; } .avatar-row { flex-direction: column; align-items: flex-start; } }
      `}</style>
    </div>
  );
}