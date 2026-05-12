import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../api/index';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-form">
          <h1>Холбоос буруу байна</h1>
          <p className="auth-subtitle">Нууц үг сэргээх холбоос хүчингүй байна.</p>
          <Link to="/forgot-password">
            <button type="button">Дахин оролдох</button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirm) {
      setError('Нууц үг таарахгүй байна.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Алдаа гарлаа. Холбоос хүчингүй байж болзошгүй.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-form">
          <h1>Амжилттай</h1>
          <p className="auth-subtitle">Нууц үг амжилттай солигдлоо. Одоо нэвтэрч болно.</p>
          <button type="button" onClick={() => navigate('/login')}>
            Нэвтрэх
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>Нууц үг сэргээх</h1>
        <p className="auth-subtitle">Шинэ нууц үгээ оруулна уу</p>

        {error && <div className="alert alert-error">{error}</div>}

        <input
          type="password"
          placeholder="Шинэ нууц үг"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          disabled={loading}
          autoComplete="new-password"
        />
        <input
          type="password"
          placeholder="Нууц үг давтах"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          disabled={loading}
          autoComplete="new-password"
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Хадгалж байна...' : 'Нууц үг солих'}
        </button>

        <p>
          <Link to="/login">Нэвтрэх хуудас руу буцах</Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPasswordPage;