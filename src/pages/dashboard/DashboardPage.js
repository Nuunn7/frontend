import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { activityApi, userApi } from '../../api';
import { Activity, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const STATUS_COLORS = {
  UPCOMING:  { hex: '#185FA5', label: 'Удахгүй'       },
  ONGOING:   { hex: '#BA7517', label: 'Явагдаж байна' },
  COMPLETED: { hex: '#0C447C', label: 'Дууссан'        },
  CANCELLED: { hex: '#A32D2D', label: 'Цуцлагдсан'    },
};

const loadChartJs = () => new Promise((resolve) => {
  if (window.Chart) return resolve(window.Chart);
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
  script.onload = () => resolve(window.Chart);
  document.head.appendChild(script);
});

const StatCard = ({ label, value, sub, icon, color }) => (
  <div style={styles.statCard}>
    <div style={{ ...styles.statIcon, background: color + '18', color }}>
      {icon}
    </div>
    <div style={styles.statInfo}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
      {sub && <div style={styles.statSub}>{sub}</div>}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    UPCOMING:  { label: 'Удахгүй',       bg: 'rgba(219,234,254,0.7)', color: '#1e40af' },
    ONGOING:   { label: 'Явагдаж байна', bg: 'rgba(254,243,199,0.7)', color: '#92400e' },
    COMPLETED: { label: 'Дууссан',        bg: 'rgba(220,252,231,0.7)', color: '#166534' },
    CANCELLED: { label: 'Цуцлагдсан',    bg: 'rgba(254,226,226,0.7)', color: '#991b1b' },
  };
  const s = map[status] || map.UPCOMING;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
};

const DonutChart = ({ data, total }) => {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    loadChartJs().then((Chart) => {
      if (chartRef.current) chartRef.current.destroy();
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      chartRef.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.map(d => d.label),
          datasets: [{
            data: data.map(d => d.value),
            backgroundColor: data.map(d => d.color),
            borderWidth: 0,
            hoverOffset: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '78%',
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}` } },
          },
        },
      });
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data]);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180 }}>
      <canvas ref={canvasRef} role="img" aria-label="Donut chart of activity statuses" />
      <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#00203D', lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>нийт</div>
      </div>
    </div>
  );
};

const BarChart = ({ data }) => {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    loadChartJs().then((Chart) => {
      if (chartRef.current) chartRef.current.destroy();
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const isDark   = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const tickColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
      const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.name),
          datasets: [{
            data: data.map(d => d.value),
            backgroundColor: data.map((_, i) => `rgba(24,95,165,${(1 - i * 0.12).toFixed(2)})`),
            borderRadius: 4,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} оролцогч` } },
          },
          scales: {
            x: {
              ticks: { color: tickColor, font: { size: 11 }, maxRotation: 0, autoSkip: false },
              grid: { display: false },
              border: { display: false },
            },
            y: {
              ticks: { color: tickColor, font: { size: 11 }, stepSize: 5 },
              grid: { color: gridColor },
              border: { display: false },
              beginAtZero: true,
            },
          },
        },
      });
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 200 }}>
      <canvas ref={canvasRef} role="img" aria-label="Bar chart of participant counts per activity" />
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: activitiesData, isLoading: loadingAct } = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: () => activityApi.getAll({ limit: 50 }),
  });

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['dashboard-users'],
    queryFn: () => userApi.getAll(),
    enabled: user?.role === 'ADMIN',
  });

  const activities = activitiesData?.data?.data || [];
  const users      = usersData?.data?.data || [];

  const totalActivities   = activities.length;
  const upcomingCount     = activities.filter(a => a.status === 'UPCOMING').length;
  const ongoingCount      = activities.filter(a => a.status === 'ONGOING').length;
  const completedCount    = activities.filter(a => a.status === 'COMPLETED').length;
  const cancelledCount    = activities.filter(a => a.status === 'CANCELLED').length;
  const totalParticipants = activities.reduce((sum, a) => sum + parseInt(a.participant_count || 0), 0);
  const volunteerCount    = users.filter(u => u.role === 'VOLUNTEER').length;
  const organizerCount    = users.filter(u => u.role === 'ORGANIZER').length;

  const pieData = Object.entries({
    UPCOMING: upcomingCount, ONGOING: ongoingCount,
    COMPLETED: completedCount, CANCELLED: cancelledCount,
  })
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ label: STATUS_COLORS[k].label, value: v, color: STATUS_COLORS[k].hex }));

  const barData = [...activities]
    .filter(a => parseInt(a.participant_count || 0) > 0)
    .sort((a, b) => parseInt(b.participant_count) - parseInt(a.participant_count))
    .slice(0, 6)
    .map(a => ({
      name: a.title.length > 14 ? a.title.slice(0, 14) + '…' : a.title,
      value: parseInt(a.participant_count || 0),
    }));

  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const upcomingActivities = activities
    .filter(a => a.status === 'UPCOMING')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  if (loadingAct || loadingUsers) return <div style={styles.loading}>Ачааллаж байна...</div>;

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Сайн байна уу, {user?.name}</h1>
        <p style={styles.pageSubtitle}>Системийн ерөнхий мэдээлэл</p>
      </div>

      <p style={styles.sectionLabel}>Үйл ажиллагааны статистик</p>
      <div style={styles.statGrid}>
        <StatCard label="Нийт үйл ажиллагаа" value={totalActivities} icon={<Activity size={20}/>}    color="#00203D" sub={`${ongoingCount} явагдаж байна`} />
        <StatCard label="Удахгүй"             value={upcomingCount}   icon={<AlertCircle size={20}/>} color="#185FA5" />
        <StatCard label="Дууссан"             value={completedCount}  icon={<CheckCircle size={20}/>} color="#0C447C" />
        <StatCard label="Цуцлагдсан"          value={cancelledCount}  icon={<XCircle size={20}/>}     color="#A32D2D" />
      </div>

      {user?.role === 'ADMIN' && (
        <>
          <p style={styles.sectionLabel}>Хэрэглэгч</p>
          <div style={{ ...styles.statGrid, gridTemplateColumns: '1fr 1fr 1fr' }}>
            <StatCard label="Нийт хэрэглэгч"   value={users.length}   icon={<Users size={20}/>} color="#00203D" />
            <StatCard label="Сайн дурынхан"     value={volunteerCount} icon={<Users size={20}/>} color="#185FA5" />
            <StatCard label="Зохион байгуулагч" value={organizerCount} icon={<Users size={20}/>} color="#0C447C" />
          </div>
        </>
      )}

      <p style={styles.sectionLabel}>Оролцоо</p>
      <div style={{ ...styles.statGrid, gridTemplateColumns: '1fr 1fr' }}>
        <StatCard label="Нийт оролцогч" value={totalParticipants} icon={<Users size={20}/>} color="#00203D" />
        <StatCard label="Дундаж оролцогч / үйл ажиллагаа" value={totalActivities ? (totalParticipants / totalActivities).toFixed(1) : 0} icon={<Users size={20}/>} color="#185FA5" />
      </div>

      {/* Charts */}
      <div style={styles.twoCol}>
        <div style={styles.card}>
          <p style={styles.cardTitle}>Үйл ажиллагааны төлөв</p>
          <p style={styles.cardSubtitle}>Нийт {totalActivities} үйл ажиллагаа</p>
          {pieData.length === 0 ? (
            <p style={styles.empty}>Мэдээлэл байхгүй</p>
          ) : (
            <>
              <DonutChart data={pieData} total={totalActivities} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                {pieData.map(d => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#718096' }}>{d.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#00203D' }}>{d.value}</span>
                      <span style={{ fontSize: 11, color: '#718096', width: 32, textAlign: 'right' }}>
                        {Math.round(d.value / totalActivities * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={styles.card}>
          <p style={styles.cardTitle}>Оролцогч тоогоор</p>
          <p style={styles.cardSubtitle}>Хамгийн их оролцогчтой үйл ажиллагаа</p>
          {barData.length === 0 ? (
            <p style={styles.empty}>Оролцогчтой үйл ажиллагаа байхгүй</p>
          ) : (
            <BarChart data={barData} />
          )}
        </div>
      </div>

      {/* Activity tables */}
      <div style={styles.twoCol}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.cardTitle}>Удахгүй болох үйл ажиллагаа</p>
              <p style={styles.cardSubtitle}>{upcomingActivities.length} үйл ажиллагаа</p>
            </div>
            <button style={styles.linkBtn} onClick={() => navigate('/activities')}>Бүгдийг харах</button>
          </div>
          {upcomingActivities.length === 0 ? (
            <p style={styles.empty}>Удахгүй болох үйл ажиллагаа байхгүй.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcomingActivities.map(act => (
                <div key={act.id} style={styles.activityRow} onClick={() => navigate(`/activities/${act.id}`)}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.activityTitle}>{act.title}</div>
                    <div style={styles.activityMeta}>
                      {new Date(act.date).toLocaleDateString('mn-MN')} · {act.location} · {act.participant_count || 0} оролцогч
                    </div>
                  </div>
                  <StatusBadge status={act.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.cardTitle}>Сүүлд нэмэгдсэн үйл ажиллагаа</p>
              <p style={styles.cardSubtitle}>{recentActivities.length} үйл ажиллагаа</p>
            </div>
            <button style={styles.linkBtn} onClick={() => navigate('/activities')}>Бүгдийг харах</button>
          </div>
          {recentActivities.length === 0 ? (
            <p style={styles.empty}>Үйл ажиллагаа байхгүй.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentActivities.map(act => (
                <div key={act.id} style={styles.activityRow} onClick={() => navigate(`/activities/${act.id}`)}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.activityTitle}>{act.title}</div>
                    <div style={styles.activityMeta}>{act.organizer_name} · {act.participant_count || 0} оролцогч</div>
                  </div>
                  <StatusBadge status={act.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  loading: { padding: 40, color: '#718096', fontSize: 14 },
  pageHeader: { marginBottom: 24 },
  pageTitle: { fontSize: 22, fontWeight: 700, color: '#00203D', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#718096' },
  sectionLabel: { fontSize: 12, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, marginTop: 24 },
  statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 4 },
  statCard: { background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(0,32,61,0.05)' },
  statIcon: { width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statInfo: { flex: 1 },
  statValue: { fontSize: 22, fontWeight: 700, color: '#00203D', lineHeight: 1.2 },
  statLabel: { fontSize: 12, color: '#4A5568', fontWeight: 500, marginTop: 2 },
  statSub: { fontSize: 11, color: '#718096', marginTop: 2 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 },
  card: { background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,32,61,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#00203D', marginBottom: 2 },
  cardSubtitle: { fontSize: 12, color: '#718096', marginBottom: 12 },
  linkBtn: { fontSize: 12, color: '#00203D', background: '#F4F6FF', border: '1px solid #E0E0E0', borderRadius: 5, padding: '5px 12px', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 },
  activityRow: { padding: '10px 14px', background: '#F4F6FF', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #E0E0E0' },
  activityTitle: { fontSize: 13, fontWeight: 600, color: '#00203D', marginBottom: 3 },
  activityMeta: { fontSize: 11, color: '#718096' },
  empty: { color: '#718096', fontSize: 13, textAlign: 'center', padding: '20px 0' },
};

export default DashboardPage;