import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { activityApi, certificateApi } from '../../api';

const DashboardPage = () => {
  const { user } = useAuth();

  const { data: activities } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activityApi.getAll({ limit: 5 }),
  });

  const { data: certificates } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificateApi.getMyCertificates(),
  });

  const activityCount = activities?.data?.pagination?.total || 0;
  const certificateCount = certificates?.data?.data?.length || 0;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Сайн уу, {user?.name}!</h1>
      <div style={styles.cards}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Үйл ажиллагаа</h3>
          <p style={styles.cardNumber}>{activityCount}</p>
          <p style={styles.cardDesc}>Нийт үйл ажиллагаа</p>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Батламж</h3>
          <p style={styles.cardNumber}>{certificateCount}</p>
          <p style={styles.cardDesc}>Авсан батламж</p>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Үүрэг</h3>
          <p style={styles.cardNumber}>{user?.role}</p>
          <p style={styles.cardDesc}>Системийн үүрэг</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '32px',
  },
  title: {
    color: '#333',
    marginBottom: '24px',
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  cardTitle: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '8px',
  },
  cardNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#4CAF50',
    margin: '8px 0',
  },
  cardDesc: {
    color: '#999',
    fontSize: '12px',
  },
};

export default DashboardPage;