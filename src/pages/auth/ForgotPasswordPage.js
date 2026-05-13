import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/index';
import AuthBackground from '../../components/AuthBackground';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthBackground />
      {sent ? (
        <div className="auth-form" style={{ position: 'relative', zIndex: 1 }}>
          <h1>Имэйл илгээгдлээ</h1>
          <p className="auth-subtitle">
            <strong>{email}</strong> хаяг руу нууц үг сэргээх холбоос илгээлээ.
            Имэйлээ шалгана уу.
          </p>
          <Link to="/login">
            <button type="button" style={{ fontWeight: 500 }}>
              Нэвтрэх хуудас руу буцах
            </button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form" style={{ position: 'relative', zIndex: 1 }}>
          <h1>Нууц үг сэргээх</h1>
          <p className="auth-subtitle">Та бүртгэлтэй имэйл хаягаа оруулна уу</p>

          {error && <div className="alert alert-error">{error}</div>}

          <input
            type="email"
            placeholder="И-мэйл хаяг"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
          />

          <button type="submit" disabled={loading} style={{ fontWeight: 500 }}>
            {loading ? 'Илгээж байна...' : 'Холбоос илгээх'}
          </button>

          <p>
            <Link to="/login">Нэвтрэх хуудас руу буцах</Link>
          </p>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordPage;