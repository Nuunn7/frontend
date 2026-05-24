import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Calendar, Users, User, ArrowLeft, Edit2, Loader, UserPlus, XCircle } from 'lucide-react';
import { activityApi, participationApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import CardIllustration from '../../components/CardIllustration';

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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toast, setToast] = useState(null);

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

  const cancelMutation = useMutation({
    mutationFn: () => activityApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['activity', id]);
      queryClient.invalidateQueries(['activities']);
      setShowCancelModal(false);
      showToast('Үйл ажиллагаа цуцлагдлаа.');
    },
    onError: (err) => {
      setShowCancelModal(false);
      showToast(err.response?.data?.message || 'Алдаа гарлаа', 'error');
    },
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
    UPCOMING:  { bg: '#DBEAFE', color: '#1E40AF' },
    ONGOING:   { bg: '#FEF08A', color: '#713F12' },
    COMPLETED: { bg: '#DCFCE7', color: '#166534' },
    CANCELLED: { bg: '#FEE2E2', color: '#991B1B' },
    DEFAULT:   { bg: '#F3F4F6', color: '#374151' },
  };

  const statusLabel = {
    UPCOMING: 'Удахгүй', ONGOING: 'Явагдаж байна',
    COMPLETED: 'Дууссан', CANCELLED: 'Цуцлагдсан',
  };

  const sc = statusColors[activity.status] || statusColors.UPCOMING;
  const canJoin = user?.role === 'VOLUNTEER' && activity.status === 'UPCOMING';

  const canCancel = (
    activity.status !== 'CANCELLED' &&
    activity.status !== 'COMPLETED' &&
    (
      user?.role === 'ADMIN' ||
      (user?.role === 'ORGANIZER' && activity.organizer_id === user.id)
    )
  );

  const canEdit = (
    user?.role === 'ADMIN' ||
    (user?.role === 'ORGANIZER' && activity.organizer_id === user.id)
  );

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <button style={styles.backBtn} onClick={() => navigate('/activities')}>
        <ArrowLeft size={14} /> Буцах
      </button>

      <div style={styles.card}>
        <div style={styles.cardIllustration}>
          <CardIllustration index={parseInt(id) % 5} />
          <span style={{ ...styles.badge, background: sc.bg, color: sc.color, position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
            {statusLabel[activity.status] || activity.status}
          </span>
        </div>

        <div style={{ padding: 24 }}>
          <div style={styles.cardHeader}>
            <h2 style={styles.title}>
              {editMode ? 'Үйл ажиллагаа засварлах' : activity.title}
            </h2>
            <div style={styles.headerActions}>
              {canJoin && !editMode && (
                <button style={styles.joinBtn} onClick={() => setShowJoinModal(true)}>
                  <UserPlus size={14} /> Бүртгүүлэх
                </button>
              )}
              {canEdit && !editMode && (
                <button style={styles.editBtn} onClick={() => setEditMode(true)}>
                  <Edit2 size={14} /> Засварлах
                </button>
              )}
              {canCancel && !editMode && (
                <button style={styles.cancelActivityBtn} onClick={() => setShowCancelModal(true)}>
                  <XCircle size={14} /> Цуцлах
                </button>
              )}
              {canEdit && !editMode && (
                <button style={styles.reportBtn} onClick={generateReport}>
                  📄 Тайлан
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
                <button style={styles.cancelBtn} type="button" onClick={() => setEditMode(false)}>Болих</button>
                <button style={styles.submitBtn} type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Хадгалж байна...' : 'Хадгалах'}
                </button>
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
      </div>

      {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
        <div style={styles.card}>
          <div style={{ padding: 24 }}>
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
                      <th style={{ ...styles.th, width: '15%' }}>Төлөв</th>
                      <th style={{ ...styles.th, width: '50%', textAlign: 'right' }}>Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participations.map((p) => (
                      <ParticipationRow
                        key={p.id}
                        participation={p}
                        activityStatus={activity.status}
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
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p style={{ fontSize: 14, color: '#4A5568', margin: '16px 0' }}>
              Та <strong>{activity.title}</strong> үйл ажиллагаанд бүртгүүлэхдээ итгэлтэй байна уу?
            </p>
            <div style={styles.infoGrid}>
              <InfoItem icon={<MapPin size={16} />}   label="Байршил" value={activity.location} />
              <InfoItem icon={<Calendar size={16} />} label="Огноо"   value={new Date(activity.date).toLocaleDateString('mn-MN')} />
            </div>
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

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#c62828', marginBottom: 12 }}>Үйл ажиллагаа цуцлах</h3>
            <p style={{ fontSize: 14, color: '#4A5568', marginBottom: 20 }}>
              Та <strong>{activity.title}</strong> үйл ажиллагааг цуцлахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                style={{ padding: '9px 24px', background: '#fff', color: '#4A5568', border: '1px solid #E0E0E0', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                onClick={() => setShowCancelModal(false)}
              >
                Үгүй
              </button>
              <button
                style={{ padding: '9px 24px', background: 'rgba(235,76,76,0.12)', color: '#c62828', border: '1px solid rgba(235,76,76,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500, opacity: cancelMutation.isPending ? 0.7 : 1 }}
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Цуцалж байна...' : 'Тийм'}
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

const ParticipationRow = ({ participation, activityStatus, onVerify, onReject, isVerifying, isRejecting }) => {
  const [hours, setHours] = useState('4');
  const statusMap = {
    APPROVED: { bg: 'rgba(160,213,133,0.2)', color: '#2e7d32', label: 'Баталгаажсан' },
    REJECTED: { bg: 'rgba(235,76,76,0.12)',  color: '#c62828', label: 'Татгалзсан'   },
    PENDING:  { bg: 'rgba(243,198,35,0.15)', color: '#b8860b', label: 'Хүлээгдэж байна' },
  };
  const s = statusMap[participation.status] || statusMap.PENDING;

  // Verify/reject only allowed when activity is ONGOING or COMPLETED
  const canVerify = participation.status === 'PENDING' &&
    (activityStatus === 'ONGOING' || activityStatus === 'COMPLETED');

  return (
    <tr style={styles.tr}>
      <td style={styles.td}>{participation.user_name}</td>
      <td style={styles.td}>{participation.user_email}</td>
      <td style={styles.td}>
        <span style={{ ...styles.statusBadge, background: s.bg, color: s.color }}>{s.label}</span>
      </td>
      <td style={{ ...styles.td, textAlign: 'right' }}>
        {canVerify && (
          <div style={styles.verifyRow}>
            <input
              style={styles.hoursInput}
              type="number" placeholder="Цаг"
              value={hours} onChange={(e) => setHours(e.target.value)}
              min="0" step="0.5"
            />
            <button
              style={{ ...styles.verifyBtn, opacity: !hours || isVerifying ? 0.6 : 1, cursor: !hours || isVerifying ? 'not-allowed' : 'pointer' }}
              onClick={() => onVerify(hours)} disabled={!hours || isVerifying}
            >
              Баталгаажуулах
            </button>
            <button
              style={{ ...styles.rejectBtn, opacity: isRejecting ? 0.6 : 1, cursor: isRejecting ? 'not-allowed' : 'pointer' }}
              onClick={onReject} disabled={isRejecting}
            >
              Татгалзах
            </button>
          </div>
        )}
        {participation.status === 'PENDING' && activityStatus === 'UPCOMING' && (
          <span style={{ fontSize: 12, color: '#718096', fontStyle: 'italic' }}>
            Үйл ажиллагаа эхлээгүй байна
          </span>
        )}
        {participation.status === 'PENDING' && activityStatus === 'CANCELLED' && (
          <span style={{ fontSize: 12, color: '#c62828', fontStyle: 'italic' }}>
            Цуцлагдсан
          </span>
        )}
        {participation.status === 'APPROVED' && (
          <span style={{ fontSize: 12, color: '#2e7d32', fontWeight: 600 }}>
            {participation.hours} цаг ✓
          </span>
        )}
      </td>
    </tr>
  );
};

const generateReport = async () => {
  const loadScript = (src) => new Promise(resolve => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src; s.onload = resolve;
    document.head.appendChild(s);
  });

  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(0, 32, 61);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(195, 214, 234);
  doc.setFontSize(9);
  doc.text('VolunteerChain · ШУТИС · Х. Өнөгэрэл', 14, 10);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('Uйл ажиллагааны тайлан', 14, 22);

  doc.setTextColor(0, 32, 61);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(activity.title, 14, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const statusLabels = { UPCOMING: 'Udakhgui', ONGOING: 'Yavagdaj baina', COMPLETED: 'Duussaan', CANCELLED: 'Tsutslагдсан' };
  doc.autoTable({
    startY: 48,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50, textColor: [100, 100, 100] }, 1: { textColor: [0, 32, 61] } },
    body: [
      ['Bairshil',           activity.location],
      ['Ognoo',             new Date(activity.date).toLocaleString('mn-MN')],
      ['Zohion baiguulagch', activity.organizer_name],
      ['Oroltsogch',          `${activity.participant_count || 0}${activity.max_participants ? ' / ' + activity.max_participants : ''}`],
      ['Tuluw',            statusLabels[activity.status] || activity.status],
    ],
  });

  if (participations.length > 0) {
    const y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 32, 61);
    doc.text('Oroltsogchid', 14, y);

    const statusMap = { APPROVED: 'Batalgaajsan', REJECTED: 'Tatgalzsan', PENDING: 'Khuleegdej baina' };
    doc.autoTable({
      startY: y + 4,
      head: [['#', 'Ner', 'I-meyl', 'Tuluv', 'Tsag']],
      body: participations.map((p, i) => [
        i + 1,
        p.user_name,
        p.user_email,
        statusMap[p.status] || p.status,
        p.hours ? `${p.hours} tsag` : '-',
      ]),
      headStyles: { fillColor: [0, 32, 61], textColor: [195, 214, 234], fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fontSize: 10, textColor: [0, 32, 61] },
      alternateRowStyles: { fillColor: [244, 246, 255] },
      styles: { cellPadding: 4 },
    });
  }

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Tailan uusgesen: ${new Date().toLocaleString('mn-MN')}`, 14, doc.internal.pageSize.getHeight() - 10);

  doc.save(`${activity.title}-tailan.pdf`);
};

const styles = {
  loading: { display: 'flex', alignItems: 'center', gap: 10, padding: 60, color: '#718096', fontSize: 14 },
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, padding: '7px 14px', background: 'transparent', border: '1px solid #E0E0E0', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#00203D', fontWeight: 500 },
  card: { background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: 8, marginBottom: 20, boxShadow: '0 2px 6px rgba(0,32,61,0.06)', overflow: 'hidden' },
  cardIllustration: { position: 'relative', overflow: 'hidden', height: 160 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  title: { fontSize: 20, fontWeight: 700, color: '#00203D' },
  headerActions: { display: 'flex', alignItems: 'center', gap: 10 },
  badge: { fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.4px' },
  joinBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(160,213,133,0.25)', color: '#2e7d32', border: '1px solid rgba(160,213,133,0.4)', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  editBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#00203D', color: '#FFFFFF', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  cancelActivityBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(235,76,76,0.1)', color: '#c62828', border: '1px solid rgba(235,76,76,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
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
  input: { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13, color: '#00203D', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  formActions: { display: 'flex', gap: 10, marginTop: 4, justifyContent: 'flex-end' },
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
  reportBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(195,214,234,0.3)', color: '#00203D', border: '1px solid #C3D6EA', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
};

export default ActivityDetailPage;