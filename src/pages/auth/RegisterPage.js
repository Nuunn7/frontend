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
        <h2 style={styles.title}>Бүртгүүлэх</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={styles.field}>
            <label style={styles.label}>Нэр</label>
            <input
              style={styles.input}
              {...register('name', { required: 'Нэр шаардлагатай' })}
            />
            {errors.name && <span style={styles.error}>{errors.name.message}</span>}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>И-мэйл</label>
            <input
              style={styles.input}
              type="email"
              {...register('email', { required: 'И-мэйл шаардлагатай' })}
            />
            {errors.email && <span style={styles.error}>{errors.email.message}</span>}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Нууц үг</label>
            <input
              style={styles.input}
              type="password"
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
            <label style={styles.label}>Оюутны дугаар (сонголтоор)</label>
            <input
              style={styles.input}
              {...register('identifier')}
            />
          </div>
          <button style={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Түр хүлээнэ үү...' : 'Бүртгүүлэх'}
          </button>
        </form>
        <p style={styles.link}>
          Бүртгэл байгаа юу? <Link to="/login">Нэвтрэх</Link>
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
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#333',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#555',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  error: {
    color: 'red',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block',
  },
  link: {
    textAlign: 'center',
    marginTop: '16px',
    fontSize: '14px',
  },
};

export default RegisterPage;