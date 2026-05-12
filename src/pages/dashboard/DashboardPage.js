// src/pages/dashboard/DashboardPage.js
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userApi, activityApi } from '../../api';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: participationsData, isLoading: loadingPart } = useQuery({
    queryKey: ['my-participations', user?.id],
    queryFn: () => userApi.getParticipations(user.id),
    enabled: !!user?.id,
  });

  const { data: certificatesData, isLoading: loadingCert } = useQuery({
    queryKey: ['my-certificates', user?.id],
    queryFn: () => userApi.getCertificates(user.id),
    enabled: !!user?.id,
  });

  const { data: activitiesData, isLoading: loadingAct } = useQuery({
    queryKey: ['activities-upcoming'],
    queryFn: () => activityApi.getAll({ status: 'UPCOMING', limit: 3 }),
  });

  const participations = participationsData?.data?.data || [];
  const certificates = certificatesData?.data?.data || [];
  const upcomingActivities = activitiesData?.data?.data || [];

  const totalHours = participations
    .filter((p) => p.status === 'VERIFIED')
    .reduce((sum, p) => sum + Number(p.hours || 0), 0);

  const verifiedCount = participations.filter((p) => p.status === 'VERIFIED').length;
  const pendingCount = participations.filter((p) => p.status === 'PENDING').length;

  const isLoading = loadingPart || loadingCert || loadingAct;
  if (isLoading) return <p>Ачааллаж байна...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Сайн байна уу, {user?.name}</h1>
        <p>Таны үйл ажиллагааны хураангуй</p>
      </div>

      {/* Stat cards */}
      <div className="card-grid" style={{ marginBottom: 32 }}>
        <StatCard
          label="Нийт цаг"
          value={`${totalHours} цаг`}
          sub="Баталгаажсан оролцоо"
        />
        <StatCard
          label="Батламж"
          value={certificates.length}
          sub="Нийт авсан батламж"
        />
        <StatCard
          label="Баталгаажсан"
          value={verifiedCount}
          sub="Оролцоо баталгаажсан"
        />
        <StatCard
          label="Хүлээгдэж байна"
          value={pendingCount}
          sub="Шалгагдаж байгаа"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Upcoming activities */}
        <div className="card">
          <div className="flex-between mb-16">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#00203D' }}>
              Ойрын үйл ажиллагаа
            </h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/activities')}
            >
              Бүгдийг харах
            </button>
          </div>

          {upcomingActivities.length === 0 ? (
            <p className="text-muted text-sm">Ойрын үйл ажиллагаа байхгүй байна.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingActivities.map((act) => (
                <div
                  key={act.id}
                  className="card"
                  style={{ cursor: 'pointer', padding: '12px 16px', marginBottom: 0 }}
                  onClick={() => navigate(`/activities/${act.id}`)}
                >
                  <div className="flex-between">
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#00203D' }}>
                      {act.title}
                    </span>
                    <StatusBadge status={act.status} />
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span className="text-muted text-sm">
                      {new Date(act.date).toLocaleDateString('mn-MN')}
                    </span>
                    <span className="text-muted text-sm" style={{ marginLeft: 12 }}>
                      {act.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent certificates */}
        <div className="card">
          <div className="flex-between mb-16">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#00203D' }}>
              Сүүлийн батламжууд
            </h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/certificates')}
            >
              Бүгдийг харах
            </button>
          </div>

          {certificates.length === 0 ? (
            <p className="text-muted text-sm">Одоогоор батламж байхгүй байна.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {certificates.slice(0, 3).map((cert) => (
                <div
                  key={cert.id}
                  className="card"
                  style={{ padding: '12px 16px', marginBottom: 0 }}
                >
                  <div className="flex-between">
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#00203D' }}>
                      {cert.activity_title}
                    </span>
                    <span
                      style={{
                        fontSize: 11, fontWeight: 600, color: '#00203D',
                        background: '#C3D6EA', padding: '2px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {cert.hours} цаг
                    </span>
                  </div>
                  <span className="text-muted text-sm" style={{ marginTop: 4, display: 'block' }}>
                    {new Date(cert.issued_at).toLocaleDateString('mn-MN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Organizer / Admin extra section */}
      {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#00203D', marginBottom: 16 }}>
            Удирдлага
          </h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/activities')}
            >
              Үйл ажиллагаа нэмэх
            </button>
            {user?.role === 'ADMIN' && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/admin/users')}
              >
                Хэрэглэгч удирдах
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, sub }) => (
  <div className="card" style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 28, fontWeight: 800, color: '#00203D', marginBottom: 4 }}>
      {value}
    </div>
    <div style={{ fontSize: 13, fontWeight: 600, color: '#00203D', marginBottom: 4 }}>
      {label}
    </div>
    <div className="text-muted text-sm">{sub}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    UPCOMING: { label: 'Удахгүй', bg: '#C3D6EA', color: '#00203D' },
    ONGOING: { label: 'Явагдаж байна', bg: '#d4edda', color: '#155724' },
    COMPLETED: { label: 'Дууссан', bg: '#E0E0E0', color: '#555' },
    CANCELLED: { label: 'Цуцлагдсан', bg: '#f8d7da', color: '#721c24' },
  };
  const s = map[status] || map.UPCOMING;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px',
      borderRadius: 4, background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
};

export default DashboardPage;