import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ActivitiesPage from './pages/activity/ActivityPage';
import ActivityDetailPage from './pages/activity/ActivityDetailPage';
import CertificatesPage from './pages/certificate/CertificatesPage';
import MyParticipationsPage from './pages/participation/MyParticipationsPage';
import ProfilePage from './pages/profile/ProfilePage';
import AdminUsersPage from './pages/admin/AdminUserPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (isAuthenticated) return <Navigate to={user?.role === 'VOLUNTEER' ? '/activities' : '/dashboard'} replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (user?.role !== 'ADMIN') return <Navigate to="/activities" replace />;
  return children;
};

const OrgAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (user?.role === 'VOLUNTEER') return <Navigate to="/activities" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
      <Route path="dashboard" element={<OrgAdminRoute><DashboardPage /></OrgAdminRoute>} />
      <Route path="activities" element={<ActivitiesPage />} />
      <Route path="activities/:id" element={<ActivityDetailPage />} />
      <Route path="certificates" element={<CertificatesPage />} />
      <Route path="participations" element={<MyParticipationsPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;