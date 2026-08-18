import React, { useState, useEffect } from 'react';
import { useDbUser } from '../../context/UserContext';
import { useAuth } from '@clerk/clerk-react';
import { 
  Search, 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Check, 
  PlusCircle, 
  Tag, 
  Upload, 
  X, 
  Sparkles,
  Info,
  Hourglass 
} from 'lucide-react';

const CampaignExplorer = () => {
  const { dbUser } = useDbUser();
  const { getToken } = useAuth();
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);

  // Campaign Tasks States
  const [campaignTasks, setCampaignTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedVolunteer: '',
    dueDate: '',
    priority: 'medium'
  });

  // Coordinators list for Admin coordinator assignment
  const [coordinators, setCoordinators] = useState([]);
  
  // Create Campaign Form State
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    category: 'Other',
    bannerImage: '',
    startDate: '',
    endDate: '',
    locationAddress: '',
    targetVolunteers: 10,
    createdBy: ''
  });
  
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = ["Education", "Health", "Environment", "Disaster Relief", "Community Service", "Other"];

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (categoryFilter) queryParams.append('category', categoryFilter);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns?${queryParams.toString()}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        setCampaigns(result.data);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoordinators = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users?role=coordinator&status=active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setCoordinators(result.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    if (dbUser && dbUser.role === 'admin') {
      fetchCoordinators();
    }
  }, [search, categoryFilter, dbUser]);

  const fetchCampaignTasks = async (campaignId) => {
    try {
      setTasksLoading(true);
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks?campaignId=${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setCampaignTasks(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (showDetailModal && showDetailModal._id) {
      fetchCampaignTasks(showDetailModal._id);
      setShowAddTask(false);
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        assignedVolunteer: '',
        dueDate: '',
        priority: 'medium'
      });
    } else {
      setCampaignTasks([]);
    }
  }, [showDetailModal]);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.description || !taskForm.assignedVolunteer || !taskForm.dueDate) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const token = await getToken();
      const url = editingTask 
        ? `${import.meta.env.VITE_API_URL}/tasks/${editingTask._id}` 
        : `${import.meta.env.VITE_API_URL}/tasks`;
      const method = editingTask ? 'PUT' : 'POST';
      
      const payload = {
        title: taskForm.title,
        description: taskForm.description,
        assignedVolunteer: taskForm.assignedVolunteer,
        dueDate: taskForm.dueDate,
        priority: taskForm.priority,
        campaignId: showDetailModal._id
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (response.ok && result.success) {
        fetchCampaignTasks(showDetailModal._id);
        setShowAddTask(false);
        setEditingTask(null);
        setTaskForm({
          title: '',
          description: '',
          assignedVolunteer: '',
          dueDate: '',
          priority: 'medium'
        });
      } else {
        alert(result.message || 'Failed to submit task');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting task');
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();
      if (response.ok && result.success) {
        fetchCampaignTasks(showDetailModal._id);
      } else {
        alert(result.message || 'Failed to delete task');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting task');
    }
  };

  const handleAssignCampaignOrganizer = async (campaignId, coordinatorId) => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ createdBy: coordinatorId })
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        setShowDetailModal(result.data);
        fetchCampaigns();
      } else {
        alert(result.message || 'Failed to update campaign organizer');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating campaign organizer');
    }
  };

  const handleApproveEnrollment = async (campaignId, volunteerId, action) => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${campaignId}/approve-volunteer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ volunteerId, action })
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        // Refresh campaign details modal data and explorer list
        setShowDetailModal(result.data);
        fetchCampaigns();
      } else {
        alert(result.message || 'Action failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating registration status');
    }
  };

  const handleRegister = async (campaignId) => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${campaignId}/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'You have joined this campaign successfully!' });
        fetchCampaigns();
        if (showDetailModal && showDetailModal._id === campaignId) {
          setShowDetailModal(result.data);
        }
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to register' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error joining campaign' });
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('banner', file);

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/banner`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setNewCampaign(prev => ({ ...prev, bannerImage: result.file.path }));
      } else {
        alert(result.message || 'Banner upload failed');
      }
    } catch (err) {
      alert('Error uploading banner');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const bodyPayload = {
        ...newCampaign,
        location: {
          address: newCampaign.locationAddress
        }
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Campaign submitted successfully!' });
        setShowCreateModal(false);
        // Clear form
        setNewCampaign({
          title: '',
          description: '',
          category: 'Other',
          bannerImage: '',
          startDate: '',
          endDate: '',
          locationAddress: '',
          targetVolunteers: 10
        });
        fetchCampaigns();
      } else {
        alert(result.message || 'Failed to create campaign');
      }
    } catch (err) {
      alert('Error creating campaign');
    }
  };

  const handleApproveCampaign = async (campaignId, approveStatus) => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: approveStatus })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: `Campaign status updated to ${approveStatus}` });
        fetchCampaigns();
        setShowDetailModal(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!dbUser) return null;
  const isPrivileged = ['admin', 'coordinator'].includes(dbUser.role);
  const canManageCampaign = dbUser.role === 'admin' || 
    (dbUser.role === 'coordinator' && showDetailModal && (showDetailModal.createdBy?._id || showDetailModal.createdBy) === dbUser._id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Header Panel */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>NGO Campaigns</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Explore and register for upcoming volunteer drives or organize new events.</p>
        </div>
        {isPrivileged && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Create Campaign
          </button>
        )}
      </div>

      {/* Message alert */}
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

      {/* Filters Toolbar */}
      <div className="glass-card" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '8px 16px', borderRadius: '8px', flexGrow: 1 }}>
          <Search size={18} style={{ color: 'var(--color-text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search campaigns by keyword or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' }}
          />
        </div>

        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
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
          <option value="" style={{ background: '#0b0f19' }}>All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat} style={{ background: '#0b0f19' }}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Campaigns Listing */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>No campaigns match your search request.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {campaigns.map((camp) => {
            const hasJoined = camp.volunteersRegistered.includes(dbUser._id);
            const hasRequested = camp.volunteersRequested?.includes(dbUser._id);
            const spacesTaken = camp.volunteersRegistered.length;
            const progressPercent = Math.min(Math.round((spacesTaken / camp.targetVolunteers) * 100), 100);

            return (
              <div key={camp._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '0px', overflow: 'hidden' }}>
                {/* Banner Image */}
                <div style={{ height: '160px', width: '100%', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}>
                  {camp.bannerImage ? (
                    <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${camp.bannerImage}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--gradient-primary)', opacity: 0.15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={48} style={{ opacity: 0.3 }} />
                    </div>
                  )}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    color: 'var(--color-text-primary)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {camp.category}
                  </span>
                  
                  {isPrivileged && (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: camp.status === 'active' ? 'rgba(16, 185, 129, 0.8)' : 'rgba(245, 158, 11, 0.8)',
                      backdropFilter: 'blur(4px)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {camp.status}
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', lineHeight: '1.3' }}>{camp.title}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '6px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {camp.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} />
                      <span>{new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{camp.location.address}</span>
                    </div>
                  </div>

                  {/* Registered capacity progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span>Capacity Progress</span>
                      <span style={{ fontWeight: '600' }}>{spacesTaken} / {camp.targetVolunteers} joined</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--color-accent-emerald)', borderRadius: '3px' }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" style={{ flexGrow: 1, padding: '8px 16px' }} onClick={() => setShowDetailModal(camp)}>
                      <Info size={14} /> Details
                    </button>
                    {dbUser.role === 'volunteer' && camp.status === 'active' && (
                      <button 
                        className="btn btn-primary" 
                        style={{ 
                          flexGrow: 1, 
                          padding: '8px 16px',
                          background: hasRequested ? 'rgba(245, 158, 11, 0.1)' : undefined,
                          color: hasRequested ? 'var(--color-accent-amber)' : undefined,
                          border: hasRequested ? '1px solid rgba(245, 158, 11, 0.2)' : undefined
                        }}
                        onClick={() => handleRegister(camp._id)}
                        disabled={hasJoined || hasRequested || spacesTaken >= camp.targetVolunteers}
                      >
                        {hasJoined ? (
                          <>
                            <Check size={14} /> Joined
                          </>
                        ) : hasRequested ? (
                          <>
                            <Hourglass size={14} /> Requested
                          </>
                        ) : spacesTaken >= camp.targetVolunteers ? 'Full' : 'Join'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 📋 Create Campaign Modal Form (Coordinator/Admin only) */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 200
        }}>
          <div className="glass-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Organize Campaign</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Campaign Title</label>
                <input 
                  type="text" 
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})}
                  placeholder="E.g. Clean the Beach 2026"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Description</label>
                <textarea 
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                  placeholder="Describe goals, tasks, and volunteer expectations..."
                  rows="3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Category</label>
                  <select 
                    value={newCampaign.category}
                    onChange={(e) => setNewCampaign({...newCampaign, category: e.target.value})}
                    style={{ background: '#0b0f19', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Capacity (Volunteers)</label>
                  <input 
                    type="number" 
                    value={newCampaign.targetVolunteers}
                    onChange={(e) => setNewCampaign({...newCampaign, targetVolunteers: parseInt(e.target.value) || 1})}
                    min="1"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                    required
                  />
                </div>
              </div>

              {/* Assign Coordinator (Admin Only) */}
              {dbUser.role === 'admin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Assign Coordinator</label>
                  <select 
                    value={newCampaign.createdBy || ''}
                    onChange={(e) => setNewCampaign({...newCampaign, createdBy: e.target.value})}
                    style={{ background: '#0b0f19', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                  >
                    <option value="">System Admin (Self)</option>
                    {coordinators.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.firstName || c.lastName ? `${c.firstName} ${c.lastName} (${c.email})` : c.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Banner Upload */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Banner Image</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', gap: '8px', fontSize: '13px' }}>
                    <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: 'none' }} />
                  </label>
                  {newCampaign.bannerImage && (
                    <span style={{ fontSize: '12px', color: 'var(--color-accent-emerald)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      Banner attached successfully
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Start Date</label>
                  <input 
                    type="date" 
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>End Date</label>
                  <input 
                    type="date" 
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Location Address</label>
                <input 
                  type="text" 
                  value={newCampaign.locationAddress}
                  onChange={(e) => setNewCampaign({...newCampaign, locationAddress: e.target.value})}
                  placeholder="123 Community St, City, Country"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>Submit Campaign</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔎 Detail View Modal */}
      {showDetailModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 200
        }}>
          <div className="glass-card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '0px' }}>
            {/* Header Banner */}
            <div style={{ height: '200px', width: '100%', relative: 'position', background: 'rgba(255,255,255,0.02)' }}>
              {showDetailModal.bannerImage ? (
                <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${showDetailModal.bannerImage}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--gradient-primary)', opacity: 0.15 }} />
              )}
              <button 
                onClick={() => setShowDetailModal(null)} 
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content info */}
            <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <span style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--color-accent-blue)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {showDetailModal.category}
                </span>
                <h3 style={{ fontSize: '24px', fontWeight: '700', marginTop: '10px' }}>{showDetailModal.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '10px', lineHeight: '1.6' }}>
                  {showDetailModal.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Campaign Schedule</span>
                  <strong style={{ color: '#fff' }}>
                    {new Date(showDetailModal.startDate).toLocaleDateString()} - {new Date(showDetailModal.endDate).toLocaleDateString()}
                  </strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Location Address</span>
                  <strong style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {showDetailModal.location.address}
                  </strong>
                </div>
              </div>

              {/* Organizer details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Organized by:</span>
                {dbUser.role === 'admin' ? (
                  <select
                    value={showDetailModal.createdBy?._id || showDetailModal.createdBy || ''}
                    onChange={(e) => handleAssignCampaignOrganizer(showDetailModal._id, e.target.value)}
                    style={{ background: '#0b0f19', border: '1px solid var(--glass-border)', padding: '6px 10px', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none' }}
                  >
                    <option value="">System Admin (Self)</option>
                    {coordinators.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.firstName || c.lastName ? `${c.firstName} ${c.lastName} (${c.email})` : c.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <strong>
                    {showDetailModal.createdBy?.firstName || showDetailModal.createdBy?.lastName 
                      ? `${showDetailModal.createdBy.firstName} ${showDetailModal.createdBy.lastName}` 
                      : showDetailModal.createdBy?.email || 'System Admin'}
                  </strong>
                )}
              </div>

              {/* Admin Approval Control Panel */}
              {dbUser.role === 'admin' && showDetailModal.status === 'pending' && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: 'rgba(245, 158, 11, 0.05)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(245, 158, 11, 0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent-amber)' }}>
                    <Info size={16} />
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>Admin Review Action Required</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }} onClick={() => handleApproveCampaign(showDetailModal._id, 'active')}>
                      Approve & Publish
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '13px', color: 'var(--color-accent-rose)' }} onClick={() => handleApproveCampaign(showDetailModal._id, 'rejected')}>
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Pending Join Requests Roster for Coordinators/Admins (Enforced by canManageCampaign) */}
              {canManageCampaign && (
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} style={{ color: 'var(--color-accent-amber)' }} />
                    Pending Join Requests ({showDetailModal.volunteersRequested?.length || 0})
                  </h4>
                  {showDetailModal.volunteersRequested?.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No pending requests for this campaign.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                      {showDetailModal.volunteersRequested?.map((v) => (
                        <div key={v._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {v.profileImage ? (
                              <img src={v.profileImage} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                            ) : (
                              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                                {v.firstName?.[0]}
                              </div>
                            )}
                            <span>{v.firstName || v.lastName ? `${v.firstName} ${v.lastName} (${v.email})` : v.email}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '2px 6px', fontSize: '11px', display: 'flex', alignItems: 'center', background: 'var(--color-accent-emerald)', border: 'none' }}
                              onClick={() => handleApproveEnrollment(showDetailModal._id, v._id, 'approve')}
                            >
                              <Check size={12} /> Approve
                            </button>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '2px 6px', fontSize: '11px', display: 'flex', alignItems: 'center', color: 'var(--color-accent-rose)' }}
                              onClick={() => handleApproveEnrollment(showDetailModal._id, v._id, 'reject')}
                            >
                              <X size={12} /> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Registered Volunteers Roster list for Coordinators/Admins */}
              {isPrivileged && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} />
                    Registered Volunteers ({showDetailModal.volunteersRegistered?.length || 0})
                  </h4>
                  {showDetailModal.volunteersRegistered?.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No volunteers have registered for this campaign yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '8px' }}>
                      {showDetailModal.volunteersRegistered?.map((v) => (
                        <div key={v._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                          {v.profileImage ? (
                            <img src={v.profileImage} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                          ) : (
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                              {v.firstName?.[0]}
                            </div>
                          )}
                          <span>{v.firstName} {v.lastName} ({v.email})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Campaign Tasks Section (Visible to All) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PlusCircle size={16} style={{ color: 'var(--color-accent-blue)' }} />
                    Campaign Tasks ({campaignTasks.length})
                  </h4>
                  {canManageCampaign && !showAddTask && !editingTask && (
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => {
                        setShowAddTask(true);
                        setEditingTask(null);
                        setTaskForm({
                          title: '',
                          description: '',
                          assignedVolunteer: showDetailModal.volunteersRegistered?.[0]?._id || '',
                          dueDate: '',
                          priority: 'medium'
                        });
                      }}
                    >
                      <Plus size={12} /> Add Task
                    </button>
                  )}
                </div>

                {/* Inline Add / Edit Task Form */}
                {(showAddTask || editingTask) && (
                  <form onSubmit={handleTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h5 style={{ fontSize: '13px', fontWeight: '600' }}>{editingTask ? 'Edit Task' : 'Create New Task'}</h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Task Title</label>
                      <input 
                        type="text" 
                        value={taskForm.title} 
                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                        placeholder="E.g. Setup registration booth"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '8px 12px', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none' }}
                        required 
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Description</label>
                      <textarea 
                        value={taskForm.description} 
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        placeholder="Detailed instructions for the volunteer..."
                        rows="2"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '8px 12px', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                        required 
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Assign Volunteer</label>
                        <select 
                          value={taskForm.assignedVolunteer} 
                          onChange={(e) => setTaskForm({ ...taskForm, assignedVolunteer: e.target.value })}
                          style={{ background: '#0b0f19', border: '1px solid var(--glass-border)', padding: '8px 10px', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none' }}
                          required
                        >
                          <option value="">Select volunteer...</option>
                          {showDetailModal.volunteersRegistered?.map(v => (
                            <option key={v._id} value={v._id}>
                              {v.firstName || v.lastName ? `${v.firstName} ${v.lastName} (${v.email})` : v.email}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Due Date</label>
                        <input 
                          type="date" 
                          value={taskForm.dueDate} 
                          onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '8px 10px', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none' }}
                          required 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Priority</label>
                        <select 
                          value={taskForm.priority} 
                          onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                          style={{ background: '#0b0f19', border: '1px solid var(--glass-border)', padding: '8px 10px', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none' }}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '11px' }} onClick={() => { setShowAddTask(false); setEditingTask(null); }}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '11px' }}>
                          Save Task
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Tasks List */}
                {tasksLoading ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '12px' }}>Loading tasks...</div>
                ) : campaignTasks.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No tasks assigned for this campaign yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '8px' }}>
                    {campaignTasks.map((t) => (
                      <div key={t._id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <strong style={{ fontSize: '13px', color: '#fff' }}>{t.title}</strong>
                            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>{t.description}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '9px',
                              fontWeight: 'bold',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              background: t.priority === 'high' ? 'rgba(239, 68, 68, 0.15)' : t.priority === 'medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                              color: t.priority === 'high' ? 'var(--color-accent-rose)' : t.priority === 'medium' ? 'var(--color-accent-amber)' : 'var(--color-accent-blue)'
                            }}>
                              {t.priority}
                            </span>
                            <span style={{
                              fontSize: '9px',
                              fontWeight: 'bold',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              background: t.status === 'verified' ? 'rgba(16, 185, 129, 0.15)' : t.status === 'completed' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.05)',
                              color: t.status === 'verified' ? 'var(--color-accent-emerald)' : t.status === 'completed' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)'
                            }}>
                              {t.status}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--color-text-muted)', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px', marginTop: '2px' }}>
                          <span>Assignee: <strong>{t.assignedVolunteer?.firstName} {t.assignedVolunteer?.lastName}</strong></span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={11} /> Due: {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Coordinator / Admin controls */}
                        {canManageCampaign && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '6px', marginTop: '2px' }}>
                            <button 
                              style={{ background: 'none', border: 'none', color: 'var(--color-accent-blue)', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                              onClick={() => {
                                setEditingTask(t);
                                setShowAddTask(false);
                                setTaskForm({
                                  title: t.title,
                                  description: t.description,
                                  assignedVolunteer: t.assignedVolunteer?._id || '',
                                  dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
                                  priority: t.priority
                                });
                              }}
                            >
                              Edit Details
                            </button>
                            <button 
                              style={{ background: 'none', border: 'none', color: 'var(--color-accent-rose)', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                              onClick={() => handleTaskDelete(t._id)}
                            >
                              Delete Task
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                {dbUser.role === 'volunteer' && showDetailModal.status === 'active' && (
                  <button 
                    className="btn btn-primary" 
                    style={{ flexGrow: 1 }}
                    onClick={() => handleRegister(showDetailModal._id)}
                    disabled={showDetailModal.volunteersRegistered?.some(v => v._id === dbUser._id)}
                  >
                    {showDetailModal.volunteersRegistered?.some(v => v._id === dbUser._id) ? 'Already Joined' : 'Register to Join'}
                  </button>
                )}
                <button className="btn btn-secondary" style={{ flexGrow: 1 }} onClick={() => setShowDetailModal(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignExplorer;
