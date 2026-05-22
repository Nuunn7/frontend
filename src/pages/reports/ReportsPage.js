import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { activityApi } from '../../api';
import { FileText, Download, MapPin, Calendar, Users, Loader, Inbox, ChevronDown, ChevronUp } from 'lucide-react';

const generatePDF = async (activity, participations) => {
  const statusLabels = {
    UPCOMING: 'Удахгүй', ONGOING: 'Явагдаж байна',
    COMPLETED: 'Дууссан', CANCELLED: 'Цуцлагдсан',
  };
  const partStatusMap = {
    APPROVED: 'Баталгаажсан', REJECTED: 'Татгалзсан', PENDING: 'Хүлээгдэж байна',
  };
  const approvedCount = participations.filter(p => p.status === 'APPROVED').length;
  const pendingCount  = participations.filter(p => p.status === 'PENDING').length;
  const totalHours    = participations.reduce((s, p) => s + parseFloat(p.hours || 0), 0);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${activity.title} - Тайлан</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a2e; padding: 32px; }
        .header { background: #00203D; color: white; padding: 20px 28px; border-radius: 8px; margin-bottom: 24px; }
        .header .brand { font-size: 11px; color: #C3D6EA; margin-bottom: 6px; }
        .header h1 { font-size: 20px; font-weight: 700; }
        .act-title { font-size: 16px; font-weight: 700; color: #00203D; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #C3D6EA; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .info-item { background: #F4F6FF; border-radius: 6px; padding: 12px 16px; }
        .info-item .label { font-size: 10px; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .info-item .value { font-size: 13px; font-weight: 600; color: #00203D; }
        .section-title { font-size: 14px; font-weight: 700; color: #00203D; margin-bottom: 12px; margin-top: 24px; }
        table { width: 100%; border-collapse: collapse; overflow: hidden; }
        thead { background: #00203D; }
        thead th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; color: #C3D6EA; text-transform: uppercase; letter-spacing: 0.4px; }
        tbody tr:nth-child(even) { background: #F4F6FF; }
        tbody td { padding: 10px 14px; font-size: 12px; border-bottom: 1px solid #E0E0E0; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .badge-approved { background: rgba(220,252,231,0.9); color: #166534; }
        .badge-pending  { background: rgba(254,243,199,0.9); color: #92400e; }
        .badge-rejected { background: rgba(254,226,226,0.9); color: #991b1b; }
        .summary { background: #F4F6FF; border: 1px solid #E0E0E0; border-radius: 8px; padding: 16px 20px; margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; }
        .summary-item .s-label { font-size: 10px; color: #718096; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px; }
        .summary-item .s-value { font-size: 20px; font-weight: 700; color: #00203D; }
        .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #E0E0E0; display: flex; justify-content: space-between; font-size: 10px; color: #718096; }
        .no-participants { color: #718096; margin-top: 12px; font-style: italic; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">VolunteerChain</div>
        <h1>Үйл ажиллагааны тайлан</h1>
      </div>

      <div class="act-title">${activity.title}</div>

      <div class="info-grid">
        <div class="info-item">
          <div class="label">Байршил</div>
          <div class="value">${activity.location}</div>
        </div>
        <div class="info-item">
          <div class="label">Огноо</div>
          <div class="value">${new Date(activity.date).toLocaleString('mn-MN')}</div>
        </div>
        <div class="info-item">
          <div class="label">Зохион байгуулагч</div>
          <div class="value">${activity.organizer_name}</div>
        </div>
        <div class="info-item">
          <div class="label">Төлөв</div>
          <div class="value">${statusLabels[activity.status] || activity.status}</div>
        </div>
        <div class="info-item">
          <div class="label">Нийт оролцогч</div>
          <div class="value">${activity.participant_count || 0}${activity.max_participants ? ' / ' + activity.max_participants : ''}</div>
        </div>
        <div class="info-item">
          <div class="label">Нийт баталгаажсан цаг</div>
          <div class="value">${totalHours} цаг</div>
        </div>
      </div>

      <div class="section-title">Оролцогчид (${participations.length})</div>

      ${participations.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Нэр</th>
              <th>И-мэйл</th>
              <th>Төлөв</th>
              <th>Цаг</th>
            </tr>
          </thead>
          <tbody>
            ${participations.map((p, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${p.user_name}</td>
                <td>${p.user_email}</td>
                <td><span class="badge badge-${p.status.toLowerCase()}">${partStatusMap[p.status] || p.status}</span></td>
                <td>${p.hours ? p.hours + ' цаг' : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p class="no-participants">Оролцогч байхгүй байна.</p>'}

      <div class="summary">
        <div class="summary-item">
          <div class="s-label">Нийт оролцогч</div>
          <div class="s-value">${participations.length}</div>
        </div>
        <div class="summary-item">
          <div class="s-label">Баталгаажсан</div>
          <div class="s-value">${approvedCount}</div>
        </div>
        <div class="summary-item">
          <div class="s-label">Хүлээгдэж байна</div>
          <div class="s-value">${pendingCount}</div>
        </div>
        <div class="summary-item">
          <div class="s-label">Нийт цаг</div>
          <div class="s-value">${totalHours}</div>
        </div>
      </div>

      <div class="footer">
        <span>Тайлан үүсгэсэн: ${new Date().toLocaleString('mn-MN')}</span>
        <span>ШУТИС · МХТС</span>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(() => window.close(), 1000);
        };
      <\/script>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
};

const STATUS_META = {
  UPCOMING:  { label: 'Удахгүй',       bg: 'rgba(219,234,254,0.7)', color: '#1e40af' },
  ONGOING:   { label: 'Явагдаж байна', bg: 'rgba(254,243,199,0.7)', color: '#92400e' },
  COMPLETED: { label: 'Дууссан',        bg: 'rgba(220,252,231,0.7)', color: '#166534' },
  CANCELLED: { label: 'Цуцлагдсан',    bg: 'rgba(254,226,226,0.7)', color: '#991b1b' },
};

const ActivityRow = ({ activity, user }) => {
  const [expanded,    setExpanded]    = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [participations, setParticipations] = useState(null);

  const canDownload = activity.status === 'COMPLETED' || activity.status === 'ONGOING';
  const isOwner     = user?.role === 'ADMIN' || activity.organizer_id === user?.id;
  const sm          = STATUS_META[activity.status] || STATUS_META.UPCOMING;

  const fetchParticipations = async () => {
    try {
      const res = await activityApi.getParticipations(activity.id);
      return res.data.data || [];
    } catch {
      return [];
    }
  };

  const handleExpand = async () => {
    if (!expanded && participations === null) {
      const parts = await fetchParticipations();
      setParticipations(parts);
    }
    setExpanded(v => !v);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      let parts = participations;
      if (parts === null) {
        parts = await fetchParticipations();
        setParticipations(parts);
      }
      await generatePDF(activity, parts);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={styles.row}>
      <div style={styles.rowMain}>
        <div style={styles.rowLeft}>
          <div style={styles.rowIcon}>
            <FileText size={16} color="#00203D" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={styles.rowTitle}>{activity.title}</div>
            <div style={styles.rowMeta}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <MapPin size={11} />{activity.location}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Calendar size={11} />{new Date(activity.date).toLocaleDateString('mn-MN')}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Users size={11} />{activity.participant_count || 0} оролцогч
              </span>
              <span>Зохион байгуулагч: {activity.organizer_name}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ ...styles.pill, background: sm.bg, color: sm.color }}>{sm.label}</span>

          {isOwner && (
            <button style={styles.expandBtn} onClick={handleExpand}>
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              Оролцогчид
            </button>
          )}

          {isOwner && canDownload && (
            <button
              style={{ ...styles.downloadBtn, opacity: downloading ? 0.7 : 1 }}
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading
                ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />
                : <Download size={13} />}
              Тайлан татах
            </button>
          )}

          {isOwner && !canDownload && (
            <span style={styles.noReport}>Тайлан боломжгүй</span>
          )}
        </div>
      </div>

      {expanded && (
        <div style={styles.participantsBox}>
          {participations === null ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16, color: '#718096', fontSize: 13 }}>
              <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Ачааллаж байна...
            </div>
          ) : participations.length === 0 ? (
            <p style={{ padding: 16, color: '#718096', fontSize: 13 }}>Оролцогч байхгүй байна.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Нэр</th>
                  <th style={styles.th}>И-мэйл</th>
                  <th style={styles.th}>Төлөв</th>
                  <th style={styles.th}>Цаг</th>
                </tr>
              </thead>
              <tbody>
                {participations.map((p, i) => {
                  const ps = {
                    APPROVED: { label: 'Баталгаажсан', color: '#166534', bg: 'rgba(220,252,231,0.7)' },
                    REJECTED: { label: 'Татгалзсан',   color: '#991b1b', bg: 'rgba(254,226,226,0.7)' },
                    PENDING:  { label: 'Хүлээгдэж байна', color: '#92400e', bg: 'rgba(254,243,199,0.7)' },
                  }[p.status] || { label: p.status, color: '#555', bg: '#eee' };
                  return (
                    <tr key={p.id} style={styles.tr}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={styles.td}>{p.user_name}</td>
                      <td style={styles.td}>{p.user_email}</td>
                      <td style={styles.td}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: ps.bg, color: ps.color }}>
                          {ps.label}
                        </span>
                      </td>
                      <td style={styles.td}>{p.hours ? `${p.hours} цаг` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

const ReportsPage = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reports-activities'],
    queryFn: () => activityApi.getAll({ limit: 100 }),
  });

  const all = data?.data?.data || [];

  const activities = all
    .filter(a => user?.role === 'ADMIN' ? true : a.organizer_id === user?.id)
    .filter(a => statusFilter ? a.status === statusFilter : true)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 32, color: '#718096', fontSize: 14 }}>
      <Loader size={18} color="#718096" /> Ачааллаж байна...
    </div>
  );

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Тайлан</h1>
          <p style={styles.subtitle}>
            {user?.role === 'ADMIN' ? 'Бүх үйл ажиллагааны тайлан' : 'Миний үйл ажиллагааны тайлан'}
          </p>
        </div>
      </div>

      <div style={styles.filterBar}>
        <select
          style={styles.select}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Бүх төлөв</option>
          <option value="COMPLETED">Дууссан</option>
          <option value="ONGOING">Явагдаж байна</option>
          <option value="UPCOMING">Удахгүй</option>
          <option value="CANCELLED">Цуцлагдсан</option>
        </select>
        <span style={styles.count}>{activities.length} үйл ажиллагаа</span>
      </div>

      <div style={styles.infoBox}>
        <FileText size={14} color="#185FA5" />
        <span>Зөвхөн <strong>Дууссан</strong> болон <strong>Явагдаж байгаа</strong> төлөвтэй үйл ажиллагааны тайланг татах боломжтойг анхаарна уу.</span>
      </div>

      {activities.length === 0 ? (
        <div style={styles.empty}>
          <Inbox size={36} color="#C3D6EA" style={{ marginBottom: 10 }} />
          <p style={{ fontWeight: 600, color: '#00203D', marginBottom: 4 }}>Үйл ажиллагаа байхгүй байна</p>
          <small style={{ color: '#718096' }}>Үйл ажиллагаа нэмсний дараа энд харагдана.</small>
        </div>
      ) : (
        <div style={styles.list}>
          {activities.map(a => (
            <ActivityRow key={a.id} activity={a} user={user} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, color: '#00203D', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#718096' },
  filterBar: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  select: { padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13, color: '#00203D', background: '#fff', outline: 'none', cursor: 'pointer' },
  count: { fontSize: 13, color: '#718096' },
  infoBox: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(24,95,165,0.06)', border: '1px solid rgba(24,95,165,0.15)', borderRadius: 6, fontSize: 12, color: '#185FA5', marginBottom: 20 },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  row: { background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,32,61,0.04)' },
  rowMain: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', gap: 12 },
  rowLeft: { display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  rowIcon: { width: 36, height: 36, borderRadius: 8, background: '#F4F6FF', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowTitle: { fontSize: 14, fontWeight: 600, color: '#00203D', marginBottom: 4 },
  rowMeta: { display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: '#718096', flexWrap: 'wrap' },
  pill: { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' },
  expandBtn: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#F4F6FF', color: '#00203D', border: '1px solid #E0E0E0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' },
  downloadBtn: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: '#00203D', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' },
  noReport: { fontSize: 11, color: '#718096', fontStyle: 'italic', whiteSpace: 'nowrap' },
  participantsBox: { borderTop: '1px solid #E0E0E0', background: '#F8FAFC' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#00203D' },
  th: { padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#C3D6EA', letterSpacing: '0.4px', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #E0E0E0' },
  td: { padding: '10px 14px', fontSize: 13, color: '#00203D' },
  empty: { textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8 },
};

export default ReportsPage;