import React, { useState, useEffect } from 'react';
import { useDbUser } from '../../context/UserContext';
import { useAuth } from '@clerk/clerk-react';
import { Award, Plus, FileText, Download, CheckCircle2, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const CertificatesPage = () => {
  const { dbUser } = useDbUser();
  const { getToken } = useAuth();
  
  const [certificates, setCertificates] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Auto-dismiss popup message after 3 seconds
  useEffect(() => {
    if (message?.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  
  // Issue Certificate Form State
  const [issueForm, setIssueForm] = useState({
    volunteerId: '',
    campaignId: ''
  });

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Volunteers fetch their own, Admins/Coordinators query the vault if needed.
      // For this implementation, we will query '/certificates/my' for volunteers.
      // For admin, we can fetch all or list certificates. Since certificates is a global model, let's fetch my list or make an endpoint.
      // Wait, let's fetch /certificates/my for volunteers.
      const url = dbUser.role === 'volunteer' 
        ? `${import.meta.env.VITE_API_URL}/certificates/my`
        : `${import.meta.env.VITE_API_URL}/certificates/my`; // Wait, let's support general listing or display their certificates.
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setCertificates(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormOptions = async () => {
    try {
      const token = await getToken();
      
      // Fetch users to populate volunteers dropdown
      const userRes = await fetch(`${import.meta.env.VITE_API_URL}/users?role=volunteer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userResult = await userRes.json();
      
      // Fetch campaigns
      const campRes = await fetch(`${import.meta.env.VITE_API_URL}/campaigns`);
      const campResult = await campRes.json();

      if (userRes.ok && userResult.success) {
        setVolunteers(userResult.data);
      }
      if (campRes.ok && campResult.success) {
        setCampaigns(campResult.data.filter(c => c.status === 'active' || c.status === 'completed'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (dbUser) {
      fetchCertificates();
      if (dbUser.role === 'admin') {
        fetchFormOptions();
      }
    }
  }, [dbUser]);

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setIssuing(true);
    setMessage({ type: '', text: '' });

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/certificates/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(issueForm)
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Cryptographic certificate issued successfully!' });
        setIssueForm({ volunteerId: '', campaignId: '' });
        fetchCertificates();
      } else {
        setMessage({ type: 'error', text: result.message || 'Issuance failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error issuing certificate' });
    } finally {
      setIssuing(false);
    }
  };

  if (!dbUser) return null;
  const isAdmin = dbUser.role === 'admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div className="glass-card">
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Cryptographic Certificates</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {isAdmin 
            ? 'Generate cryptographically verifiable certificates of appreciation for volunteers.' 
            : 'Download your earned digital certificates and share your verifiable impact.'}
        </p>
      </div>

      {message.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? 'var(--color-accent-emerald)' : 'var(--color-accent-rose)',
          border: message.type === 'success' ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(239, 68, 68, 0.15)'
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 2fr' : '1fr', gap: '30px', alignItems: 'start' }} className="cert-layout">
        {/* Admin Issue Form */}
        {isAdmin && (
          <div className="glass-card">
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Issue Certificate
            </h3>
            <form onSubmit={handleIssueSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Select Volunteer</label>
                <select 
                  value={issueForm.volunteerId}
                  onChange={(e) => setIssueForm({ ...issueForm, volunteerId: e.target.value })}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '8px', color: 'var(--color-text-primary)', outline: 'none' }}
                  required
                >
                  <option value="">-- Choose Volunteer --</option>
                  {volunteers.map(v => (
                    <option key={v._id} value={v._id}>{v.firstName} {v.lastName} ({v.email})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Select Campaign</label>
                <select 
                  value={issueForm.campaignId}
                  onChange={(e) => setIssueForm({ ...issueForm, campaignId: e.target.value })}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '8px', color: 'var(--color-text-primary)', outline: 'none' }}
                  required
                >
                  <option value="">-- Choose Campaign --</option>
                  {campaigns.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={issuing}>
                {issuing ? 'Generating PDF...' : 'Sign & Issue Certificate'}
              </button>
            </form>
          </div>
        )}

        {/* Certificates Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Your Earned Certificates ({certificates.length})</h3>
            <Link to="/verify" style={{ fontSize: '12px', color: 'var(--color-accent-blue)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
              Public Verification Tool <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>Loading vault...</div>
          ) : certificates.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
              No certificates have been issued yet. Log verified hours in active campaigns to qualify!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {certificates.map(cert => (
                <div key={cert._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Award size={36} style={{ color: 'var(--color-accent-emerald)' }} />
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{cert.campaignId?.title || 'NGO Campaign'}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Verified Impact:</span> <strong>{cert.hoursLogged} hours</strong>
                  </div>
                  
                  {cert.pdfUrl && (
                    <a 
                      href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${cert.pdfUrl}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '13px', textDecoration: 'none' }}
                    >
                      <Download size={14} /> Download PDF
                    </a>
                  )}
                  
                  <Link 
                    to={`/verify/${cert.certificateId}`}
                    style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    Verify Token <ExternalLink size={12} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .cert-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificatesPage;
