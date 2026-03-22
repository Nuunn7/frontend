
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const ActivityDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => activityApi.getById(id),
    onSuccess: (res) => {
      const a = res.data.data;
      setForm({
        title: a.title,
        description: a.description,
        date: a.date?.slice(0, 16),
        location: a.location,
        maxParticipants: a.max_participants || '',
      });
    },
  });

  const { data: participationsData } = useQuery({
    queryKey: ['participations', id],
    queryFn: () => activityApi.getParticipations(id),
    enabled: user?.role === 'ORGANIZER' || user?.role === 'ADMIN',
  });

  const updateMutation = useMutation({
    mutationFn: (data) => activityApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['activity', id]);
      queryClient.invalidateQueries(['activities']);
      setEditMode(false);
      alert('Амжилттай шинэчлэгдлээ!');
    },
    onError: (err) => alert(err.response?.data?.message || 'Алдаа гарлаа'),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ userId, hours }) => activityApi.verifyParticipation(id, userId, { hours }),
    onSuccess: () => {
      queryClient.invalidateQueries(['participations', id]);
      alert('Амжилттай баталгаажлаа!');
    },
    onError: (err) => alert(err.response?.data?.message || 'Алдаа гарлаа'),
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  if (isLoading) return <div style={styles.loading}>Ачааллаж байна...</div>;

  const activity = data?.data?.data;
  const participations = participationsData?.data?.data || [];

  if (!activity) return <div style={styles.loading}>Олдсонгүй</div>;

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/activities')}>
        ← Буцах
      </button>

      {/* Activity detail / edit */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.title}>
            {editMode ? 'Засварлах' : activity.title}
          </h2>
          <div style={styles.headerActions}>
            <span style={{
              ...styles.badge,
              backgroundColor: activity.status === 'UPCOMING' ? '#e8f5e9' : '#fff3e0',
              color: activity.status === 'UPCOMING' ? '#4CAF50' : '#FF9800',
            }}>
              {activity.status}
            </span>
            {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && !editMode && (
              <button style={styles.editBtn} onClick={() => setEditMode(true)}>
                Засварлах
              </button>
            )}
          </div>
        </div>

        {editMode && form ? (
          <form onSubmit={handleUpdate}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Нэр</label>
                <input
                  style={styles.input}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Байршил</label>
                <input
                  style={styles.input}
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Огноо</label>
                <input
                  style={styles.input}
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Хамгийн их оролцогч</label>
                <input
                  style={styles.input}
                  type="number"
                  value={form.maxParticipants}
                  onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Тайлбар</label>
              <textarea
                style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div style={styles.formActions}>
              <button style={styles.submitBtn} type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
              <button style={styles.cancelBtn} type="button" onClick={() => setEditMode(false)}>
                Болих
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p style={styles.desc}>{activity.description}</p>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>📍 Байршил</span>
                <span style={styles.infoValue}>{activity.location}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>📅 Огноо</span>
                <span style={styles.infoValue}>
                  {new Date(activity.date).toLocaleString('mn-MN')}
                </span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>👥 Оролцогч</span>
                <span style={styles.infoValue}>{activity.participant_count || 0}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>👤 Зохион байгуулагч</span>
                <span style={styles.infoValue}>{activity.organizer_name}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Participations - only for ORGANIZER/ADMIN */}
      {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Оролцогчид</h3>
          {participations.length === 0 ? (
            <p style={styles.empty}>Оролцогч байхгүй байна</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Нэр</th>
                  <th style={styles.th}>И-мэйл</th>
                  <th style={styles.th}>Статус</th>
                  <th style={styles.th}>Цаг</th>
                  <th style={styles.th}>Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {participations.map((p) => (
                  <ParticipationRow
                    key={p.id}
                    participation={p}
                    onVerify={(hours) => verifyMutation.mutate({ userId: p.user_id, hours })}
                    isVerifying={verifyMutation.isPending}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

const ParticipationRow = ({ participation, onVerify, isVerifying }) => {
  const [hours, setHours] = useState('');

  return (
    <tr>
      <td style={styles.td}>{participation.user_name}</td>
      <td style={styles.td}>{participation.user_email}</td>
      <td style={styles.td}>
        <span style={{
          ...styles.statusBadge,
          backgroundColor: participation.status === 'VERIFIED' ? '#e8f5e9' :
            participation.status === 'REJECTED' ? '#ffebee' : '#fff3e0',
          color: participation.status === 'VERIFIED' ? '#4CAF50' :
            participation.status === 'REJECTED' ? '#f44336' : '#FF9800',
        }}>
          {participation.status}
        </span>
      </td>
      <td style={styles.td}>{participation.hours || '-'}</td>
      <td style={styles.td}>
        {participation.status === 'PENDING' && (
          <div style={styles.verifyRow}>
            <input
              style={styles.hoursInput}
              type="number"
              placeholder="Цаг"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              min="0"
              step="0.5"
            />
            <button
              style={styles.verifyBtn}
              onClick={() => onVerify(hours)}
              disabled={!hours || isVerifying}
            >
              Баталгаажуулах
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

const styles = {
  container: { padding: '32px' },
  loading: { padding: '32px', textAlign: 'center', color: '#666' },
  backBtn: { marginBottom: '20px', padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  card: { backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '24px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  title: { color: '#333', fontSize: '22px' },
  headerActions: { display: 'flex', alignItems: 'center', gap: '12px' },
  badge: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  editBtn: { padding: '8px 16px', backgroundColor: '#2196F3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  desc: { color: '#666', lineHeight: '1.6', marginBottom: '20px' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  infoLabel: { fontSize: '12px', color: '#999' },
  infoValue: { fontSize: '14px', color: '#333', fontWeight: '500' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', color: '#555', fontSize: '14px' },
  input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
  formActions: { display: 'flex', gap: '12px' },
  submitBtn: { padding: '10px 24px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  cancelBtn: { padding: '10px 24px', backgroundColor: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  sectionTitle: { color: '#333', marginBottom: '16px' },
  empty: { color: '#999', textAlign: 'center', padding: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #eee', fontSize: '13px', color: '#666' },
  td: { padding: '12px', borderBottom: '1px solid #eee', fontSize: '14px', color: '#333' },
  statusBadge: { padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  verifyRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  hoursInput: { width: '70px', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' },
  verifyBtn: { padding: '6px 12px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
};

export default ActivityDetailPage;