import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { certificateApi } from '../../api';

const CertificatesPage = () => {
  const [selectedCert, setSelectedCert] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificateApi.getMyCertificates(),
  });

  const certificates = data?.data?.data || [];

  const handleDownload = async (cert) => {
    try {
      const res = await certificateApi.getById(cert.id);
      const { ipfs_cid, hash } = res.data.data;
      if (ipfs_cid) {
        window.open(`https://gateway.pinata.cloud/ipfs/${ipfs_cid}`, '_blank');
      } else {
        alert(`IPFS CID одоохондоо байхгүй.\nХэш: ${hash}`);
      }
    } catch {
      alert('Татаж авахад алдаа гарлаа.');
    }
  };

  if (isLoading) return <p>Ачааллаж байна...</p>;
  if (isError)   return <div className="alert alert-error">Батламж авахад алдаа гарлаа.</div>;

  return (
    <div>
      <div className="flex-between mb-16">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Батламж</h1>
          <p>Нийт {certificates.length} батламж</p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="empty-state">
          <p>Одоогоор батламж байхгүй байна.</p>
          <small>Үйл ажиллагаанд оролцож баталгаажуулагдсаны дараа батламж авна.</small>
        </div>
      ) : (
        <div className="card-grid">
          {certificates.map((cert) => (
            <div key={cert.id} className="card">
              <div className="flex-between" style={{ marginBottom: 12 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: '#00203D',
                  background: '#C3D6EA', padding: '2px 8px',
                  borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.4px',
                }}>
                  Батламж
                </span>
                <span className="badge badge-verified">✓ Баталгаажсан</span>
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#00203D', marginBottom: 12 }}>
                {cert.activity_title}
              </h3>

              <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: 12, marginBottom: 12 }}>
                <InfoRow label="Олгосон огноо">
                  {new Date(cert.issued_at).toLocaleDateString('mn-MN')}
                </InfoRow>
                <InfoRow label="Ажилласан цаг">{cert.hours} цаг</InfoRow>
                <InfoRow label="SHA-256 хэш">
                  <span className="font-mono">{cert.hash?.slice(0, 18)}...</span>
                </InfoRow>
                {cert.tx_hash && (
                  <InfoRow label="Блокчейн">
                    <a
                      href={`https://mumbai.polygonscan.com/tx/${cert.tx_hash}`}
                      target="_blank" rel="noreferrer"
                      style={{ color: '#00203D', fontSize: 12, fontWeight: 600 }}
                    >
                      PolygonScan →
                    </a>
                  </InfoRow>
                )}
              </div>

              <div className="flex gap-8">
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}
                  onClick={() => setSelectedCert(cert)}>
                  Дэлгэрэнгүй
                </button>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                  onClick={() => handleDownload(cert)}>
                  ⬇ Татах
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCert && (
        <div className="modal-overlay" onClick={() => setSelectedCert(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Батламжийн дэлгэрэнгүй</h2>
            <hr />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <tbody>
                <ModalRow label="Үйл ажиллагаа">{selectedCert.activity_title}</ModalRow>
                <ModalRow label="Олгосон огноо">
                  {new Date(selectedCert.issued_at).toLocaleString('mn-MN')}
                </ModalRow>
                <ModalRow label="Ажилласан цаг">{selectedCert.hours} цаг</ModalRow>
                <ModalRow label="SHA-256 хэш">
                  <span className="font-mono" style={{ wordBreak: 'break-all' }}>
                    {selectedCert.hash}
                  </span>
                </ModalRow>
                {selectedCert.tx_hash && (
                  <ModalRow label="TX хаяг">
                    <span className="font-mono" style={{ wordBreak: 'break-all' }}>
                      {selectedCert.tx_hash}
                    </span>
                  </ModalRow>
                )}
                {selectedCert.ipfs_cid && (
                  <ModalRow label="IPFS CID">
                    <span className="font-mono" style={{ wordBreak: 'break-all' }}>
                      {selectedCert.ipfs_cid}
                    </span>
                  </ModalRow>
                )}
              </tbody>
            </table>
            <div className="flex gap-8 mt-16" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedCert(null)}>
                Хаах
              </button>
              <button className="btn btn-primary" onClick={() => handleDownload(selectedCert)}>
                ⬇ Татаж авах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, children }) => (
  <div className="flex-between" style={{ marginBottom: 6 }}>
    <span className="text-muted text-sm">{label}</span>
    <span style={{ fontSize: 13 }}>{children}</span>
  </div>
);

const ModalRow = ({ label, children }) => (
  <tr>
    <td style={{ color: '#718096', padding: '8px 12px 8px 0',
                  whiteSpace: 'nowrap', verticalAlign: 'top',
                  width: 130, fontWeight: 500 }}>
      {label}
    </td>
    <td style={{ padding: '8px 0', verticalAlign: 'top' }}>{children}</td>
  </tr>
);

export default CertificatesPage;