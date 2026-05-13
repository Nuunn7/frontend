import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Plus, X, MapPin, Calendar, Users,
  ChevronRight, Save, Loader, Inbox, Search,
} from 'lucide-react';
import { activityApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const PALETTES = [
  { from: '#1a6b3c', to: '#2ecc71', accent: '#a8edca', sky: '#0d4f2c' },
  { from: '#1a3a6b', to: '#3b82f6', accent: '#a8c8ed', sky: '#0d2550' },
  { from: '#6b1a3a', to: '#e05c8a', accent: '#edaac8', sky: '#500d2c' },
  { from: '#6b4a1a', to: '#f59e0b', accent: '#fde68a', sky: '#4a2e08' },
  { from: '#2d1a6b', to: '#8b5cf6', accent: '#c4b5fd', sky: '#1a0d50' },
];

const CardIllustration = ({ index = 0 }) => {
  const p = PALETTES[index % PALETTES.length];
  const id = `grad-${index}`;
  return (
    <svg width="100%" height="110" viewBox="0 0 320 110"
      xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={p.sky} />
          <stop offset="60%"  stopColor={p.from} />
          <stop offset="100%" stopColor={p.to} />
        </linearGradient>
      </defs>
      <rect width="320" height="110" fill={`url(#${id})`} />
      <ellipse cx="160" cy="130" rx="200" ry="60" fill="rgba(0,0,0,0.15)" />
      <circle cx="270" cy="20" r="40" fill={p.to}     opacity="0.15" />
      <circle cx="290" cy="5"  r="25" fill={p.accent} opacity="0.1"  />
      <circle cx="40"  cy="90" r="35" fill={p.from}   opacity="0.2"  />
      <ellipse cx="160" cy="112" rx="320" ry="18" fill="rgba(0,0,0,0.25)" />
      <g fill={p.accent} opacity="0.9">
        <circle cx="60" cy="72" r="6" />
        <rect x="55" y="78" width="10" height="18" rx="3" />
        <rect x="48" y="82" width="8"  height="3"  rx="1" />
        <rect x="62" y="82" width="8"  height="3"  rx="1" />
        <rect x="56" y="96" width="4"  height="10" rx="1" />
        <rect x="60" y="96" width="4"  height="10" rx="1" />
      </g>
      <g fill={p.accent} opacity="0.75">
        <circle cx="100" cy="75" r="5.5" />
        <rect x="95.5" y="80" width="9"   height="16" rx="3" />
        <rect x="89"   y="84" width="7"   height="3"  rx="1" />
        <rect x="103"  y="84" width="7"   height="3"  rx="1" />
        <rect x="96"   y="96" width="3.5" height="9"  rx="1" />
        <rect x="100"  y="96" width="3.5" height="9"  rx="1" />
      </g>
      <g fill={p.accent} opacity="0.85">
        <circle cx="140" cy="70" r="7" />
        <rect x="134" y="77" width="12" height="20" rx="3" />
        <rect x="126" y="81" width="9"  height="3"  rx="1" />
        <rect x="145" y="81" width="9"  height="3"  rx="1" />
        <rect x="135" y="97" width="4"  height="11" rx="1" />
        <rect x="139" y="97" width="4"  height="11" rx="1" />
      </g>
      <g fill={p.accent} opacity="0.7">
        <circle cx="175" cy="76" r="5" />
        <rect x="170" y="81" width="9" height="15" rx="3" />
        <rect x="164" y="85" width="7" height="3"  rx="1" />
        <rect x="178" y="85" width="7" height="3"  rx="1" />
        <rect x="171" y="96" width="3" height="9"  rx="1" />
        <rect x="175" y="96" width="3" height="9"  rx="1" />
      </g>
      <g fill={p.accent} opacity="0.8">
        <circle cx="210" cy="73" r="6" />
        <rect x="204" y="79" width="11" height="18" rx="3" />
        <rect x="197" y="83" width="8"  height="3"  rx="1" />
        <rect x="213" y="83" width="8"  height="3"  rx="1" />
        <rect x="205" y="97" width="4"  height="10" rx="1" />
        <rect x="209" y="97" width="4"  height="10" rx="1" />
      </g>
      <g fill={p.accent} opacity="0.65">
        <circle cx="245" cy="77" r="5" />
        <rect x="240" y="82" width="9" height="15" rx="3" />
        <rect x="234" y="86" width="7" height="3"  rx="1" />
        <rect x="248" y="86" width="7" height="3"  rx="1" />
        <rect x="241" y="97" width="3" height="9"  rx="1" />
        <rect x="245" y="97" width="3" height="9"  rx="1" />
      </g>
      <line x1="66"  y1="80" x2="100" y2="82" stroke={p.accent} strokeWidth="1.5" opacity="0.4" strokeDasharray="3 2" />
      <line x1="106" y1="80" x2="135" y2="78" stroke={p.accent} strokeWidth="1.5" opacity="0.4" strokeDasharray="3 2" />
      <line x1="147" y1="79" x2="171" y2="82" stroke={p.accent} strokeWidth="1.5" opacity="0.4" strokeDasharray="3 2" />
      <line x1="180" y1="81" x2="205" y2="80" stroke={p.accent} strokeWidth="1.5" opacity="0.4" strokeDasharray="3 2" />
      <line x1="216" y1="80" x2="241" y2="83" stroke={p.accent} strokeWidth="1.5" opacity="0.4" strokeDasharray="3 2" />
      <circle cx="10" cy="18" r="1.5" fill={p.accent} opacity="0.5" />
      <circle cx="30" cy="10" r="1.5" fill={p.accent} opacity="0.5" />
      <circle cx="50" cy="22" r="1.5" fill={p.accent} opacity="0.5" />
      <circle cx="70" cy="12" r="1.5" fill={p.accent} opacity="0.4" />
      <circle cx="90" cy="20" r="1.5" fill={p.accent} opacity="0.4" />
      <line x1="10" y1="18" x2="30" y2="10" stroke={p.accent} strokeWidth="0.6" opacity="0.25" />
      <line x1="30" y1="10" x2="50" y2="22" stroke={p.accent} strokeWidth="0.6" opacity="0.25" />
      <line x1="50" y1="22" x2="70" y2="12" stroke={p.accent} strokeWidth="0.6" opacity="0.25" />
      <line x1="70" y1="12" x2="90" y2="20" stroke={p.accent} strokeWidth="0.6" opacity="0.25" />
      <text x="10" y="38" fill={p.accent} fontSize="7" fontFamily="monospace" opacity="0.55">Сайн дурын үйл ажиллагаа</text>
      <text x="10" y="48" fill={p.accent} fontSize="6" fontFamily="monospace" opacity="0.35">Блокчейнээр баталгаажуулсан</text>
    </svg>
  );
};

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

const statusStyle = (status) => {
  switch (status) {
    case 'UPCOMING':  return { bg: 'rgba(195,214,234,0.9)', color: '#00203D' };
    case 'ONGOING':   return { bg: 'rgba(243,198,35,0.9)',  color: '#4a3000' };
    case 'COMPLETED': return { bg: 'rgba(160,213,133,0.9)', color: '#1a3a0a' };
    case 'CANCELLED': return { bg: 'rgba(235,76,76,0.9)',   color: '#fff'    };
    default:          return { bg: 'rgba(240,240,240,0.9)', color: '#555'    };
  }
};

const statusLabel = {
  UPCOMING: 'Удахгүй', ONGOING: 'Явагдаж байна',
  COMPLETED: 'Дууссан', CANCELLED: 'Цуцлагдсан',
};

const ActivitiesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', date: '', location: '', maxParticipants: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['activities', search, statusFilter],
  queryFn: () => activityApi.getAll({
    limit: 50,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
  }),  
  });

  const createMutation = useMutation({
    mutationFn: activityApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      setShowForm(false);
      setForm({ title: '', description: '', date: '', location: '', maxParticipants: '' });
      showToast('Үйл ажиллагаа амжилттай нэмэгдлээ!');
    },
    onError: (err) => showToast(err.response?.data?.message || 'Алдаа гарлаа', 'error'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const activities = data?.data?.data || [];

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <Loader size={18} color="#718096" />
        <span>Ачааллаж байна...</span>
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Үйл ажиллагаа</h1>
          <p style={styles.subtitle}>Нийт {activities.length} үйл ажиллагаа</p>
        </div>
        {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
          <button
            style={showForm ? styles.btnCancel : styles.btnAdd}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <><X size={14} /> Болих</> : <><Plus size={14} /> Нэмэх</>}
          </button>
        )}
      </div>

      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <Search size={14} color="#718096" style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            placeholder="Үйл ажиллагаа хайх..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              style={styles.clearBtn}
              onClick={() => setSearch('')}
            >
              <X size={13} />
            </button>
          )}
        </div>
        <select
          style={styles.select}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Бүх төлөв</option>
          <option value="UPCOMING">Удахгүй</option>
          <option value="ONGOING">Явагдаж байна</option>
          <option value="COMPLETED">Дууссан</option>
          <option value="CANCELLED">Цуцлагдсан</option>
        </select>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Шинэ үйл ажиллагаа</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}><MapPin size={12} /> Нэр</label>
                <input style={styles.input} placeholder="Үйл ажиллагааны нэр" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}><MapPin size={12} /> Байршил</label>
                <input style={styles.input} placeholder="Хаана явагдах вэ?" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}><Calendar size={12} /> Огноо</label>
                <input style={styles.input} type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}><Users size={12} /> Хамгийн их оролцогч</label>
                <input style={styles.input} type="number" placeholder="0 = хязгааргүй" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Тайлбар</label>
              <textarea style={{ ...styles.input, height: 80, resize: 'vertical' }} placeholder="Үйл ажиллагааны дэлгэрэнгүй тайлбар..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <button style={styles.submitBtn} type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? <><Loader size={14} /> Хадгалж байна...</> : <><Save size={14} /> Хадгалах</>}
            </button>
          </form>
        </div>
      )}

      {activities.length === 0 ? (
        <div style={styles.empty}>
          <Inbox size={40} color="#C3D6EA" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: '#00203D', marginBottom: 4 }}>
            {search || statusFilter ? 'Хайлтад тохирох үйл ажиллагаа олдсонгүй' : 'Үйл ажиллагаа байхгүй байна'}
          </p>
          <small style={{ color: '#718096' }}>
            {search || statusFilter ? 'Өөр түлхүүр үгээр хайна уу.' : 'Шинэ үйл ажиллагаа нэмэхийн тулд дээрх товчийг дар.'}
          </small>
        </div>
      ) : (
        <div style={styles.grid}>
          {activities.map((activity, index) => {
            const st = statusStyle(activity.status);
            return (
              <div key={activity.id} style={styles.card} onClick={() => navigate(`/activities/${activity.id}`)}>
                <div style={styles.cardIllustration}>
                  <CardIllustration index={index} />
                  <span style={{ ...styles.badge, background: st.bg, color: st.color, position: 'absolute', top: 10, right: 10 }}>
                    {statusLabel[activity.status] || activity.status}
                  </span>
                </div>
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{activity.title}</h3>
                  <div style={styles.cardInfo}>
                    <div style={styles.infoRow}>
                      <MapPin size={13} color="#718096" />
                      <span>{activity.location}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <Calendar size={13} color="#718096" />
                      <span>{new Date(activity.date).toLocaleDateString('mn-MN')}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <Users size={13} color="#718096" />
                      <span>{activity.participant_count || 0}{activity.max_participants ? ` / ${activity.max_participants}` : ''} оролцогч</span>
                    </div>
                  </div>
                  <div style={styles.cardFooter}>
                    <button
                      style={styles.detailBtn}
                      onClick={(e) => { e.stopPropagation(); navigate(`/activities/${activity.id}`); }}
                    >
                      Дэлгэрэнгүй <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 700, color: '#00203D', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#718096' },
  btnAdd: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#00203D', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  btnCancel: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#fff', color: '#00203D', border: '1px solid #E0E0E0', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  filterBar: { display: 'flex', gap: 12, marginBottom: 20 },
  searchWrapper: { position: 'relative', flex: 1 },
  searchIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  searchInput: { width: '100%', padding: '9px 36px 9px 32px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13, color: '#00203D', boxSizing: 'border-box', outline: 'none', background: '#fff' },
  clearBtn: { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#718096', display: 'flex', alignItems: 'center', padding: 2 },
  select: { padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13, color: '#00203D', background: '#fff', outline: 'none', cursor: 'pointer' },
  loading: { display: 'flex', alignItems: 'center', gap: 10, padding: 32, color: '#718096', fontSize: 14 },
  empty: { textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8 },
  formCard: { background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: 24, marginBottom: 24, borderTop: '3px solid #00203D' },
  formTitle: { fontSize: 15, fontWeight: 700, color: '#00203D', marginBottom: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { marginBottom: 16 },
  label: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, color: '#4A5568', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13, color: '#00203D', boxSizing: 'border-box', outline: 'none' },
  submitBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#00203D', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  card: { background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, cursor: 'pointer', transition: 'box-shadow 0.15s ease', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  cardIllustration: { position: 'relative' },
  cardBody: { padding: 20, display: 'flex', flexDirection: 'column', flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#00203D', marginBottom: 12, minHeight: 40 },
  badge: { fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.4px' },
  cardInfo: { display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 12, borderTop: '1px solid #E0E0E0', marginBottom: 12 },
  infoRow: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#718096' },
  cardFooter: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 'auto' },
  detailBtn: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: '#F4F6FF', color: '#00203D', border: '1px solid #E0E0E0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 },
};

export default ActivitiesPage;