import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div style={styles.sidebarTop}>
          <div style={styles.brandRow}>
            <span style={styles.brand}>VolunteerChain</span>
          </div>

          <div ref={dropdownRef} style={styles.avatarWrapper}>
            <button style={styles.avatarBtn} onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div style={styles.avatar}>{initials}</div>
              <div style={styles.avatarInfo}>
                <span style={styles.avatarName}>{user?.name}</span>
                <span style={styles.avatarRole}>{user?.role}</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: '#C3D6EA', flexShrink: 0, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownOpen && (
              <div style={styles.dropdown}>
                <button style={styles.dropdownItem} onClick={() => { navigate('/profile?tab=info'); setDropdownOpen(false); }}>
                  <IconProfile />
                  Хувийн мэдээлэл
                </button>
                <button style={styles.dropdownItem} onClick={() => { navigate('/profile?tab=password'); setDropdownOpen(false); }}>
                  <IconLock />
                  Нууц үг солих
                </button>
                <div style={styles.dropdownDivider} />
                <button style={{ ...styles.dropdownItem, color: '#c62828' }} onClick={handleLogout}>
                  <IconLogout />
                  Гарах
                </button>
              </div>
            )}
          </div>
        </div>
        
        <ul className="nav-links">
          {user?.role === 'ADMIN' && (
            <li>
              <NavLink to="/dashboard">
                <IconDashboard />
                Хяналтын самбар
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to="/activities">
              <IconList />
              Үйл ажиллагаа
            </NavLink>
          </li>
          {user?.role === 'VOLUNTEER' && (
            <li>
              <NavLink to="/certificates">
                <IconCertificate />
                Батламж
              </NavLink>
            </li>
          )}
          {user?.role === 'VOLUNTEER' && (
            <li>
              <NavLink to="/participations">
                <IconParticipation />
                Оролцоо
              </NavLink>
            </li>
          )}
          {user?.role === 'ADMIN' && (
            <li>
              <NavLink to="/admin/users">
                <IconUsers />
                Хэрэглэгчид
              </NavLink>
            </li>
          )}
        </ul>

        <button
          className="logout-btn"
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', width: '90%', cursor: 'pointer', marginTop: 'auto' }}
        >
          <IconLogout />
          <span style={{ lineHeight: '1' }}>Гарах</span>
        </button>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

const styles = {
  sidebarTop: { padding: '20px 16px 8px' },
  brandRow: { marginBottom: 16 },
  brand: { fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '0.2px' },
  avatarWrapper: { position: 'relative' },
  avatarBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
    padding: '8px 10px', cursor: 'pointer', textAlign: 'left',
  },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: '#C3D6EA', color: '#00203D',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, flexShrink: 0,
  },
  avatarInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' },
  avatarName: { fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  avatarRole: { fontSize: 10, fontWeight: 600, color: '#C3D6EA', textTransform: 'uppercase', letterSpacing: '0.4px' },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
    background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0,32,61,0.15)', zIndex: 100, overflow: 'hidden',
  },
  dropdownItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', padding: '10px 14px', background: 'none',
    border: 'none', cursor: 'pointer', fontSize: 13, color: '#00203D',
    fontWeight: 500, textAlign: 'left',
  },
  dropdownDivider: { height: 1, background: '#E0E0E0', margin: '4px 0' },
};

const IconDashboard = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const IconList = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const IconCertificate = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);
const IconParticipation = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconUsers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconProfile = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default Layout;