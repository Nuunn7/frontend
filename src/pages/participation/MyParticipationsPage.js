import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api';
import { Calendar, MapPin, Clock, Inbox } from 'lucide-react';

const statusColors = {
  PENDING:  { bg: 'rgba(243,198,35,0.15)', color: '#b8860b' },
  APPROVED: { bg: 'rgba(160,213,133,0.2)', color: '#2e7d32' },
  REJECTED: { bg: 'rgba(235,76,76,0.12)',  color: '#c62828' },
};

const statusLabel = {
  PENDING:  'Хүлээгдэж байна',
  APPROVED: 'Баталгаажсан',
  REJECTED: 'Татгалзсан',
};

const MyParticipationsPage = () => {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-participations', user?.id],
    queryFn: () => userApi.getParticipations(user.id),
    enabled: !!user?.id,
  });

  const participations = data?.data?.data || [];

  if (isLoading) return (
    <div style={styles.loading}>
      <Clock size={18} color="#718096" />
      <span>Ачааллаж байна...</span>
    </div>
  );

  if (isError) return (
    <div className="alert alert-error">Оролцоог ачааллахад алдаа гарлаа.</div>
  );

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Миний оролцоо</h1>
          <p style={styles.subtitle}>Нийт {participations.length} оролцоо</p>
        </div>
      </div>

      {participations.length === 0 ? (
        <div style={styles.empty}>
          <Inbox size={40} color="#C3D6EA" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: '#00203D', marginBottom: 4 }}>
            Оролцоо байхгүй байна
          </p>
          <small style={{ color: '#718096' }}>
            Үйл ажиллагаанд бүртгүүлснээр энд харагдана.
          </small>
        </div>
      ) : (
        <div style={styles.grid}>
          {participations.map((p) => {
            const sc = statusColors[p.status] || statusColors.PENDING;
            return (
              <div key={p.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{p.activity_title}</h3>
                  <span style={{ ...styles.badge, background: sc.bg, color: sc.color }}>
                    {statusLabel[p.status] || p.status}
                  </span>
                </div>

                <div style={styles.infoBlock}>
                  <div style={styles.infoRow}>
                    <MapPin size={13} color="#718096" />
                    <span>{p.activity_location || '—'}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <Calendar size={13} color="#718096" />
                    <span>
                      {p.activity_date
                        ? new Date(p.activity_date).toLocaleDateString('mn-MN')
                        : '—'}
                    </span>
                  </div>
                  {p.hours && (
                    <div style={styles.infoRow}>
                      <Clock size={13} color="#718096" />
                      <span>{p.hours} цаг</span>
                    </div>
                  )}
                </div>

                <div style={styles.cardFooter}>
                  <span style={styles.dateLabel}>
                    Бүртгүүлсэн: {new Date(p.created_at).toLocaleDateString('mn-MN')}
                  </span>
                  {p.status === 'APPROVED' && p.hours && (
                    <span style={styles.hoursTag}>{p.hours} цаг баталгаажсан</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: '#00203D', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#718096' },
  loading: { display: 'flex', alignItems: 'center', gap: 10, padding: 32, color: '#718096', fontSize: 14 },
  empty: { textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  card: { background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: 20 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#00203D', flex: 1, marginRight: 8 },
  badge: { fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.4px' },
  infoBlock: { display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid #E0E0E0', paddingTop: 12, marginBottom: 12 },
  infoRow: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#718096' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dateLabel: { fontSize: 11, color: '#718096' },
  hoursTag: { fontSize: 11, fontWeight: 600, color: '#2e7d32', background: 'rgba(160,213,133,0.2)', padding: '2px 8px', borderRadius: 4 },
};

export default MyParticipationsPage;