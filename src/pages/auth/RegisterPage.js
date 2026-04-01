import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Бүртгүүлэх</h2>
          <p style={styles.subtitle}>VolunteerChain системд тавтай морил</p>
        </div>

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
                minLength: { value: 8, message: 'Нууц үг хамгийн багадаа 8 тэмдэгт байна' }
              })}
            />
            {errors.password && <span style={styles.error}>{errors.password.message}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Үүрэг</label>
            <select style={styles.input} {...register('role')}>
              <option value="VOLUNTEER">Сайн дурынхан</option>
              <option value="ORGANIZER">Зохион байгуулагч</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Оюутны дугаар <span style={styles.optional}>(сонголтоор)</span></label>
            <input
              style={styles.input}
              placeholder="B222XXXXXX"
              {...register('identifier')}
            />
          </div>

          <button style={{
            ...styles.button,
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }} type="submit" disabled={isSubmitting}>
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
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00203D',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '400px',
  },
  header: {
    marginBottom: '28px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#00203D',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#718096',
    margin: 0,
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#4A5568',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  optional: {
    color: '#718096',
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #E0E0E0',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#00203D',
    backgroundColor: '#FFFFFF',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.15s ease',
    fontFamily: 'inherit',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#00203D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '8px',
    transition: 'background 0.15s ease',
    fontFamily: 'inherit',
  },
  error: {
    color: '#EB4C4C',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block',
  },
  link: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '13px',
    color: '#718096',
  },
  linkAnchor: {
    color: '#00203D',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default RegisterPage;