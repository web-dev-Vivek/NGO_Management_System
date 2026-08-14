import React, { useState, useEffect } from 'react';
import { useDbUser } from '../../context/UserContext';
import { UserCircle, Check, Loader, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { dbUser, updateProfile } = useDbUser();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    skills: '',
    availability: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (dbUser) {
      setFormData({
        firstName: dbUser.firstName || '',
        lastName: dbUser.lastName || '',
        phone: dbUser.phone || '',
        bio: dbUser.bio || '',
        skills: dbUser.skills ? dbUser.skills.join(', ') : '',
        availability: dbUser.availability ? dbUser.availability.join(', ') : ''
      });
    }
  }, [dbUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    // Format skills and availability back into arrays
    const formattedData = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      availability: formData.availability.split(',').map(a => a.trim()).filter(Boolean)
    };

    const result = await updateProfile(formattedData);
    setSaving(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
    }
  };

  if (!dbUser) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div className="glass-card">
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>User Profile Settings</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Manage your personal details, emergency contacts, skills, and volunteering schedule.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }} className="profile-grid">
        {/* Profile Card Summary */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
          {dbUser.profileImage ? (
            <img src={dbUser.profileImage} alt="User Avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', border: '3px solid var(--color-accent-blue)', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold' }}>
              {dbUser.firstName?.[0]}
            </div>
          )}
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{dbUser.firstName} {dbUser.lastName}</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '2px' }}>{dbUser.email}</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
            <span style={{ 
              background: 'rgba(59, 130, 246, 0.1)', 
              color: 'var(--color-accent-blue)', 
              padding: '4px 12px', 
              borderRadius: '16px', 
              fontSize: '11px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              border: '1px solid rgba(59, 130, 246, 0.15)'
            }}>
              {dbUser.role}
            </span>
            <span style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              color: 'var(--color-accent-emerald)', 
              padding: '4px 12px', 
              borderRadius: '16px', 
              fontSize: '11px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              border: '1px solid rgba(16, 185, 129, 0.15)'
            }}>
              {dbUser.status}
            </span>
          </div>
        </div>

        {/* Profile Editing Form */}
        <div className="glass-card">
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Edit Details</h3>
          
          {message.text && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '20px',
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: message.type === 'success' ? 'var(--color-accent-emerald)' : 'var(--color-accent-rose)',
              border: message.type === 'success' ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(239, 68, 68, 0.15)'
            }}>
              {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="form-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>First Name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Last Name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Bio</label>
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange}
                rows="3"
                placeholder="Tell us about yourself..."
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Skills (comma separated)</label>
              <input 
                type="text" 
                name="skills" 
                value={formData.skills} 
                onChange={handleChange}
                placeholder="Teaching, Event Management, First Aid..."
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Availability (comma separated)</label>
              <input 
                type="text" 
                name="availability" 
                value={formData.availability} 
                onChange={handleChange}
                placeholder="Weekends, Mon-Wed Evenings, On Call..."
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', marginTop: '10px' }} disabled={saving}>
              {saving ? (
                <>
                  <Loader size={16} className="animate-spin" /> Saving Changes
                </>
              ) : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr !important;
          }
          .form-row {
            grid-template-columns: 1fr !important;
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Profile;
