import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <nav style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.logo}>VolunteerChain</h2>
          <p style={styles.userName}>{user?.name}</p>
          <span style={styles.roleBadge}>{user?.role}</span>
        </div>
        <ul style={styles.navList}>
          <li>
            <NavLink
              to="/dashboard"
              style={({ isActive }) => ({
                ...styles.navLink,
                backgroundColor: isActive ? '#4CAF50' : 'transparent',
                color: isActive ? '#fff' : '#333',
              })}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/activities"
              style={({ isActive }) => ({
                ...styles.navLink,
                backgroundColor: isActive ? '#4CAF50' : 'transparent',
                color: isActive ? '#fff' : '#333',
              })}
            >
              Үйл ажиллагаа
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/certificates"
              style={({ isActive }) => ({
                ...styles.navLink,
                backgroundColor: isActive ? '#4CAF50' : 'transparent',
                color: isActive ? '#fff' : '#333',
              })}
            >
              Батламж
            </NavLink>
          </li>
        </ul>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Гарах
        </button>
      </nav>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#fff',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
  },
  sidebarHeader: {
    padding: '0 20px 20px',
    borderBottom: '1px solid #eee',
    marginBottom: '20px',
  },
  logo: {
    color: '#4CAF50',
    margin: '0 0 8px',
    fontSize: '18px',
  },
  userName: {
    margin: '0 0 4px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  roleBadge: {
    backgroundColor: '#e8f5e9',
    color: '#4CAF50',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
  },
  navList: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
    flex: 1,
  },
  navLink: {
    display: 'block',
    padding: '12px 20px',
    textDecoration: 'none',
    fontSize: '14px',
    borderRadius: '4px',
    margin: '2px 8px',
  },
  logoutBtn: {
    margin: '20px',
    padding: '10px',
    backgroundColor: '#ff5252',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default Layout;