import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api';
import { User, Lock, Save, Loader } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'info';

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    identifier: user?.identifier || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const profileMutation = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      setProfileSuccess('Профайл амжилттай шинэчлэгдлээ.');
      setProfileError('');
    },
    onError: (err) => {
      setProfileError(err.response?.data?.message || 'Алдаа гарлаа.');
      setProfileSuccess('');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: userApi.changePassword,
    onSuccess: () => {
      setPasswordSuccess('Нууц үг амжилттай солигдлоо.');
      setPasswordError('');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => {
      setPasswordError(err.response?.data?.message || 'Алдаа гарлаа.');
      setPasswordSuccess('');
    },
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    profileMutation.mutate(profile);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('Нууц үг таарахгүй байна.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.');
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Профайл</h1>
        <p style={styles.subtitle}>Хувийн мэдээлэл болон нууц үг</p>
      </div>

      <div style={styles.card}>
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>{initials}</div>
          <div>
            <div style={styles.avatarName}>{user?.name}</div>
            <div style={styles.avatarEmail}>{user?.email}</div>
            <span style={styles.roleBadge}>{user?.role}</span>
          </div>
        </div>

        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'info' ? styles.tabActive : {}) }}
            onClick={() => setSearchParams({ tab: 'info' })}
          >
            <User size={14} />
            Хувийн мэдээлэл
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'password' ? styles.tabActive : {}) }}
            onClick={() => setSearchParams({ tab: 'password' })}
          >
            <Lock size={14} />
            Нууц үг солих
          </button>
        </div>

        <div style={styles.tabContent}>
          {activeTab === 'info' && (
            <form onSubmit={handleProfileSubmit}>
              {profileSuccess && <div style={styles.success}>{profileSuccess}</div>}
              {profileError && <div className="alert alert-error">{profileError}</div>}

              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Нэр</label>
                  <input
                    style={styles.input}
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>И-мэйл</label>
                  <input
                    style={styles.input}
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Код</label>
                  <input
                    style={styles.input}
                    value={profile.identifier}
                    onChange={(e) => setProfile({ ...profile, identifier: e.target.value })}
                    placeholder="Код"
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Эрх</label>
                  <div style={styles.roleRow}>
                    <span style={styles.roleValue}>{user?.role}</span>
                  </div>
                </div>
              </div>

              <button style={styles.submitBtn} type="submit" disabled={profileMutation.isPending}>
                {profileMutation.isPending
                  ? <><Loader size={14} /> Хадгалж байна...</>
                  : <><Save size={14} /> Хадгалах</>}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} style={{ maxWidth: 400 }}>
              {passwordSuccess && <div style={styles.success}>{passwordSuccess}</div>}
              {passwordError && <div className="alert alert-error">{passwordError}</div>}

              <div style={styles.field}>
                <label style={styles.label}>Одоогийн нууц үг</label>
                <input
                  style={styles.input}
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  required
                  autoComplete="current-password"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Шинэ нууц үг</label>
                <input
                  style={styles.input}
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Нууц үг давтах</label>
                <input
                  style={styles.input}
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                />
              </div>

              <button style={styles.submitBtn} type="submit" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending
                  ? <><Loader size={14} /> Солж байна...</>
                  : <><Save size={14} /> Нууц үг солих</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: '#00203D', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#718096' },
  card: { background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, overflow: 'hidden' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: 16, padding: '24px 24px 20px', borderBottom: '1px solid #E0E0E0' },
  avatar: { width: 56, height: 56, borderRadius: '50%', background: '#00203D', color: '#C3D6EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 },
  avatarName: { fontSize: 15, fontWeight: 700, color: '#00203D', marginBottom: 2 },
  avatarEmail: { fontSize: 12, color: '#718096', marginBottom: 6 },
  roleBadge: { fontSize: 10, fontWeight: 700, color: '#00203D', background: '#C3D6EA', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.4px' },
  tabs: { display: 'flex', borderBottom: '1px solid #E0E0E0', padding: '0 24px' },
  tab: { display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#718096', marginBottom: '-1px' },
  tabActive: { color: '#00203D', borderBottomColor: '#00203D', fontWeight: 600 },
  tabContent: { padding: 24 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 },
  field: { marginBottom: 16 },
  label: { display: 'block', marginBottom: 6, color: '#4A5568', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13, color: '#00203D', boxSizing: 'border-box', outline: 'none' },
  roleRow: { padding: '9px 12px', background: '#F4F6FF', borderRadius: 6, border: '1px solid #E0E0E0' },
  roleValue: { fontSize: 13, fontWeight: 600, color: '#00203D' },
  submitBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#00203D', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  success: { background: 'rgba(160,213,133,0.2)', color: '#2e7d32', border: '1px solid rgba(160,213,133,0.4)', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 16 },
};

export default ProfilePage;