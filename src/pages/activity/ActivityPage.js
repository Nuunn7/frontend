import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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

  if (isLoading) return <div style={styles.loading}>Ачааллаж байна...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Үйл ажиллагаа</h1>
        {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Болих' : '+ Нэмэх'}
          </button>
        )}
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Шинэ үйл ажиллагаа</h3>
          <form onSubmit={handleSubmit}>
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
            <button
              style={styles.submitBtn}
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Хадгалж байна...' : 'Хадгалах'}
            </button>
          </form>
        </div>
      )}

      {activities.length === 0 ? (
        <div style={styles.empty}>Үйл ажиллагаа байхгүй байна</div>
      ) : (
        <div style={styles.grid}>
          {activities.map((activity) => (
            <div
              key={activity.id}
              style={{ ...styles.card, cursor: 'pointer' }}
              onClick={() => navigate(`/activities/${activity.id}`)}
            >
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{activity.title}</h3>
                <span style={{
                  ...styles.badge,
                  backgroundColor: activity.status === 'UPCOMING' ? '#e8f5e9' : '#fff3e0',
                  color: activity.status === 'UPCOMING' ? '#4CAF50' : '#FF9800',
                }}>
                  {activity.status}
                </span>
              </div>
              <p style={styles.cardDesc}>{activity.description}</p>
              <div style={styles.cardInfo}>
                <span>📍 {activity.location}</span>
                <span>📅 {new Date(activity.date).toLocaleDateString('mn-MN')}</span>
                <span>👥 {activity.participant_count || 0} оролцогч</span>
              </div>
              {user?.role === 'VOLUNTEER' && activity.status === 'UPCOMING' && (
                <button
                  style={styles.joinBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    joinMutation.mutate(activity.id);
                  }}
                  disabled={joinMutation.isPending}
                >
                  Бүртгүүлэх
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '32px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { color: '#333' },
  addBtn: { padding: '10px 20px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  loading: { padding: '32px', textAlign: 'center', color: '#666' },
  empty: { textAlign: 'center', color: '#999', padding: '40px' },
  formCard: { backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '24px' },
  formTitle: { marginBottom: '16px', color: '#333' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', color: '#555', fontSize: '14px' },
  input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
  submitBtn: { padding: '10px 24px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  cardTitle: { color: '#333', fontSize: '16px', flex: 1 },
  badge: { padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', marginLeft: '8px' },
  cardDesc: { color: '#666', fontSize: '14px', marginBottom: '12px', lineHeight: '1.5' },
  cardInfo: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#888', marginBottom: '12px' },
  joinBtn: { width: '100%', padding: '8px', backgroundColor: '#2196F3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
};

export default ActivitiesPage;