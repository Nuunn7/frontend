import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { certificateApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Award, Download, Eye, X, Loader, Clock, Calendar, Hash, Link, ChevronLeft, ChevronRight } from 'lucide-react';
import { CERT_STYLES } from './CertificateDesigns';
import logoSrc from '../../assets/logo-must.png';

const BASE_URL = window.location.origin;

const CertificatesPage = () => {
  const { user } = useAuth();
  const [selectedCert, setSelectedCert] = useState(null);
  const [previewCert,  setPreviewCert]  = useState(null);
  const [styleIdx,     setStyleIdx]     = useState(0);
  const printRef = useRef(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificateApi.getMyCertificates(),
  });

  const certificates = data?.data?.data || [];
  const userName     = user?.name || 'Хэрэглэгч';

  const handlePrint = async () => {
    const el = printRef.current;
    if (!el) return;

    const logoImg = el.querySelector('img[alt="ШУТИС"]');
    if (logoImg && logoImg.src && !logoImg.src.startsWith('data:')) {
      await new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);
          const base64 = canvas.toDataURL('image/png');
          // Replace all logo imgs in innerHTML
          el.querySelectorAll('img[alt="ШУТИС"]').forEach(i => i.src = base64);
          resolve();
        };
        img.onerror = resolve;
        img.src = logoImg.src;
      });
    }

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#e8edf5;padding:32px;}
      @media print{body{background:#fff;padding:0;}@page{size:A4 landscape;margin:0;}}
    </style></head><body>${el.innerHTML}
    <script>window.onload=function(){window.print();setTimeout(()=>window.close(),1000);};<\/script>
    </body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 32, color: '#718096', fontSize: 14 }}>
      <Loader size={18} color="#718096" /> Ачааллаж байна...
    </div>
  );

  if (isError) return <div className="alert alert-error">Батламж авахад алдаа гарлаа.</div>;

  const ActiveCert = previewCert ? CERT_STYLES[styleIdx].component : null;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Батламж</h1>
          <p style={styles.subtitle}>Нийт {certificates.length} батламж</p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div style={styles.empty}>
          <Award size={40} color="#C3D6EA" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: '#00203D', marginBottom: 4 }}>Одоогоор батламж байхгүй байна</p>
          <small style={{ color: '#718096' }}>Үйл ажиллагаанд оролцож баталгаажуулагдсаны дараа батламж авна.</small>
        </div>
      ) : (
        <div style={styles.list}>
          {certificates.map((cert) => (
            <div key={cert.id} style={styles.row}>
              <div style={styles.rowLeft}>
                <div style={styles.rowIcon}><Award size={18} color="#00203D" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={styles.rowTitle}>{cert.activity_title}</div>
                  <div style={styles.rowMeta}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{cert.hours} цаг</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Calendar size={11} />{new Date(cert.issued_at).toLocaleDateString('mn-MN')}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Hash size={11} />{cert.hash?.slice(0, 12)}...</span>
                  </div>
                </div>
              </div>
              <div style={styles.rowRight}>
                <span style={styles.verifiedBadge}>✓ Баталгаажсан</span>
                <button style={styles.btnSecondary} onClick={() => setSelectedCert(cert)}>
                  <Eye size={13} /> Дэлгэрэнгүй
                </button>
                <button style={styles.btnPrimary} onClick={() => { setPreviewCert(cert); setStyleIdx(0); }}>
                  <Download size={13} /> PDF татах
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewCert && ActiveCert && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 900, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>Загвар:</span>
              <button style={styles.navBtn} onClick={() => setStyleIdx(i => (i - 1 + CERT_STYLES.length) % CERT_STYLES.length)}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: 13, color: '#C3D6EA', minWidth: 100, textAlign: 'center' }}>
                {styleIdx + 1} / {CERT_STYLES.length} · {CERT_STYLES[styleIdx].name}
              </span>
              <button style={styles.navBtn} onClick={() => setStyleIdx(i => (i + 1) % CERT_STYLES.length)}>
                <ChevronRight size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={styles.printBtn} onClick={handlePrint}>
                <Download size={14} /> Хэвлэх / PDF татах
              </button>
              <button style={styles.closeBtn} onClick={() => setPreviewCert(null)}>
                <X size={16} />
              </button>
            </div>
          </div>

          <div style={{ background: '#e8edf5', borderRadius: 12, padding: 32, overflow: 'auto', maxWidth: '95vw' }} ref={printRef}>
            <ActiveCert cert={previewCert} name={userName} />
          </div>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 14 }}>
            Хэвлэх → Хэвлэгч: "Microsoft Print to PDF" → Хадгалах
          </p>
        </div>
      )}

      {selectedCert && (
        <div className="modal-overlay" onClick={() => setSelectedCert(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#00203D' }}>Батламжийн дэлгэрэнгүй</h2>
              <button onClick={() => setSelectedCert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096' }}><X size={18} /></button>
            </div>
            <hr />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16, marginBottom: 12 }}>
              <div style={{ ...styles.detailBox, gridColumn: '1/-1' }}>
                <div style={styles.detailLabel}>Үйл ажиллагаа</div>
                <div style={styles.detailValue}>{selectedCert.activity_title}</div>
              </div>
              <div style={styles.detailBox}>
                <div style={styles.detailLabel}>Олгосон огноо</div>
                <div style={styles.detailValue}>{new Date(selectedCert.issued_at).toLocaleString('mn-MN')}</div>
              </div>
              <div style={styles.detailBox}>
                <div style={styles.detailLabel}>Ажилласан цаг</div>
                <div style={styles.detailValue}>{selectedCert.hours} цаг</div>
              </div>
              <div style={{ ...styles.detailBox, gridColumn: '1/-1' }}>
                <div style={styles.detailLabel}>SHA-256 Хэш</div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#4A5568', wordBreak: 'break-all', marginTop: 4 }}>{selectedCert.hash}</div>
              </div>
              <div style={{ ...styles.detailBox, gridColumn: '1/-1' }}>
                <div style={styles.detailLabel}>Баталгаажуулах холбоос</div>
                <a href={`${BASE_URL}/?hash=${selectedCert.hash}`} target="_blank" rel="noreferrer"
                  style={{ fontSize: 12, color: '#185FA5', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Link size={12} />{BASE_URL}/?hash={selectedCert.hash?.slice(0, 24)}...
                </a>
              </div>
              {selectedCert.tx_hash && (
                <div style={{ ...styles.detailBox, gridColumn: '1/-1' }}>
                  <div style={styles.detailLabel}>Blockchain TX</div>
                  <a href={`https://amoy.polygonscan.com/tx/${selectedCert.tx_hash}`} target="_blank" rel="noreferrer"
                    style={{ fontFamily: 'monospace', fontSize: 11, color: '#185FA5', wordBreak: 'break-all', display: 'block', marginTop: 4 }}>
                    {selectedCert.tx_hash}
                  </a>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button style={styles.btnSecondary} onClick={() => setSelectedCert(null)}>Хаах</button>
              <button style={styles.btnPrimary} onClick={() => { setPreviewCert(selectedCert); setStyleIdx(0); setSelectedCert(null); }}>
                <Download size={13} /> PDF татах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: '#00203D', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#718096' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  row: { background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, boxShadow: '0 1px 3px rgba(0,32,61,0.05)' },
  rowLeft: { display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  rowIcon: { width: 36, height: 36, borderRadius: 8, background: '#F4F6FF', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowTitle: { fontSize: 14, fontWeight: 600, color: '#00203D', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  rowMeta: { display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: '#718096' },
  rowRight: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  verifiedBadge: { fontSize: 11, fontWeight: 600, color: '#166534', background: 'rgba(220,252,231,0.7)', padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' },
  btnSecondary: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#F4F6FF', color: '#00203D', border: '1px solid #E0E0E0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#00203D', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' },
  navBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, cursor: 'pointer', color: '#fff' },
  printBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: '#00203D', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  closeBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, cursor: 'pointer', color: '#fff' },
  empty: { textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8 },
  detailBox: { background: '#F4F6FF', borderRadius: 6, padding: '10px 14px' },
  detailLabel: { fontSize: 11, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: 600, color: '#00203D' },
};

export default CertificatesPage;