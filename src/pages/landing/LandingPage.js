import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Search, CheckCircle, XCircle, Loader, X, Upload, Shield, Lock, Globe, Zap } from 'lucide-react';
import volunteersImg from '../../assets/volunteers.png';

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #E0E0E0', gap: 16 }}>
    <span style={{ fontSize: 12, color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{label}</span>
    <span style={{ fontSize: 13, color: '#00203D', textAlign: 'right' }}>{value}</span>
  </div>
);

const AnimatedCounter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
};

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hash, setHash] = useState(searchParams.get('hash') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('hash');
  const [animated, setAnimated] = useState(false);
  const verifyRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated]);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
    const hashParam = searchParams.get('hash');
    if (hashParam) {
      setHash(hashParam);
      handleVerify(hashParam);
      setTimeout(() => verifyRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
    }
  }, []);

  const loadJsQR = () => new Promise((resolve) => {
    if (window.jsQR) return resolve(window.jsQR);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
    script.onload = () => resolve(window.jsQR);
    document.head.appendChild(script);
  });

  const loadPdfJs = () => new Promise((resolve) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    document.head.appendChild(script);
  });

  const scanQRFromCanvas = (canvas, jsQR) => {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(imageData.data, imageData.width, imageData.height);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError(''); setResult(null);
    const jsQR = await loadJsQR();

    if (file.type === 'application/pdf') {
      try {
        const pdfjs = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let found = null;
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.5 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;
          const code = scanQRFromCanvas(canvas, jsQR);
          if (code) { found = code.data; break; }
        }
        if (found) {
          const extracted = found.includes('hash=') ? found.split('hash=')[1] : found;
          setHash(extracted); handleVerify(extracted); setActiveTab('hash');
        } else {
          setError('PDF-ээс QR код олдсонгүй. Батламжийн PDF файл оруулна уу.');
        }
      } catch {
        setError('PDF уншихад алдаа гарлаа. Дахин оролдоно уу.');
      }
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const code = scanQRFromCanvas(canvas, jsQR);
      URL.revokeObjectURL(url);
      if (code) {
        const scanned = code.data;
        const extracted = scanned.includes('hash=') ? scanned.split('hash=')[1] : scanned;
        setHash(extracted); handleVerify(extracted); setActiveTab('hash');
      } else {
        setError('Зурган дотроос QR код олдсонгүй.');
      }
    };
    img.src = url;
  };

  const handleVerify = async (hashToVerify) => {
    const h = (hashToVerify || hash).trim();
    if (!h) { setError('Хэш утга оруулна уу.'); return; }
    if (h.length !== 64) { setError('Хэш утга 64 тэмдэгт байх ёстой.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await api.get(`/certificates/verify/${h}`);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Батламж олдсонгүй.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); handleVerify(hash); };

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        .fu { animation: fadeUp 0.8s cubic-bezier(.22,1,.36,1) forwards; }
        .d1{animation-delay:0.1s;opacity:0} .d2{animation-delay:0.25s;opacity:0}
        .d3{animation-delay:0.4s;opacity:0} .d4{animation-delay:0.55s;opacity:0}
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,32,61,0.1) !important; }
        .feature-card { transition: all 0.2s ease; }
        .tab-btn:hover { border-color: #00203D !important; color: #00203D !important; }
        .upload-zone:hover { border-color: #00203D !important; }
        .hero-cta:hover { background: #A8C0D8 !important; }
        .hero-secondary:hover { background: rgba(195,214,234,0.1) !important; }
        .nav-link-hover: hover { color: #C3D6EA !important; }
      `}</style>

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C3D6EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="6" height="10" rx="1"/>
            <rect x="9" y="4" width="6" height="16" rx="1"/>
            <rect x="16" y="9" width="6" height="8" rx="1"/>
          </svg>
          <span style={styles.navLogoText}>VolunteerChain</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
        <Link to="/login" className="nav-link-hover" style={{ color: '#fff', fontSize: 14, textDecoration: 'none', transition: 'color 0.15s' }}>Нэвтрэх</Link>
        <Link to="/register" className="nav-link-hover" style={{ color: '#fff', fontSize: 14, textDecoration: 'none', transition: 'color 0.15s' }}>Бүртгүүлэх</Link>
        </div>
      </nav>

      {/* HERO - full width background */}
      <section style={styles.hero}>
        <img src={volunteersImg} alt="МХТС volunteers" style={styles.heroBgImg} />
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div className={animated ? 'fu d1' : ''} style={styles.heroBadge}>
            🔗 Блокчейнд баталгаажсан
          </div>
          <h1 className={animated ? 'fu d2' : ''} style={styles.heroTitle}>
            Сайн дурын үйл ажиллагааны бүртгэлийн систем
          </h1>
          <p className={animated ? 'fu d3' : ''} style={styles.heroSubtitle}>
            Оролцогчдын батламжийг SHA-256 хэшээр баталгаажуулж,<br />
            Polygon Amoy блокчейнд бүртгэдэг тул хуурамчаар үйлдэх боломжгүй.
          </p>
          <div className={animated ? 'fu d4' : ''} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="hero-cta"
              style={styles.heroCta}
              onClick={() => verifyRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              Батламж шалгах
            </button>
            <Link to="/register" className="hero-secondary" style={styles.heroSecondary}>
              Бүртгүүлэх →
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={styles.statsSection}>
        <div style={styles.statsInner}>
          <div style={styles.statBox}>
            <div style={styles.statNum}><AnimatedCounter target={3} />+</div>
            <div style={styles.statLbl}>Үйл ажиллагаа</div>
          </div>
          <div style={styles.statDivider}/>
          <div style={styles.statBox}>
            <div style={styles.statNum}><AnimatedCounter target={10} />+</div>
            <div style={styles.statLbl}>Бүртгэлтэй хэрэглэгч</div>
          </div>
          <div style={styles.statDivider}/>
          <div style={styles.statBox}>
            <div style={styles.statNum}><AnimatedCounter target={100} />%</div>
            <div style={styles.statLbl}>Блокчейн баталгаа</div>
          </div>
          <div style={styles.statDivider}/>
          <div style={styles.statBox}>
            <div style={styles.statNum}>SHA-256</div>
            <div style={styles.statLbl}>Хэш алгоритм</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={styles.featuresSection}>
        <div style={styles.featuresInner}>
          <h2 style={styles.sectionTitle}>Системийн давуу талууд</h2>
          <p style={styles.sectionSubtitle}>Блокчейн технологи дээр суурилсан найдвартай систем</p>
          <div style={styles.featuresGrid}>
            {[
              { icon: <Shield size={28} color="#00203D"/>, title: 'Өөрчлөх боломжгүй', desc: 'Блокчейнд бүртгэгдсэн батламжийг өөрчлөх, устгах боломжгүй тул найдвартай.' },
              { icon: <Lock size={28} color="#00203D"/>, title: 'SHA-256 баталгаа', desc: 'Батламж бүр өвөрмөц SHA-256 хэш кодтой тул хуурамчаар үйлдэх боломжгүй.' },
              { icon: <Globe size={28} color="#00203D"/>, title: 'Хаанаас ч шалгах', desc: 'QR код эсвэл хэш ашиглан интернэттэй газар бүрт шалгах боломжтой.' },
              { icon: <Zap size={28} color="#00203D"/>, title: 'Хурдан бүртгэл', desc: 'Polygon Amoy testnet дээр ердөө хэдхэн секундэд батламж бүртгэгдэнэ.' },
            ].map((f, i) => (
              <div key={i} className="feature-card" style={styles.featureCard}>
                <div style={styles.featureIconBox}>{f.icon}</div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VERIFY */}
      <section ref={verifyRef} style={styles.verifySection}>
        <div style={styles.verifyInner}>
          <h2 style={styles.sectionTitle}>Батламж баталгаажуулах</h2>
          <p style={styles.sectionSubtitle}>Та бүртгэл үүсгэлгүйгээр батламжийг шалгах боломжтой</p>

          <div style={styles.verifyCard}>
            <div style={styles.tabs}>
              <button className="tab-btn" style={{ ...styles.tab, ...(activeTab === 'hash' ? styles.tabActive : {}) }} onClick={() => setActiveTab('hash')}>
                <Search size={14} /> Хэш оруулах
              </button>
              <button className="tab-btn" style={{ ...styles.tab, ...(activeTab === 'file' ? styles.tabActive : {}) }} onClick={() => { setActiveTab('file'); setTimeout(() => fileInputRef.current?.click(), 50); }}>
                <Upload size={14} /> Файл оруулах
              </button>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*,application/pdf,.pdf" style={{ display: 'none' }} onChange={handleFileUpload} />

            <form onSubmit={handleSubmit}>
              <div style={styles.inputRow}>
                <div style={styles.inputWrapper}>
                  <Search size={15} color="#718096" style={styles.inputIcon} />
                  <input
                    style={styles.input}
                    placeholder="Хэш утгыг оруулна уу..."
                    value={hash}
                    onChange={(e) => setHash(e.target.value)}
                    spellCheck={false}
                  />
                  {hash && (
                    <button type="button" style={styles.clearBtn} onClick={() => { setHash(''); setResult(null); setError(''); }}>
                      <X size={13} />
                    </button>
                  )}
                </div>
                <button type="submit" style={styles.verifyBtn} disabled={loading}>
                  {loading ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : 'Шалгах'}
                </button>
              </div>
            </form>

            {activeTab === 'file' && (
              <div className="upload-zone" style={styles.uploadZone} onClick={() => fileInputRef.current?.click()}>
                <Upload size={28} color="#C3D6EA" style={{ marginBottom: 8 }} />
                <p style={{ color: '#00203D', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>Батламжийн файл оруулах</p>
                <p style={{ color: '#718096', fontSize: 12 }}>QR кодыг автоматаар уншиж хэш гаргана</p>
                <p style={{ color: '#C3D6EA', fontSize: 11, marginTop: 6 }}>PNG · JPG · PDF дэмжигдэнэ</p>
              </div>
            )}

            {error && (
              <div style={styles.errorBox}>
                <XCircle size={16} color="#c62828" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div style={result.isValid ? styles.resultValid : styles.resultInvalid}>
                <div style={styles.resultHeader}>
                  {result.isValid ? <CheckCircle size={26} color="#2e7d32" /> : <XCircle size={26} color="#c62828" />}
                  <div>
                    <div style={styles.resultTitle}>
                      {result.isValid ? 'Батламж хүчинтэй байна ✓' : 'Батламж олдсонгүй'}
                    </div>
                    {result.blockchainVerified && (
                      <div style={styles.blockchainBadge}>⛓ Блокчейнд баталгаажсан</div>
                    )}
                  </div>
                </div>
                {result.isValid && result.certificate && (
                  <div style={styles.certInfo}>
                    <InfoRow label="Хэрэглэгч"     value={result.certificate.user_name} />
                    <InfoRow label="Үйл ажиллагаа" value={result.certificate.activity_title} />
                    <InfoRow label="Цаг"           value={`${result.certificate.hours} цаг`} />
                    <InfoRow label="Огноо"         value={new Date(result.certificate.issued_at).toLocaleDateString('mn-MN')} />
                    <InfoRow label="SHA-256" value={
                      <span style={{ fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all', color: '#4A5568' }}>
                        {result.certificate.hash}
                      </span>
                    } />
                    {result.certificate.tx_hash && (
                      <InfoRow label="Polygon TX" value={
                        <a href={`https://amoy.polygonscan.com/tx/${result.certificate.tx_hash}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#00203D', fontWeight: 600 }}>
                          {result.certificate.tx_hash.slice(0, 20)}... →
                        </a>
                      } />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <p style={{ color: 'rgba(195,214,234,0.4)', fontSize: 12 }}>
            © 2026 · ШУТИС · Х. Өнөгэрэл · Дипломын ажил
          </p>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: '#F4F6FF', display: 'flex', flexDirection: 'column' },
  nav: { background: '#00203D', position: 'sticky', top: 0, zIndex: 100, padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 16px rgba(0,0,0,0.3)' },
  navLogo: { display: 'flex', alignItems: 'center', gap: 10 },
  navLogoText: { fontSize: 16, fontWeight: 600, color: '#fff' },
  navActions: { display: 'flex', gap: 10 },
  navLogin: { padding: '8px 20px', border: '1px solid rgba(195,214,234,0.3)', borderRadius: 6, color: '#C3D6EA', fontSize: 13, fontWeight: 500, textDecoration: 'none' },
  navRegister: { padding: '8px 20px', background: '#C3D6EA', borderRadius: 6, color: '#00203D', fontSize: 13, fontWeight: 600, textDecoration: 'none' },
  hero: { position: 'relative', minHeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroBgImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.5 },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,32,61,0.85) 0%, rgba(0,32,61,0.75) 60%, rgba(0,32,61,0.9) 100%)' },
  heroContent: { position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 720, padding: '80px 48px' },
  heroBadge: { display: 'inline-block', background: 'rgba(195,214,234,0.12)', border: '1px solid rgba(195,214,234,0.25)', color: 'rgba(195,214,234,0.9)', fontSize: 12, fontWeight: 600, padding: '5px 16px', borderRadius: 20, marginBottom: 24, letterSpacing: '0.5px' },
  heroTitle: { fontSize: 48, fontWeight: 600, color: '#fff', lineHeight: 1.2, marginBottom: 20 },
  heroSubtitle: { fontSize: 16, color: 'rgba(195,214,234,0.8)', lineHeight: 1.8, marginBottom: 40 },
  heroCta: { padding: '14px 32px', background: '#C3D6EA', color: '#00203D', borderRadius: 6, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background 0.15s' },
  heroSecondary: { padding: '14px 32px', border: '1px solid rgba(195,214,234,0.4)', color: '#C3D6EA', borderRadius: 6, fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', transition: 'background 0.15s' },
  statsSection: { background: '#fff', borderBottom: '1px solid #E0E0E0' },
  statsInner: { maxWidth: 900, margin: '0 auto', padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statBox: { flex: 1, textAlign: 'center', padding: '0 24px' },
  statNum: { fontSize: 28, fontWeight: 700, color: '#00203D', marginBottom: 4 },
  statLbl: { fontSize: 12, color: '#718096' },
  statDivider: { width: 1, height: 48, background: '#E0E0E0' },
  featuresSection: { background: '#F4F6FF', padding: '80px 48px' },
  featuresInner: { maxWidth: 960, margin: '0 auto' },
  sectionTitle: { fontSize: 28, fontWeight: 700, color: '#00203D', marginBottom: 10, textAlign: 'center' },
  sectionSubtitle: { fontSize: 14, color: '#718096', textAlign: 'center', marginBottom: 48 },
  featuresGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 20 },
  featureCard: { background: '#fff', border: '1px solid #E0E0E0', borderRadius: 10, padding: '28px 20px', borderTop: '3px solid #00203D' },
  featureIconBox: { marginBottom: 16 },
  featureTitle: { fontSize: 15, fontWeight: 700, color: '#00203D', marginBottom: 10 },
  featureDesc: { fontSize: 13, color: '#718096', lineHeight: 1.7 },
  verifySection: { background: '#fff', padding: '80px 48px' },
  verifyInner: { maxWidth: 680, margin: '0 auto' },
  verifyCard: { background: '#F4F6FF', border: '1px solid #E0E0E0', borderRadius: 12, padding: 32, boxShadow: '0 4px 20px rgba(0,32,61,0.06)' },
  tabs: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13, fontWeight: 500, color: '#718096', background: '#fff', cursor: 'pointer', transition: 'all 0.15s' },
  tabActive: { background: '#00203D', color: '#fff', borderColor: '#00203D' },
  inputRow: { display: 'flex', gap: 8, marginBottom: 0 },
  inputWrapper: { position: 'relative', flex: 1 },
  inputIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  input: { width: '100%', padding: '12px 36px 12px 34px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13, color: '#00203D', boxSizing: 'border-box', outline: 'none', fontFamily: 'monospace', background: '#fff' },
  clearBtn: { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#718096', display: 'flex', alignItems: 'center' },
  verifyBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 24px', background: '#00203D', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' },
  uploadZone: { border: '2px dashed #E0E0E0', borderRadius: 8, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', marginTop: 16, background: '#fff', transition: 'border-color 0.15s' },
  errorBox: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'rgba(235,76,76,0.08)', border: '1px solid rgba(235,76,76,0.2)', borderRadius: 6, color: '#c62828', fontSize: 13, marginTop: 16 },
  resultValid: { marginTop: 20, padding: 20, background: 'rgba(160,213,133,0.1)', border: '1px solid rgba(160,213,133,0.4)', borderRadius: 8 },
  resultInvalid: { marginTop: 20, padding: 20, background: 'rgba(235,76,76,0.08)', border: '1px solid rgba(235,76,76,0.2)', borderRadius: 8 },
  resultHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  resultTitle: { fontSize: 15, fontWeight: 700, color: '#00203D' },
  blockchainBadge: { fontSize: 11, fontWeight: 600, color: '#2e7d32', background: 'rgba(160,213,133,0.3)', padding: '2px 8px', borderRadius: 4, marginTop: 4, display: 'inline-block' },
  certInfo: { background: '#fff', borderRadius: 6, padding: '4px 16px' },
  footer: { background: '#00203D', padding: '24px 48px' },
  footerInner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  footerLogo: { display: 'flex', alignItems: 'center', gap: 8 },
};

export default LandingPage;