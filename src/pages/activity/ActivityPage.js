import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Plus, X, MapPin, Calendar, Users, ChevronRight,
  UserPlus, Save, Loader, Inbox,
} from 'lucide-react';
import { activityApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const ActivitiesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', date: '', location: '', maxParticipants: ''
  });

  const { data, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activityApi.getAll({ limit: 20 }),
  });

  const createMutation = useMutation({
    mutationFn: activityApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      setShowForm(false);
      setForm({ title: '', description: '', date: '', location: '', maxParticipants: '' });
    },
    onError: (err) => alert(err.response?.data?.message || 'Алдаа гарлаа'),
  });

  const joinMutation = useMutation({
    mutationFn: activityApi.join,
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      alert('Амжилттай бүртгүүллээ!');
    },
    onError: (err) => alert(err.response?.data?.message || 'Алдаа гарлаа'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const activities = data?.data?.data || [];

  const statusStyle = (status) => {
    switch (status) {
      case 'UPCOMING':  return { bg: 'rgba(195,214,234,0.3)', color: '#00203D' };
      case 'ONGOING':   return { bg: 'rgba(243,198,35,0.15)', color: '#b8860b' };
      case 'COMPLETED': return { bg: 'rgba(160,213,133,0.2)', color: '#2e7d32' };
      case 'CANCELLED': return { bg: 'rgba(235,76,76,0.12)',  color: '#c62828' };
      default:          return { bg: '#f0f0f0', color: '#555' };
    }
  };

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
      {/* Header */}
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

      {/* Create form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Шинэ үйл ажиллагаа</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Нэр</label>
                <input
                  style={styles.input}
                  placeholder="Үйл ажиллагааны нэр"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}><MapPin size={12} /> Байршил</label>
                <input
                  style={styles.input}
                  placeholder="Хаана явагдах вэ?"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}><Calendar size={12} /> Огноо</label>
                <input
                  style={styles.input}
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}><Users size={12} /> Хамгийн их оролцогч</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="0 = хязгааргүй"
                  value={form.maxParticipants}
                  onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Тайлбар</label>
              <textarea
                style={{ ...styles.input, height: 80, resize: 'vertical' }}
                placeholder="Үйл ажиллагааны дэлгэрэнгүй тайлбар..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <button style={styles.submitBtn} type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending
                ? <><Loader size={14} /> Хадгалж байна...</>
                : <><Save size={14} /> Хадгалах</>
              }
            </button>
          </form>
        </div>
      )}

      {/* Empty state */}
      {activities.length === 0 ? (
        <div style={styles.empty}>
          <Inbox size={40} color="#C3D6EA" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: '#00203D', marginBottom: 4 }}>
            Үйл ажиллагаа байхгүй байна
          </p>
          <small style={{ color: '#718096' }}>
            Шинэ үйл ажиллагаа нэмэхийн тулд дээрх товчийг дар.
          </small>
        </div>
      ) : (
        <div style={styles.grid}>
          {activities.map((activity) => {
            const st = statusStyle(activity.status);
            return (
              <div
                key={activity.id}
                style={styles.card}
                onClick={() => navigate(`/activities/${activity.id}`)}
              >
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{activity.title}</h3>
                  <span style={{ ...styles.badge, background: st.bg, color: st.color }}>
                    {activity.status}
                  </span>
                </div>

                <p style={styles.cardDesc}>{activity.description}</p>

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
                    <span>{activity.participant_count || 0} оролцогч</span>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  {user?.role === 'VOLUNTEER' && activity.status === 'UPCOMING' && (
                    <button
                      style={styles.joinBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        joinMutation.mutate(activity.id);
                      }}
                      disabled={joinMutation.isPending}
                    >
                      <UserPlus size={13} />
                      Бүртгүүлэх
                    </button>
                  )}
                  <button
                    style={styles.detailBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/activities/${activity.id}`);
                    }}
                  >
                    Дэлгэрэнгүй <ChevronRight size={13} />
                  </button>
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
  btnAdd: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', background: '#00203D', color: '#fff',
    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500,
  },
  btnCancel: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', background: '#fff', color: '#00203D',
    border: '1px solid #E0E0E0', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500,
  },
  loading: { display: 'flex', alignItems: 'center', gap: 10, padding: 32, color: '#718096', fontSize: 14 },
  empty: {
    textAlign: 'center', padding: '60px 20px',
    background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8,
  },
  formCard: {
    background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8,
    padding: 24, marginBottom: 24, borderTop: '3px solid #00203D',
  },
  formTitle: { fontSize: 15, fontWeight: 700, color: '#00203D', marginBottom: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { marginBottom: 16 },
  label: {
    display: 'flex', alignItems: 'center', gap: 4,
    marginBottom: 6, color: '#4A5568', fontSize: 12,
    fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px',
  },
  input: {
    width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0',
    borderRadius: 6, fontSize: 13, color: '#00203D', boxSizing: 'border-box', outline: 'none',
  },
  submitBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 20px', background: '#00203D', color: '#fff',
    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  card: {
    background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8,
    padding: 20, cursor: 'pointer', transition: 'box-shadow 0.15s ease',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#00203D', flex: 1, marginRight: 8 },
  badge: {
    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
    whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.4px',
  },
  cardDesc: {
    fontSize: 13, color: '#718096', marginBottom: 12, lineHeight: 1.5,
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  cardInfo: {
    display: 'flex', flexDirection: 'column', gap: 6,
    paddingTop: 12, borderTop: '1px solid #E0E0E0', marginBottom: 12,
  },
  infoRow: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#718096' },
  cardFooter: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  joinBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '6px 12px', background: '#A0D585', color: '#1a3a0a',
    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500,
  },
  detailBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '6px 12px', background: '#F4F6FF', color: '#00203D',
    border: '1px solid #E0E0E0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500,
  },
};

export default ActivitiesPage;