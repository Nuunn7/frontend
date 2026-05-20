import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userApi, certificateApi } from '../../api';
import { Calendar, MapPin, Clock, Inbox, Award, Loader } from 'lucide-react';

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

const Toast = ({ message, type, onClose }) => (
  <div style={{
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    padding: '12px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    background: type === 'error' ? '#c62828' : '#2e7d32',
    color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    display: 'flex', alignItems: 'center', gap: 10,
  }}>
    <span>{message}</span>
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16 }}>×</button>
  </div>
);

const MyParticipationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState(null);
  const [issuingId, setIssuingId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-participations', user?.id],
    queryFn: () => userApi.getParticipations(user.id),
    enabled: !!user?.id,
  });

  const issueMutation = useMutation({
    mutationFn: (participationId) => certificateApi.issue(participationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-participations']);
      queryClient.invalidateQueries(['certificates']);
      setIssuingId(null);
      showToast('Батламж амжилттай олгогдлоо!');
      setTimeout(() => navigate('/certificates'), 1500);
    },
    onError: (err) => {
      setIssuingId(null);
      showToast(err.response?.data?.message || 'Батламж олгоход алдаа гарлаа.', 'error');
    },
  });

  const handleIssueCertificate = (participationId) => {
    setIssuingId(participationId);
    issueMutation.mutate(participationId);
  };

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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Миний оролцоо</h1>
          <p style={styles.subtitle}>Нийт {participations.length} оролцоо</p>
        </div>
      </div>

      {participations.length === 0 ? (
        <div style={styles.empty}>
          <Inbox size={40} color="#C3D6EA" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: '#00203D', marginBottom: 4 }}>Оролцоо байхгүй байна</p>
          <small style={{ color: '#718096' }}>Үйл ажиллагаанд бүртгүүлснээр энд харагдана.</small>
        </div>
      ) : (
        <div style={styles.grid}>
          {participations.map((p) => {
            const sc = statusColors[p.status] || statusColors.PENDING;
            const canGetCertificate = p.status === 'APPROVED' && p.hours && !p.certificate_id;
            const hasCertificate = !!p.certificate_id;
            const issuing = issuingId === p.id;

            return (
              <div key={p.id} style={{
                ...styles.card,
                borderTop: p.status === 'APPROVED' ? '3px solid #A0D585' :
                           p.status === 'REJECTED' ? '3px solid #EB4C4C' :
                           '3px solid #F3C623',
              }}>
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
                    <span>{p.activity_date ? new Date(p.activity_date).toLocaleDateString('mn-MN') : '—'}</span>
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

                  {hasCertificate && (
                    <button
                      style={styles.certDoneBtn}
                      onClick={() => navigate('/certificates')}
                    >
                      <Award size={13} /> Батламж харах
                    </button>
                  )}

                  {canGetCertificate && (
                    <button
                      style={{ ...styles.certBtn, opacity: issuing ? 0.7 : 1, cursor: issuing ? 'not-allowed' : 'pointer' }}
                      onClick={() => handleIssueCertificate(p.id)}
                      disabled={issuing}
                    >
                      {issuing
                        ? <><Loader size={13} /> Олгож байна...</>
                        : <><Award size={13} /> Батламж авах</>}
                    </button>
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
  card: { background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#00203D', flex: 1, marginRight: 8 },
  badge: { fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.4px' },
  infoBlock: { display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid #E0E0E0', paddingTop: 12, marginBottom: 12, flex: 1 },
  infoRow: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#718096' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  dateLabel: { fontSize: 11, color: '#718096' },
  certBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#00203D', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500 },
  certDoneBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(160,213,133,0.2)', color: '#2e7d32', border: '1px solid rgba(160,213,133,0.4)', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer' },
};

export default MyParticipationsPage;