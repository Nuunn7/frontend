import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Plus, X, MapPin, Calendar, Users,
  ChevronRight, Save, Loader, Inbox, Search,
} from 'lucide-react';
import { activityApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import CardIllustration from '../../components/CardIllustration';

const LIMIT = 6;

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

const CustomSelect = ({ value, onChange, options }) => (
  <div style={{ position: 'relative', flexShrink: 0 }}>
    <select
      value={value}
      onChange={onChange}
      style={{
        padding: '9px 28px 9px 12px',
        border: '1px solid #E0E0E0',
        borderRadius: 6,
        fontSize: 13,
        color: '#00203D',
        background: '#fff',
        outline: 'none',
        cursor: 'pointer',
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <svg
      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2.5"
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  </div>
);

export const statusStyle = (status) => {
  switch (status) {
    case 'UPCOMING':  return { bg: 'rgba(219,234,254,0.7)', color: '#1e40af' };
    case 'ONGOING':   return { bg: 'rgba(239,246,255,0.9)', color: '#1d4ed8' };
    case 'COMPLETED': return { bg: 'rgba(220,252,231,0.7)', color: '#166534' };
    case 'CANCELLED': return { bg: 'rgba(254,226,226,0.7)', color: '#991b1b' };
    default:          return { bg: 'rgba(243,244,246,0.8)', color: '#374151' };
  }
};

export const statusLabel = {
  UPCOMING: 'Удахгүй', ONGOING: 'Явагдаж байна',
  COMPLETED: 'Дууссан', CANCELLED: 'Цуцлагдсан',
};

const ActivityCard = ({ activity, index, navigate }) => {
  const st = statusStyle(activity.status);
  return (
    <div style={styles.card} onClick={() => navigate(`/activities/${activity.id}`)}>
      <div style={styles.cardIllustration}>
        <CardIllustration index={index} />
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4,
          whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.4px',
          display: 'inline-block', position: 'absolute', top: 10, right: 10, zIndex: 1,
          background: st.bg, color: st.color,
        }}>
          {statusLabel[activity.status] || activity.status}
        </span>
      </div>
      <div style={styles.cardBody}>
        <h3 style={styles.cardTitle}>{activity.title}</h3>
        <div style={styles.cardInfo}>
          <div style={styles.infoRow}><MapPin size={13} color="#718096" /><span>{activity.location}</span></div>
          <div style={styles.infoRow}><Calendar size={13} color="#718096" /><span>{new Date(activity.date).toLocaleDateString('mn-MN')}</span></div>
          <div style={styles.infoRow}><Users size={13} color="#718096" /><span>{activity.participant_count || 0}{activity.max_participants ? ` / ${activity.max_participants}` : ''} оролцогч</span></div>
        </div>
        <div style={styles.cardFooter}>
          <button style={styles.detailBtn} onClick={(e) => { e.stopPropagation(); navigate(`/activities/${activity.id}`); }}>
            Дэлгэрэнгүй <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ActivitiesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [organizerFilter, setOrganizerFilter] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    title: '', description: '', date: '', location: '', maxParticipants: '',
  });

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter, organizerFilter]);

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
      // invalidate all queries that start with 'activities'
      queryClient.invalidateQueries({ queryKey: ['activities'], exact: false });
      setShowForm(false);
      setForm({ title: '', description: '', date: '', location: '', maxParticipants: '' });
      setPage(1);
      showToast('Үйл ажиллагаа амжилттай нэмэгдлээ!');
    },
    onError: (err) => showToast(err.response?.data?.message || 'Алдаа гарлаа', 'error'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const allActivities = (data?.data?.data || []).filter(a =>
    user?.role === 'VOLUNTEER' ? a.status !== 'CANCELLED' : true
  );

  const organizers = [...new Map(
    allActivities
      .filter(a => a.organizer_name)
      .map(a => [a.organizer_id, { id: a.organizer_id, name: a.organizer_name }])
  ).values()];

  const filtered = organizerFilter
    ? allActivities.filter(a => a.organizer_id === parseInt(organizerFilter))
    : allActivities;

  const totalPages = Math.ceil(filtered.length / LIMIT);
  const activities = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const isOrgAdmin = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

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
          <p style={styles.subtitle}>Нийт {filtered.length} үйл ажиллагаа</p>
        </div>
        {isOrgAdmin && (
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
            <button style={styles.clearBtn} onClick={() => setSearch('')}>
              <X size={13} />
            </button>
          )}
        </div>

        <CustomSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'Бүх төлөв' },
            { value: 'UPCOMING', label: 'Удахгүй' },
            { value: 'ONGOING', label: 'Явагдаж байна' },
            { value: 'COMPLETED', label: 'Дууссан' },
            { value: 'CANCELLED', label: 'Цуцлагдсан' },
          ]}
        />

        {user?.role === 'ADMIN' && organizers.length > 1 && (
          <CustomSelect
            value={organizerFilter}
            onChange={(e) => setOrganizerFilter(e.target.value)}
            options={[
              { value: '', label: 'Бүгд' },
              ...organizers.map(o => ({ value: String(o.id), label: o.name })),
            ]}
          />
        )}
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
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button style={styles.submitBtn} type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <><Loader size={14} /> Хадгалж байна...</> : <><Save size={14} /> Хадгалах</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <Inbox size={40} color="#C3D6EA" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: '#00203D', marginBottom: 4 }}>
            {search || statusFilter || organizerFilter ? 'Хайлтад тохирох үйл ажиллагаа олдсонгүй' : 'Үйл ажиллагаа байхгүй байна'}
          </p>
          <small style={{ color: '#718096' }}>
            {search || statusFilter || organizerFilter ? 'Өөр нөхцлөөр хайна уу.' : 'Шинэ үйл ажиллагаа нэмэхийн тулд дээрх товчийг дар.'}
          </small>
        </div>
      ) : (
        <>
          <div style={styles.grid}>
            {activities.map((activity, index) => (
              <ActivityCard key={activity.id} activity={activity} index={(page - 1) * LIMIT + index} navigate={navigate} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                style={{ ...styles.pageBtn, opacity: page === 1 ? 0.4 : 1 }}
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                style={{ ...styles.pageBtn, opacity: page === totalPages ? 0.4 : 1 }}
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
              >
                →
              </button>
            </div>
          )}
        </>
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
  filterBar: { display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' },
  searchWrapper: { position: 'relative', flex: 1 },
  searchIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  searchInput: { width: '100%', padding: '9px 36px 9px 32px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13, color: '#00203D', boxSizing: 'border-box', outline: 'none', background: '#fff' },
  clearBtn: { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#718096', display: 'flex', alignItems: 'center', padding: 2 },
  loading: { display: 'flex', alignItems: 'center', gap: 10, padding: 32, color: '#718096', fontSize: 14 },
  empty: { textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8 },
  formCard: { background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: 24, marginBottom: 24, borderTop: '3px solid #00203D' },
  formTitle: { fontSize: 15, fontWeight: 700, color: '#00203D', marginBottom: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { marginBottom: 16 },
  label: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, color: '#4A5568', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13, color: '#00203D', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  submitBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#00203D', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  card: { background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, cursor: 'pointer', transition: 'box-shadow 0.15s ease', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  cardIllustration: { position: 'relative', overflow: 'hidden', flexShrink: 0 },
  cardBody: { padding: 20, display: 'flex', flexDirection: 'column', flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#00203D', marginBottom: 12, minHeight: 40 },
  cardInfo: { display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 12, borderTop: '1px solid #E0E0E0', marginBottom: 12 },
  infoRow: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#718096' },
  cardFooter: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 'auto' },
  detailBtn: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: '#F4F6FF', color: '#00203D', border: '1px solid #E0E0E0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 },
  pageBtn: { padding: '6px 12px', border: '1px solid #E0E0E0', borderRadius: 6, background: '#fff', color: '#00203D', cursor: 'pointer', fontSize: 13, fontWeight: 500, minWidth: 36, textAlign: 'center' },
  pageBtnActive: { background: '#00203D', color: '#fff', borderColor: '#00203D' },
};

export default ActivitiesPage;