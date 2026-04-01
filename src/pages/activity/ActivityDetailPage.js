import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Added Lucide icons
import { MapPin, Calendar, Users, User, ArrowLeft, Edit2 } from 'lucide-react';
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

  const statusColors = {
    UPCOMING:  { bg: '#C3D6EA', color: '#00203D' },
    ONGOING:   { bg: 'rgba(243,198,35,0.15)', color: '#b8860b' },
    COMPLETED: { bg: 'rgba(160,213,133,0.2)', color: '#2e7d32' },
    CANCELLED: { bg: 'rgba(235,76,76,0.12)', color: '#c62828' },
  };
  const sc = statusColors[activity.status] || statusColors.UPCOMING;

  return (
    <div style={styles.container}>
      {/* Back */}
      <button style={styles.backBtn} onClick={() => navigate('/activities')}>
        <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Буцах
      </button>

      {/* Activity card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.title}>
            {editMode ? 'Үйл ажиллагаа засварлах' : activity.title}
          </h2>
          <div style={styles.headerActions}>
            <span style={{ ...styles.badge, background: sc.bg, color: sc.color }}>
              {activity.status}
            </span>
            {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && !editMode && (
              <button style={styles.editBtn} onClick={() => setEditMode(true)}>
                <Edit2 size={14} style={{ marginRight: '6px' }} /> Засварлах
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
              <InfoItem icon={<MapPin size={16} />} label="Байршил"  value={activity.location} />
              <InfoItem icon={<Calendar size={16} />} label="Огноо"    value={new Date(activity.date).toLocaleString('mn-MN')} />
              <InfoItem icon={<Users size={16} />} label="Оролцогч" value={activity.participant_count || 0} />
              <InfoItem icon={<User size={16} />} label="Зохион байгуулагч" value={activity.organizer_name} />
            </div>
          </div>
        )}
      </div>

      {/* Participations table */}
      {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Оролцогчид</h3>
          {participations.length === 0 ? (
            <p style={styles.empty}>Оролцогч байхгүй байна</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div style={styles.infoItem}>
    <div style={styles.infoLabelRow}>
      <span style={styles.infoIcon}>{icon}</span>
      <span style={styles.infoLabel}>{label}</span>
    </div>
    <span style={styles.infoValue}>{value}</span>
  </div>
);

const ParticipationRow = ({ participation, onVerify, isVerifying }) => {
  const [hours, setHours] = useState('');

  const statusMap = {
    VERIFIED: { bg: 'rgba(160,213,133,0.2)', color: '#2e7d32' },
    REJECTED: { bg: 'rgba(235,76,76,0.12)',  color: '#c62828' },
    PENDING:  { bg: 'rgba(243,198,35,0.15)', color: '#b8860b' },
  };
  const s = statusMap[participation.status] || statusMap.PENDING;

  return (
    <tr style={styles.tr}>
      <td style={styles.td}>{participation.user_name}</td>
      <td style={styles.td}>{participation.user_email}</td>
      <td style={styles.td}>
        <span style={{
          ...styles.statusBadge,
          background: s.bg,
          color: s.color,
        }}>
          {participation.status}
        </span>
      </td>
      <td style={styles.td}>{participation.hours || '—'}</td>
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
              style={{
                ...styles.verifyBtn,
                opacity: !hours || isVerifying ? 0.6 : 1,
                cursor: !hours || isVerifying ? 'not-allowed' : 'pointer',
              }}
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
  loading: { padding: '60px', textAlign: 'center', color: '#718096' },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '7px 14px',
    background: 'transparent',
    border: '1px solid #E0E0E0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#00203D',
    fontWeight: 500,
  },
  card: {
    background: '#FFFFFF',
    border: '1px solid #E0E0E0',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 2px 6px rgba(0,32,61,0.06)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: { fontSize: '20px', fontWeight: 700, color: '#00203D' },
  headerActions: { display: 'flex', alignItems: 'center', gap: '12px' },
  badge: { padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase' },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '7px 14px',
    background: '#00203D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
  },
  desc: { color: '#4A5568', lineHeight: '1.7', marginBottom: '20px', fontSize: '14px' },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    background: '#F4F6FF',
    borderRadius: '6px',
    padding: '20px',
  },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '6px' },
  infoLabelRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  infoIcon: { color: '#718096', display: 'flex' },
  infoLabel: { fontSize: '11px', color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' },
  infoValue: { fontSize: '14px', color: '#00203D', fontWeight: 500, paddingLeft: '24px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', color: '#4A5568', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: '6px', fontSize: '13px', color: '#00203D', background: '#FFFFFF', boxSizing: 'border-box', outline: 'none' },
  formActions: { display: 'flex', gap: '10px', marginTop: '4px' },
  submitBtn: { padding: '9px 20px', background: '#00203D', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 },
  cancelBtn: { padding: '9px 20px', background: '#FFFFFF', color: '#4A5568', border: '1px solid #E0E0E0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 },
  sectionTitle: { fontSize: '16px', fontWeight: 700, color: '#00203D', marginBottom: '16px' },
  empty: { color: '#718096', textAlign: 'center', padding: '30px', background: '#F4F6FF', borderRadius: '6px', fontSize: '13px' },
  tableWrapper: { border: '1px solid #E0E0E0', borderRadius: '8px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#00203D' },
  th: { padding: '11px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#C3D6EA', letterSpacing: '0.5px', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #E0E0E0' },
  td: { padding: '12px 14px', fontSize: '13px', color: '#00203D' },
  statusBadge: { display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase' },
  verifyRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  hoursInput: { width: '70px', padding: '6px 8px', border: '1px solid #E0E0E0', borderRadius: '6px', fontSize: '13px', color: '#00203D', outline: 'none' },
  verifyBtn: { padding: '6px 12px', background: '#A0D585', color: '#00203D', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600 },
};

export default ActivityDetailPage;