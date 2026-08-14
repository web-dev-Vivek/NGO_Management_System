import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Award, Calendar, Clock, Download, ArrowLeft, Search, CheckCircle } from 'lucide-react';

const VerifyCertificate = () => {
  const { id } = useParams();
  const [tokenInput, setTokenInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkVerification = async (certId) => {
    if (!certId) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/certificates/${certId}`);
      const resultData = await response.json();
      
      if (response.ok && resultData.verified) {
        setResult(resultData.data);
      } else {
        setError(resultData.message || 'No matching cryptographic token found. Please verify the code.');
      }
    } catch (err) {
      setError('An error occurred during cryptographic lookup verification.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setTokenInput(id);
      checkVerification(id);
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      checkVerification(tokenInput.trim());
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'var(--color-bg-base)',
      color: 'var(--color-text-primary)',
      padding: '40px 20px',
      backgroundAttachment: 'fixed',
      backgroundContainer: 'var(--gradient-glow)'
    }}>
      {/* Brand Navbar */}
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto 40px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Home
        </Link>
        <h1 style={{ fontSize: '20px', fontWeight: '800', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Unity NGO
        </h1>
      </div>

      <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Verification Search Header */}
        <div className="glass-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ShieldCheck size={48} style={{ color: 'var(--color-accent-blue)', margin: '0 auto' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Public Verification Registry</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Verify the authenticity of digital completion certificates issued by Unity NGO. Input the unique token code below.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '8px 16px', borderRadius: '8px', flexGrow: 1 }}>
              <Search size={16} style={{ color: 'var(--color-text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Enter certificate UUID key..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' }}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }} disabled={loading}>
              Verify
            </button>
          </form>
        </div>

        {/* Verification results status */}
        {loading && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>Searching block keys...</div>
        )}

        {error && (
          <div className="glass-card" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center',
            borderColor: 'rgba(239, 68, 68, 0.2)',
            background: 'rgba(239, 68, 68, 0.05)'
          }}>
            <ShieldAlert size={36} style={{ color: 'var(--color-accent-rose)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Verification Failed</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>{error}</p>
          </div>
        )}

        {result && (
          <div className="glass-card" style={{ 
            borderColor: 'rgba(16, 185, 129, 0.25)', 
            background: 'rgba(16, 185, 129, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Authenticity verification header badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent-emerald)' }}>
              <CheckCircle size={18} />
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Verifiably Authentic Record</span>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Award size={48} style={{ color: 'var(--color-accent-emerald)' }} />
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Recipient Volunteer</span>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', marginTop: '2px' }}>
                  {result.volunteerId?.firstName} {result.volunteerId?.lastName}
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Campaign</span>
                <strong style={{ color: '#fff' }}>{result.campaignId?.title}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> Logged Impact</span>
                <strong style={{ color: 'var(--color-accent-emerald)' }}>{result.hoursLogged} Verified Hours</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Date Issued</span>
                <strong style={{ color: '#fff' }}>{new Date(result.issueDate).toLocaleDateString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Signatory Authority</span>
                <strong style={{ color: '#fff' }}>{result.signedBy?.firstName} {result.signedBy?.lastName} (Admin)</strong>
              </div>
            </div>

            {result.pdfUrl && (
              <a 
                href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${result.pdfUrl}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
                style={{ width: '100%', textDecoration: 'none' }}
              >
                <Download size={16} /> Download Signed PDF Copy
              </a>
            )}
            
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'center', fontFamily: 'Courier' }}>
              BLOCK RECORD KEY: {result.certificateId}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;
