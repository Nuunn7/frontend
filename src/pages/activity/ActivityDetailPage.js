import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Calendar, Users, User, ArrowLeft, Edit2, Loader, UserPlus } from 'lucide-react';
import { activityApi, participationApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const Toast = ({ message, type, onClose }) => (
  <div style={{
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    padding: '12px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    background: type === 'error' ? '#c62828' : '#2e7d32',
    color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    display: 'flex', alignItems: 'center', gap: 10,
    animation: 'slideIn 0.2s ease',
  }}>
    <span>{message}</span>
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
  </div>
);

const ActivityDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [hours, setHours] = useState('4');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => activityApi.getById(id),
  });

  const activity = data?.data?.data;

  useEffect(() => {
    if (activity) {
      setForm({
        title: activity.title,
        description: activity.description,
        date: activity.date?.slice(0, 16),
        location: activity.location,
        maxParticipants: activity.max_participants || '',
      });
    }
  }, [activity]);

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
      showToast('Үйл ажиллагаа амжилттай шинэчлэгдлээ!');
    },
    onError: (err) => showToast(err.response?.data?.message || 'Алдаа гарлаа', 'error'),
  });

  const joinMutation = useMutation({
    mutationFn: () => activityApi.join(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['activity', id]);
      queryClient.invalidateQueries(['activities']);
      setShowJoinModal(false);
      showToast('Амжилттай бүртгүүллээ!');
    },
    onError: (err) => {
      setShowJoinModal(false);
      showToast(err.response?.data?.message || 'Бүртгэлд алдаа гарлаа', 'error');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: ({ userId, hours }) => activityApi.verifyParticipation(id, userId, { hours }),
    onSuccess: () => {
      queryClient.invalidateQueries(['participations', id]);
      showToast('Оролцоо амжилттай баталгаажлаа!');
    },
    onError: (err) => showToast(err.response?.data?.message || 'Алдаа гарлаа', 'error'),
  });

  const rejectMutation = useMutation({
    mutationFn: (participationId) => participationApi.reject(participationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['participations', id]);
      showToast('Оролцоо татгалзагдлаа.');
    },
    onError: (err) => showToast(err.response?.data?.message || 'Алдаа гарлаа', 'error'),
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  if (isLoading) return (
    <div style={styles.loading}>
      <Loader size={18} color="#718096" />
      <span>Ачааллаж байна...</span>
    </div>
  );

  if (!activity) return <div style={styles.loading}>Олдсонгүй</div>;

  const participations = participationsData?.data?.data || [];

  const statusColors = {
    UPCOMING:  { bg: '#C3D6EA',              color: '#00203D' },
    ONGOING:   { bg: 'rgba(243,198,35,0.15)', color: '#b8860b' },
    COMPLETED: { bg: 'rgba(160,213,133,0.2)', color: '#2e7d32' },
    CANCELLED: { bg: 'rgba(235,76,76,0.12)',  color: '#c62828' },
  };

  const statusLabel = {
    UPCOMING: 'Удахгүй', ONGOING: 'Явагдаж байна',
    COMPLETED: 'Дууссан', CANCELLED: 'Цуцлагдсан',
  };

  const sc = statusColors[activity.status] || statusColors.UPCOMING;
  const canJoin = user?.role === 'VOLUNTEER' && activity.status === 'UPCOMING';

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <button style={styles.backBtn} onClick={() => navigate('/activities')}>
        <ArrowLeft size={14} /> Буцах
      </button>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.title}>
            {editMode ? 'Үйл ажиллагаа засварлах' : activity.title}
          </h2>
          <div style={styles.headerActions}>
            <span style={{ ...styles.badge, background: sc.bg, color: sc.color }}>
              {statusLabel[activity.status] || activity.status}
            </span>
            {canJoin && !editMode && (
              <button style={styles.joinBtn} onClick={() => setShowJoinModal(true)}>
                <UserPlus size={14} /> Бүртгүүлэх
              </button>
            )}
            {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && !editMode && (
              <button style={styles.editBtn} onClick={() => setEditMode(true)}>
                <Edit2 size={14} /> Засварлах
              </button>
            )}
          </div>
        </div>

        {editMode && form ? (
          <form onSubmit={handleUpdate}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Нэр</label>
                <input style={styles.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Байршил</label>
                <input style={styles.input} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Огноо</label>
                <input style={styles.input} type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Хамгийн их оролцогч</label>
                <input style={styles.input} type="number" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Тайлбар</label>
              <textarea style={{ ...styles.input, height: 80, resize: 'vertical' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div style={styles.formActions}>
              <button style={styles.submitBtn} type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
              <button style={styles.cancelBtn} type="button" onClick={() => setEditMode(false)}>Болих</button>
            </div>
          </form>
        ) : (
          <div>
            <p style={styles.desc}>{activity.description}</p>
            <div style={styles.infoGrid}>
              <InfoItem icon={<MapPin size={16} />}   label="Байршил"           value={activity.location} />
              <InfoItem icon={<Calendar size={16} />} label="Огноо"             value={new Date(activity.date).toLocaleString('mn-MN')} />
              <InfoItem icon={<Users size={16} />}    label="Оролцогч"          value={`${activity.participant_count || 0}${activity.max_participants ? ` / ${activity.max_participants}` : ''}`} />
              <InfoItem icon={<User size={16} />}     label="Зохион байгуулагч" value={activity.organizer_name} />
            </div>
          </div>
        )}
      </div>

      {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Оролцогчид</h3>
            <span style={styles.countBadge}>{participations.length}</span>
          </div>
          {participations.length === 0 ? (
            <p style={styles.empty}>Оролцогч байхгүй байна</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={{ ...styles.th, width: '15%' }}>Нэр</th>
                    <th style={{ ...styles.th, width: '20%' }}>И-мэйл</th>
                    <th style={{ ...styles.th, width: '15%' }}>Статус</th>
                    <th style={{ ...styles.th, width: '50%', textAlign: 'right' }}>Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {participations.map((p) => (
                    <ParticipationRow
                      key={p.id}
                      participation={p}
                      onVerify={(hours) => verifyMutation.mutate({ userId: p.user_id, hours })}
                      onReject={() => rejectMutation.mutate(p.id)}
                      isVerifying={verifyMutation.isPending}
                      isRejecting={rejectMutation.isPending}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p style={{ fontSize: 14, color: '#4A5568', margin: '16px 0' }}>
              Та энэ үйл ажиллагаанд бүртгүүлэхдээ итгэлтэй байна уу?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                style={{ padding: '9px 24px', background: 'rgba(235,76,76,0.12)', color: '#c62828', border: '1px solid rgba(235,76,76,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                onClick={() => setShowJoinModal(false)}
              >
                Үгүй
              </button>
              <button
                style={{ padding: '9px 24px', background: 'rgba(160,213,133,0.25)', color: '#2e7d32', border: '1px solid rgba(160,213,133,0.4)', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500, opacity: joinMutation.isPending ? 0.7 : 1 }}
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
              >
                {joinMutation.isPending ? 'Бүртгэж байна...' : 'Тийм'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
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

const ParticipationRow = ({ participation, onVerify, onReject, isVerifying, isRejecting }) => {
  const [hours, setHours] = useState('');
  const statusMap = {
    APPROVED: { bg: 'rgba(160,213,133,0.2)', color: '#2e7d32', label: 'Баталгаажсан' },
    REJECTED: { bg: 'rgba(235,76,76,0.12)',  color: '#c62828', label: 'Татгалзсан'   },
    PENDING:  { bg: 'rgba(243,198,35,0.15)', color: '#b8860b', label: 'Хүлээгдэж байна' },
  };
  const s = statusMap[participation.status] || statusMap.PENDING;

  return (
    <tr style={styles.tr}>
      <td style={styles.td}>{participation.user_name}</td>
      <td style={styles.td}>{participation.user_email}</td>
      <td style={styles.td}>
        <span style={{ ...styles.statusBadge, background: s.bg, color: s.color }}>{s.label}</span>
      </td>
      <td style={{ ...styles.td, textAlign: 'right' }}>
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
              style={{ ...styles.verifyBtn, opacity: !hours || isVerifying ? 0.6 : 1, cursor: !hours || isVerifying ? 'not-allowed' : 'pointer' }}
              onClick={() => onVerify(hours)}
              disabled={!hours || isVerifying}
            >
              Баталгаажуулах
            </button>
            <button
              style={{ ...styles.rejectBtn, opacity: isRejecting ? 0.6 : 1, cursor: isRejecting ? 'not-allowed' : 'pointer' }}
              onClick={onReject}
              disabled={isRejecting}
            >
              Татгалзах
            </button>
          </div>
        )}
        {participation.status === 'APPROVED' && (
          <span style={{ fontSize: 12, color: '#2e7d32', fontWeight: 600 }}>{participation.hours} цаг ✓</span>
        )}
      </td>
    </tr>
  );
};

const styles = {
  loading: { display: 'flex', alignItems: 'center', gap: 10, padding: 60, color: '#718096', fontSize: 14 },
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, padding: '7px 14px', background: 'transparent', border: '1px solid #E0E0E0', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#00203D', fontWeight: 500 },
  card: { background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: 8, padding: 24, marginBottom: 20, boxShadow: '0 2px 6px rgba(0,32,61,0.06)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  title: { fontSize: 20, fontWeight: 700, color: '#00203D' },
  headerActions: { display: 'flex', alignItems: 'center', gap: 10 },
  badge: { padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase' },
  joinBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#A0D585', color: '#1a3a0a', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  editBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#00203D', color: '#FFFFFF', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  desc: { color: '#4A5568', lineHeight: 1.7, marginBottom: 20, fontSize: 14 },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, background: '#F4F6FF', borderRadius: 6, padding: 20 },
  infoItem: { display: 'flex', flexDirection: 'column', gap: 6 },
  infoLabelRow: { display: 'flex', alignItems: 'center', gap: 8 },
  infoIcon: { color: '#718096', display: 'flex' },
  infoLabel: { fontSize: 11, color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' },
  infoValue: { fontSize: 14, color: '#00203D', fontWeight: 500, paddingLeft: 24 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { marginBottom: 16 },
  label: { display: 'block', marginBottom: 6, color: '#4A5568', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13, color: '#00203D', background: '#FFFFFF', boxSizing: 'border-box', outline: 'none' },
  formActions: { display: 'flex', gap: 10, marginTop: 4 },
  submitBtn: { padding: '9px 20px', background: '#00203D', color: '#FFFFFF', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  cancelBtn: { padding: '9px 20px', background: '#FFFFFF', color: '#4A5568', border: '1px solid #E0E0E0', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#00203D' },
  countBadge: { fontSize: 11, fontWeight: 700, background: '#C3D6EA', color: '#00203D', padding: '2px 8px', borderRadius: 10 },
  empty: { color: '#718096', textAlign: 'center', padding: 30, background: '#F4F6FF', borderRadius: 6, fontSize: 13 },
  tableWrapper: { border: '1px solid #E0E0E0', borderRadius: 8, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
  thead: { background: '#00203D' },
  th: { padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#C3D6EA', letterSpacing: '0.5px', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #E0E0E0' },
  td: { padding: '12px 14px', fontSize: 13, color: '#00203D' },
  statusBadge: { display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, letterSpacing: '0.4px' },
  verifyRow: { display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' },
  hoursInput: { width: 80, padding: '6px 8px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13, color: '#00203D', outline: 'none' },
  verifyBtn: { padding: '6px 10px', background: '#A0D585', color: '#1a3a0a', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600 },
  rejectBtn: { padding: '6px 10px', background: 'rgba(235,76,76,0.12)', color: '#c62828', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600 },
};

export default ActivityDetailPage;