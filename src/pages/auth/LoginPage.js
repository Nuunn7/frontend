import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthBackground from '../../components/AuthBackground';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.target);
    try {
      await login({
        email: form.get('email'),
        password: form.get('password'),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Нэвтрэх үед алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthBackground />
      <form onSubmit={handleSubmit} className="auth-form" style={{ position: 'relative', zIndex: 1 }}>
        <h1>Нэвтрэх</h1>
        {error && <div className="alert alert-error">{error}</div>}

        <input
          name="email"
          type="email"
          placeholder="И-мэйл хаяг"
          required
          autoComplete="email"
        />
        <input
          name="password"
          type="password"
          placeholder="Нууц үг"
          required
          autoComplete="current-password"
        />
        <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '8px' }}>
          <Link to="/forgot-password" className="text-muted text-sm">
            Нууц үг мартсан уу?
          </Link>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
        </button>

        <p>
          Бүртгэлгүй юу? <Link to="/register">Бүртгүүлэх</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;