import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../api';
import api from '../../api/client';
import { Search, CheckCircle, XCircle, Loader, Camera, X } from 'lucide-react';

const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const [hash, setHash] = useState(searchParams.get('hash') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const hashParam = searchParams.get('hash');
    if (hashParam) {
      setHash(hashParam);
      handleVerify(hashParam);
    }
  }, []);

  useEffect(() => {
    if (showScanner) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showScanner]);

  const startCamera = async () => {
    setScanError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      startQRScan();
    } catch (err) {
      setScanError('Камер нээхэд алдаа гарлаа. Зөвшөөрөл өгнө үү.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scannerRef.current) {
      clearInterval(scannerRef.current);
      scannerRef.current = null;
    }
  };

  const startQRScan = () => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
    script.onload = () => {
      scannerRef.current = setInterval(() => {
        if (!videoRef.current || !window.jsQR) return;
        const video = videoRef.current;
        if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          const scanned = code.data;
          clearInterval(scannerRef.current);
          stopCamera();
          setShowScanner(false);
          const extractedHash = scanned.includes('/verify?hash=')
            ? scanned.split('/verify?hash=')[1]
            : scanned;
          setHash(extractedHash);
          handleVerify(extractedHash);
        }
      }, 300);
    };
    document.head.appendChild(script);
  };

  const handleVerify = async (hashToVerify) => {
    const h = (hashToVerify || hash).trim();
    if (!h) { setError('Хэш утга оруулна уу.'); return; }
    if (h.length !== 64) { setError('Хэш утга 64 тэмдэгт байх ёстой.'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.get(`/certificates/verify/${h}`);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Батламж олдсонгүй.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify(hash);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Батламж баталгаажуулах</h1>
          <p style={styles.subtitle}>
            Сайн дурын үйл ажиллагааны батламжийг хэш эсвэл QR кодоор баталгаажуулна уу
          </p>
        </div>

        <div style={styles.card}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputRow}>
              <div style={styles.inputWrapper}>
                <Search size={16} color="#718096" style={styles.inputIcon} />
                <input
                  style={styles.input}
                  placeholder="SHA-256 хэш (64 тэмдэгт)..."
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  spellCheck={false}
                />
                {hash && (
                  <button type="button" style={styles.clearBtn} onClick={() => { setHash(''); setResult(null); setError(''); }}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <button type="submit" style={styles.verifyBtn} disabled={loading}>
                {loading ? <Loader size={16} /> : 'Баталгаажуулах'}
              </button>
              <button
                type="button"
                style={{ ...styles.scanBtn, background: showScanner ? '#EB4C4C' : '#00203D' }}
                onClick={() => setShowScanner(!showScanner)}
              >
                {showScanner ? <X size={16} /> : <Camera size={16} />}
                {showScanner ? 'Хаах' : 'QR'}
              </button>
            </div>
          </form>

          {showScanner && (
            <div style={styles.scannerBox}>
              {scanError ? (
                <div style={styles.scanError}>{scanError}</div>
              ) : (
                <>
                  <video ref={videoRef} style={styles.video} muted playsInline />
                  <div style={styles.scanOverlay}>
                    <div style={styles.scanFrame} />
                  </div>
                  <p style={styles.scanHint}>QR кодыг камерт тавина уу</p>
                </>
              )}
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              <XCircle size={20} color="#c62828" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div style={result.isValid ? styles.resultValid : styles.resultInvalid}>
              <div style={styles.resultHeader}>
                {result.isValid
                  ? <CheckCircle size={28} color="#2e7d32" />
                  : <XCircle size={28} color="#c62828" />}
                <div>
                  <div style={styles.resultTitle}>
                    {result.isValid ? 'Батламж хүчинтэй байна' : 'Батламж олдсонгүй'}
                  </div>
                  {result.blockchainVerified && (
                    <div style={styles.blockchainBadge}>✓ Блокчейнд баталгаажсан</div>
                  )}
                </div>
              </div>

              {result.isValid && result.certificate && (
                <div style={styles.certInfo}>
                  <InfoRow label="Хэрэглэгч"       value={result.certificate.user_name} />
                  <InfoRow label="Үйл ажиллагаа"   value={result.certificate.activity_title} />
                  <InfoRow label="Ажилласан цаг"   value={`${result.certificate.hours} цаг`} />
                  <InfoRow label="Олгосон огноо"   value={new Date(result.certificate.issued_at).toLocaleDateString('mn-MN')} />
                  <InfoRow label="SHA-256 хэш" value={
                    <span style={styles.hash}>{result.certificate.hash}</span>
                  } />
                  {result.certificate.tx_hash && (
                    <InfoRow label="Polygon TX" value={
                      <a
                        href={`https://amoy.polygonscan.com/tx/${result.certificate.tx_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.txLink}
                      >
                        {result.certificate.tx_hash.slice(0, 20)}... →
                      </a>
                    } />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <p style={styles.loginHint}>
          Бүртгэлтэй хэрэглэгч үү? <Link to="/login" style={styles.link}>Нэвтрэх</Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scanMove {
          0%, 100% { top: 10%; }
          50% { top: 80%; }
        }
      `}</style>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #E0E0E0', gap: 16 }}>
    <span style={{ fontSize: 12, color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{label}</span>
    <span style={{ fontSize: 13, color: '#00203D', textAlign: 'right' }}>{value}</span>
  </div>
);

const styles = {
  page: { minHeight: '100vh', background: '#F4F6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  container: { width: '100%', maxWidth: 600 },
  header: { textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, color: '#00203D', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#718096' },
  card: { background: '#fff', border: '1px solid #E0E0E0', borderRadius: 10, padding: 28, boxShadow: '0 4px 16px rgba(0,32,61,0.08)' },
  form: { marginBottom: 16 },
  inputRow: { display: 'flex', gap: 8 },
  inputWrapper: { position: 'relative', flex: 1 },
  inputIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  input: { width: '100%', padding: '10px 36px 10px 34px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13, color: '#00203D', boxSizing: 'border-box', outline: 'none', fontFamily: 'monospace' },
  clearBtn: { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#718096', display: 'flex', alignItems: 'center' },
  verifyBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#00203D', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' },
  scanBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  scannerBox: { position: 'relative', marginBottom: 16, borderRadius: 8, overflow: 'hidden', background: '#000', aspectRatio: '4/3' },
  video: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  scanOverlay: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  scanFrame: { width: 200, height: 200, border: '2px solid #C3D6EA', borderRadius: 8, boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' },
  scanHint: { position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', color: '#fff', fontSize: 12 },
  scanError: { padding: 24, color: '#c62828', textAlign: 'center', fontSize: 13 },
  errorBox: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(235,76,76,0.08)', border: '1px solid rgba(235,76,76,0.2)', borderRadius: 6, color: '#c62828', fontSize: 13 },
  resultValid: { marginTop: 16, padding: 20, background: 'rgba(160,213,133,0.1)', border: '1px solid rgba(160,213,133,0.4)', borderRadius: 8 },
  resultInvalid: { marginTop: 16, padding: 20, background: 'rgba(235,76,76,0.08)', border: '1px solid rgba(235,76,76,0.2)', borderRadius: 8 },
  resultHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  resultTitle: { fontSize: 16, fontWeight: 700, color: '#00203D' },
  blockchainBadge: { fontSize: 11, fontWeight: 600, color: '#2e7d32', background: 'rgba(160,213,133,0.3)', padding: '2px 8px', borderRadius: 4, marginTop: 4, display: 'inline-block' },
  certInfo: { background: '#fff', borderRadius: 6, padding: '4px 16px' },
  hash: { fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all', color: '#4A5568' },
  txLink: { fontSize: 12, color: '#00203D', fontWeight: 600 },
  loginHint: { textAlign: 'center', marginTop: 16, fontSize: 13, color: '#718096' },
  link: { color: '#00203D', fontWeight: 600, textDecoration: 'none' },
};

export default VerifyPage;