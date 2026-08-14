import React, { useState, useEffect } from 'react';
import { useDbUser } from '../../context/UserContext';
import { useAuth } from '@clerk/clerk-react';
import { Search, ShieldAlert, Edit, CheckCircle, Ban, Hourglass, UserPlus } from 'lucide-react';

const UserDirectory = () => {
  const { dbUser } = useDbUser();
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (roleFilter) queryParams.append('role', roleFilter);
      if (statusFilter) queryParams.append('status', statusFilter);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setUsers(result.data);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to fetch directory' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error loading directory list' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const handleStatusChange = async (clerkUserId, newStatus) => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${clerkUserId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: result.message });
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update status' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error updating user status' });
    }
  };

  const handleRoleChange = async (clerkUserId, newRole) => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${clerkUserId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: result.message });
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update role' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error updating user role' });
    }
  };

  if (!dbUser) return null;
  const isAdmin = dbUser.role === 'admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div className="glass-card">
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>User Directory</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {isAdmin ? 'Review pending volunteer accounts, authorize staff coordinates, and manage profiles.' : 'View volunteer team rosters and contacts.'}
        </p>
      </div>

      {/* Message Banner */}
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

      {/* Filters & Search Toolbar */}
      <div className="glass-card" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '8px 16px', borderRadius: '8px', flexGrow: 1 }}>
          <Search size={18} style={{ color: 'var(--color-text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search volunteers by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' }}
          />
        </div>

        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--glass-border)',
            padding: '10px 16px',
            borderRadius: '8px',
            color: '#fff',
            outline: 'none',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="" style={{ background: '#0b0f19' }}>All Roles</option>
          <option value="volunteer" style={{ background: '#0b0f19' }}>Volunteers</option>
          <option value="coordinator" style={{ background: '#0b0f19' }}>Coordinators</option>
          <option value="admin" style={{ background: '#0b0f19' }}>Admins</option>
        </select>

        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--glass-border)',
            padding: '10px 16px',
            borderRadius: '8px',
            color: '#fff',
            outline: 'none',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="" style={{ background: '#0b0f19' }}>All Statuses</option>
          <option value="pending" style={{ background: '#0b0f19' }}>Pending Approval</option>
          <option value="active" style={{ background: '#0b0f19' }}>Active</option>
          <option value="blocked" style={{ background: '#0b0f19' }}>Blocked</option>
          <option value="rejected" style={{ background: '#0b0f19' }}>Rejected</option>
        </select>
      </div>

      {/* Users List Card */}
      <div className="glass-card" style={{ padding: '0px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading directory...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No registered users match these filters.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>User</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Role</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Status</th>
                {isAdmin && <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600', textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'var(--transition-smooth)' }} className="table-row">
                  {/* User Profile */}
                  <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                        {user.firstName?.[0]}
                      </div>
                    )}
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{user.firstName} {user.lastName}</h4>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{user.email}</span>
                    </div>
                  </td>

                  {/* Role */}
                  <td style={{ padding: '16px 24px' }}>
                    {isAdmin ? (
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.clerkUserId, e.target.value)}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--glass-border)',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          color: '#fff',
                          outline: 'none',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="volunteer" style={{ background: '#0b0f19' }}>Volunteer</option>
                        <option value="coordinator" style={{ background: '#0b0f19' }}>Coordinator</option>
                        <option value="admin" style={{ background: '#0b0f19' }}>Admin</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>{user.role}</span>
                    )}
                  </td>

                  {/* Status Tag */}
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      border: '1px solid transparent',
                      background: 
                        user.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 
                        user.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 
                        'rgba(239, 68, 68, 0.1)',
                      color: 
                        user.status === 'active' ? 'var(--color-accent-emerald)' : 
                        user.status === 'pending' ? 'var(--color-accent-amber)' : 
                        'var(--color-accent-rose)',
                      borderColor: 
                        user.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 
                        user.status === 'pending' ? 'rgba(245, 158, 11, 0.15)' : 
                        'rgba(239, 68, 68, 0.15)'
                    }}>
                      {user.status === 'active' && <CheckCircle size={10} />}
                      {user.status === 'pending' && <Hourglass size={10} />}
                      {user.status === 'blocked' && <Ban size={10} />}
                      {user.status}
                    </span>
                  </td>

                  {/* Admin Actions */}
                  {isAdmin && (
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {user.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(user.clerkUserId, 'active')}
                              className="btn btn-primary" 
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleStatusChange(user.clerkUserId, 'rejected')}
                              className="btn btn-secondary" 
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {user.status === 'active' && (
                          <button 
                            onClick={() => handleStatusChange(user.clerkUserId, 'blocked')}
                            className="btn btn-secondary" 
                            style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--color-accent-rose)' }}
                          >
                            Block
                          </button>
                        )}
                        {user.status === 'blocked' && (
                          <button 
                            onClick={() => handleStatusChange(user.clerkUserId, 'active')}
                            className="btn btn-primary" 
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                          >
                            Unblock
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <style>{`
        .table-row:hover {
          background: rgba(255,255,255,0.015) !important;
        }
      `}</style>
    </div>
  );
};

export default UserDirectory;
