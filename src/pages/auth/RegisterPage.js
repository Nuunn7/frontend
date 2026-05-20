import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthBackground from '../../components/AuthBackground';

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Бүртгэл амжилтгүй боллоо.');
    }
  };

  return (
    <div className="auth-page">
      <AuthBackground />
      <Link to="/" style={{
        position: 'absolute', top: 20, left: 24, zIndex: 2,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        color: '#C3D6EA', fontSize: 13, textDecoration: 'none',
        fontWeight: 500,
      }}> ← Нүүр хуудас
      </Link>
      <div className="auth-form" style={{ position: 'relative', zIndex: 1, maxHeight: '90vh', overflowY: 'auto' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={styles.field}>
            <label style={styles.label}>Нэр</label>
            <input
              style={styles.input}
              placeholder="Овог нэр"
              {...register('name', { required: 'Нэр шаардлагатай' })}
            />
            {errors.name && <span style={styles.error}>{errors.name.message}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>И-мэйл</label>
            <input
              style={styles.input}
              type="email"
              placeholder="example@mail.com"
              {...register('email', { required: 'И-мэйл шаардлагатай' })}
            />
            {errors.email && <span style={styles.error}>{errors.email.message}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Нууц үг</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Хамгийн багадаа 8 тэмдэгт"
              {...register('password', {
                required: 'Нууц үг шаардлагатай',
                minLength: { value: 8, message: 'Нууц үг хамгийн багадаа 8 тэмдэгт байна' },
              })}
            />
            {errors.password && <span style={styles.error}>{errors.password.message}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Үүрэг</label>
            <select style={styles.input} {...register('role')}>
              <option value="VOLUNTEER">Сайн дурын ажилтан</option>
              <option value="ORGANIZER">Зохион байгуулагч</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Оюутны код <span style={styles.optional}>(сонголтоор)</span>
            </label>
            <input
              style={styles.input}
              placeholder="B22XXXXXXX"
              {...register('identifier')}
            />
          </div>

          <button
            style={{ ...styles.button, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Түр хүлээнэ үү...' : 'Бүртгүүлэх'}
          </button>
        </form>

        <p style={styles.link}>
          Бүртгэл байгаа юу? <Link to="/login" style={styles.linkAnchor}>Нэвтрэх</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', color: '#4A5568', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' },
  optional: { color: '#718096', fontWeight: '400', textTransform: 'none', letterSpacing: 0 },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: '6px', fontSize: '13px', color: '#00203D', backgroundColor: '#FFFFFF', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  button: { width: '100%', padding: '10px', backgroundColor: '#00203D', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', marginTop: '8px', fontFamily: 'inherit', cursor: 'pointer' },
  error: { color: '#EB4C4C', fontSize: '12px', marginTop: '4px', display: 'block' },
  link: { textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#718096' },
  linkAnchor: { color: '#00203D', fontWeight: '600', textDecoration: 'none' },
};

export default RegisterPage;