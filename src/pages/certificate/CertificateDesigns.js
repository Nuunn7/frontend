import logoSrc from '../../assets/logo-must.png'
const BASE_URL = window.location.origin;
const A4_W = 1122;
const A4_H = 794;
const LOGO_SRC = logoSrc;

const QR = ({ hash, size = 80 }) => {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(`${BASE_URL}/?hash=${hash}`)}`;
  return <img src={url} alt="QR" style={{ width: size, height: size, borderRadius: 4, display: 'block' }} />;
};

const Logo = ({ height = 36, style = {} }) => (
  <img src={LOGO_SRC} alt="ШУТИС" style={{ height, display: 'block', objectFit: 'contain', ...style }} />
);

const certBase = {
  width: A4_W, height: A4_H, position: 'relative', overflow: 'hidden',
  fontFamily: "'Segoe UI', Arial, sans-serif", boxSizing: 'border-box',
};

export const Cert1 = ({ cert, name }) => (
  <div style={{ ...certBase, background: '#0C1B33' }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: 420, height: A4_H, background: '#162544', clipPath: 'polygon(12% 0,100% 0,100% 100%,0 100%)' }} />
    <div style={{ position: 'absolute', top: 0, right: 0, width: 380, height: A4_H, background: '#1e3260', clipPath: 'polygon(18% 0,100% 0,100% 100%,6% 100%)' }} />
    <div style={{ position: 'absolute', top: 48, right: 48, width: 3, height: A4_H - 96, background: 'linear-gradient(to bottom,#C9A84C,transparent)' }} />
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: 'linear-gradient(to right,#C9A84C,transparent)' }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '60%', height: 3, background: 'linear-gradient(to right,#C9A84C,transparent)' }} />
    <div style={{ position: 'relative', zIndex: 1, padding: '52px 480px 48px 72px' }}>
    <div style={{ background: 'rgba(255, 255, 255, 0.81)', borderRadius: 6, padding: '6px 10px', display: 'inline-block', marginBottom: 20 }}>
        <Logo height={28} />
    </div>      
    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}></div>
      <div style={{ fontSize: 52, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 12 }}>{name}</div>
      <div style={{ height: 2, width: 80, background: '#C9A84C', marginBottom: 20 }} />
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 6 }}>
        Дараах үйл ажиллагаанд <span style={{ color: '#fff', fontWeight: 600 }}>{cert.hours} цаг</span> оролцож амжилттай дуусгасныг гэрчилнэ
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#C9A84C', marginBottom: 48 }}>{cert.activity_title}</div>
      <div style={{ display: 'flex', gap: 48 }}>
        {[['Огноо', new Date(cert.issued_at).toLocaleDateString('mn-MN')], ['Цаг', `${cert.hours} цаг`], ['Төлөв', '✓ Баталгаажсан']].map(([l, v], i) => (
          <div key={i}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: i === 2 ? '#C9A84C' : '#fff' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ position: 'absolute', right: 72, top: '50%', transform: 'translateY(-50%)', textAlign: 'center' }}>
      <QR hash={cert.hash} size={90} />
    </div>
    <div style={{ position: 'absolute', bottom: 16, left: 72, fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)', maxWidth: 560, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      SHA-256: {cert.hash}
    </div>
  </div>
);

export const Cert2 = ({ cert, name }) => (
  <div style={{ ...certBase, background: '#fff' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, width: 320, height: A4_H, background: '#0F4C35' }} />
    <div style={{ position: 'absolute', top: 0, left: 320, width: 60, height: A4_H, background: '#0F4C35', clipPath: 'polygon(0 0,100% 0,0 100%)' }} />
    <div style={{ position: 'absolute', top: 0, left: 0, width: 320, height: A4_H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1, padding: '48px 32px' }}>
    <div style={{ background: 'rgba(255, 255, 255, 0.81)', borderRadius: 6, padding: '6px 10px', display: 'inline-block', marginBottom: 24 }}>
        <Logo height={24} />
    </div>      
    <div style={{ height: 1, width: 48, background: 'rgba(255,255,255,0.2)', marginBottom: 32 }} />
      <QR hash={cert.hash} size={80} />
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 10, textAlign: 'center' }}>Баталгаажуулах QR</div>
    </div>
    <div style={{ position: 'relative', zIndex: 1, marginLeft: 400, padding: '64px 64px 64px 0' }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: '#0F4C35', textTransform: 'uppercase', marginBottom: 8 }}>Оролцооны батламж</div>
      <div style={{ fontSize: 48, fontWeight: 700, color: '#0a2e1f', lineHeight: 1.1, marginBottom: 8 }}>Батламж</div>
      <div style={{ height: 3, width: 60, background: '#22c55e', marginBottom: 28, borderRadius: 2 }} />
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}></div>
      <div style={{ fontSize: 34, fontWeight: 700, color: '#0a2e1f', marginBottom: 6 }}>{name}</div>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Дараах үйл ажиллагаанд <strong style={{ color: '#0F4C35' }}>{cert.hours} цаг</strong> оролцсоныг гэрчилнэ</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#0F4C35', marginBottom: 32 }}>{cert.activity_title}</div>
      <div style={{ display: 'flex', gap: 0, border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        {[['Огноо', new Date(cert.issued_at).toLocaleDateString('mn-MN')], ['Цаг', `${cert.hours} цаг`], ['Баталгаажуулалт', '✓ SHA-256']].map(([l, v], i, arr) => (
          <div key={i} style={{ flex: 1, padding: '14px 18px', borderRight: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none', background: i % 2 === 0 ? '#f9fafb' : '#fff' }}>
            <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: i === 2 ? '#0F4C35' : '#111827' }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#d1d5db', marginTop: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>SHA-256: {cert.hash}</div>
    </div>
  </div>
);

export const Cert3 = ({ cert, name }) => (
  <div style={{ ...certBase, background: '#F8FAFC' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, width: A4_W, height: 8, background: '#00203D' }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: A4_W, height: 8, background: '#00203D' }} />
    <div style={{ position: 'absolute', top: 8, left: 0, width: 8, height: A4_H - 16, background: '#C3D6EA' }} />
    <div style={{ position: 'absolute', top: 8, right: 0, width: 8, height: A4_H - 16, background: '#C3D6EA' }} />
    <div style={{ position: 'relative', zIndex: 1, padding: '52px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <Logo height={36} />
        <QR hash={cert.hash} size={80} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 1, background: '#E0E0E0' }} />
        <div style={{ width: 8, height: 8, background: '#00203D', transform: 'rotate(45deg)' }} />
        <div style={{ flex: 1, height: 1, background: '#E0E0E0' }} />
      </div>
      <div style={{ display: 'flex', gap: 0, marginBottom: 32 }}>
        <div style={{ width: 4, background: '#00203D', borderRadius: 2, marginRight: 24, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}></div>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#00203D', marginBottom: 8 }}>{name}</div>
          <div style={{ fontSize: 14, color: '#475569', marginBottom: 4 }}>
            Дараах үйл ажиллагаанд <strong style={{ color: '#00203D' }}>{cert.hours} цаг</strong> оролцож амжилттай дуусгасныг гэрчилнэ
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>{cert.activity_title}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 1, background: '#E0E0E0' }} />
        <div style={{ width: 8, height: 8, background: '#00203D', transform: 'rotate(45deg)' }} />
        <div style={{ flex: 1, height: 1, background: '#E0E0E0' }} />
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        {[['Огноо', new Date(cert.issued_at).toLocaleDateString('mn-MN')], ['Цаг', `${cert.hours} цаг`], ['Төлөв', '✓ Баталгаажсан']].map(([l, v], i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 20px' }}>
            <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: i === 2 ? '#166534' : '#00203D' }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#cbd5e1', marginTop: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>SHA-256: {cert.hash}</div>
    </div>
  </div>
);

export const Cert4 = ({ cert, name }) => (
  <div style={{ ...certBase, background: '#fdf4ff' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, width: A4_W, height: 6, background: 'linear-gradient(to right,#7c3aed,#a855f7,#ec4899)' }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: A4_W, height: 6, background: 'linear-gradient(to right,#ec4899,#a855f7,#7c3aed)' }} />
    <div style={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(168,85,247,0.1)' }} />
    <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(236,72,153,0.08)' }} />
    <div style={{ position: 'relative', zIndex: 1, padding: '64px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <Logo height={34} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#a855f7', textTransform: 'uppercase' }}>Оролцооны батламж</div>
        </div>
        <QR hash={cert.hash} size={84} />
      </div>
      <div style={{ height: 1, background: 'linear-gradient(to right,rgba(168,85,247,0.3),transparent)', marginBottom: 32 }} />
      <div style={{ fontSize: 46, fontWeight: 700, color: '#1e1b4b', letterSpacing: -1, lineHeight: 1, marginBottom: 16 }}>Батламж</div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}></div>
        <div style={{ fontSize: 42, fontWeight: 700, color: '#1e1b4b', marginBottom: 10, lineHeight: 1.1 }}>{name}</div>
        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 6 }}>
          Дараах үйл ажиллагаанд <strong style={{ color: '#7c3aed' }}>{cert.hours} цаг</strong> оролцож амжилттай дуусгасныг гэрчилнэ
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#7c3aed' }}>{cert.activity_title}</div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {[['Огноо', new Date(cert.issued_at).toLocaleDateString('mn-MN')], ['Цаг', `${cert.hours} цаг`], ['Баталгаажуулалт', '✓ Verified']].map(([l, v], i) => (
          <div key={i} style={{ flex: 1, padding: '14px 18px', background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: 10 }}>
            <div style={{ fontSize: 9, color: '#a855f7', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: i === 2 ? '#7c3aed' : '#1e1b4b' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ position: 'absolute', bottom: 22, left: 80, fontFamily: 'monospace', fontSize: 9, color: '#e9d5ff', maxWidth: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      SHA-256: {cert.hash}
    </div>
  </div>
);

export const Cert5 = ({ cert, name }) => (
  <div style={{ ...certBase, background: '#fff' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, width: A4_W, height: A4_H, background: '#FFF9F5' }} />
    <div style={{ position: 'absolute', top: 0, left: 0, width: 480, height: A4_H, background: '#FFF0E8' }} />
    <div style={{ position: 'absolute', top: 0, left: 480, width: 40, height: A4_H, background: 'linear-gradient(to right,#FFF0E8,#FFF9F5)' }} />
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', height: A4_H }}>
      <div style={{ width: 520, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 56px' }}>
        <Logo height={30} style={{ marginBottom: 24 }} />
        <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}></div>
        <div style={{ fontSize: 38, fontWeight: 700, color: '#431407', lineHeight: 1.1, marginBottom: 12 }}>{name}</div>
        <div style={{ height: 3, width: 64, background: 'linear-gradient(to right,#ea580c,#f97316)', borderRadius: 2, marginBottom: 16 }} />
        <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.7, marginBottom: 8 }}>
          Дараах үйл ажиллагаанд <strong>{cert.hours} цаг</strong> оролцож амжилттай дуусгасныг гэрчилнэ
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#9a3412', marginBottom: 36 }}>{cert.activity_title}</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Огноо', new Date(cert.issued_at).toLocaleDateString('mn-MN'), '#fb923c'], ['Цаг', `${cert.hours} цаг`, '#fb923c'], ['Төлөв', '✓ Баталгаажсан', '#166534']].map(([l, v, c], i) => (
            <div key={i}>
              <div style={{ fontSize: 9, color: c, textTransform: 'uppercase', letterSpacing: 1, borderTop: '2px solid #fed7aa', paddingTop: 6, marginBottom: 3 }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: i === 2 ? '#166534' : '#431407' }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#fdba74', marginTop: 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>SHA-256: {cert.hash}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ textAlign: 'center', fontSize: 11, letterSpacing: 3, color: '#ea580c', textTransform: 'uppercase' }}>Оролцооны батламж</div>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: '#ea580c', textAlign: 'center', lineHeight: 1.4 }}>VOLUNTEER<br/>CHAIN<br/>✓</div>
          </div>
        </div>
        <QR hash={cert.hash} size={90} />
        <div style={{ fontSize: 9, color: '#fb923c', textAlign: 'center', letterSpacing: 1 }}>БАТАЛГААЖУУЛАХ QR</div>
      </div>
    </div>
  </div>
);

export const CERT_STYLES = [
  { id: 1, component: Cert1 },
  { id: 2, component: Cert2 },
  { id: 3, component: Cert3 },
  { id: 4, component: Cert4 },
  { id: 5, component: Cert5 },
];