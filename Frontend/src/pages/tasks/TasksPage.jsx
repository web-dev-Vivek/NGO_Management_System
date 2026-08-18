import React, { useState, useEffect } from 'react';
import { useDbUser } from '../../context/UserContext';
import { useAuth } from '@clerk/clerk-react';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Play, 
  Square, 
  UserCheck 
} from 'lucide-react';

const TasksPage = () => {
  const { dbUser } = useDbUser();
  const { getToken } = useAuth();
  
  const [tasks, setTasks] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignVolunteers, setSelectedCampaignVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Assign Task Form State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    campaignId: '',
    assignedVolunteer: '',
    dueDate: '',
    priority: 'medium'
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setTasks(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns`);
      const result = await response.json();
      if (response.ok && result.success) {
        // Coordinator can assign tasks to campaigns they created or all active
        setCampaigns(result.data.filter(c => c.status === 'active'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (dbUser && ['coordinator', 'admin'].includes(dbUser.role)) {
      fetchCampaigns();
    }
  }, [dbUser]);

  // Load volunteers registered for selected campaign in form
  const handleCampaignChange = async (campaignId) => {
    setNewTask(prev => ({ ...prev, campaignId, assignedVolunteer: '' }));
    if (!campaignId) {
      setSelectedCampaignVolunteers([]);
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${campaignId}`);
      const result = await response.json();
      if (response.ok && result.success) {
        setSelectedCampaignVolunteers(result.data.volunteersRegistered || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTask)
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Task allocated and assigned successfully!' });
        setShowAssignModal(false);
        setNewTask({ title: '', description: '', campaignId: '', assignedVolunteer: '', dueDate: '', priority: 'medium' });
        setSelectedCampaignVolunteers([]);
        fetchTasks();
      } else {
        alert(result.message || 'Failed to assign task');
      }
    } catch (err) {
      alert('Error assigning task');
    }
  };

  const handleLogHours = async (taskId, action) => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}/log-hours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: result.message });
        fetchTasks();
      } else {
        setMessage({ type: 'error', text: result.message || 'Log operation failed' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Task status updated!' });
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyHours = async (taskId, verifyStatus, approvedHrs) => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: verifyStatus, approvedHours: approvedHrs })
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: result.message });
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!dbUser) return null;
  const isPrivileged = ['coordinator', 'admin'].includes(dbUser.role);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Page Header */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Task Console</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {isPrivileged 
              ? 'Distribute specific goals to volunteers, coordinate workflows, and audit service log sheets.' 
              : 'Log in/out to record your active hours and view your task requirements.'}
          </p>
        </div>
        {isPrivileged && (
          <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
            <Plus size={16} /> Assign Task
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

      {/* Tasks Table/List Card */}
      <div className="glass-card" style={{ padding: '0px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No tasks found in schedule drive.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>Task / Campaign</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>Assigned To</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>Priority</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>Log status</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>Hours</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="table-row">
                  {/* Task details */}
                  <td style={{ padding: '16px 24px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{task.title}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                      {task.campaignId?.title || 'Unknown Campaign'} • Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </td>

                  {/* Assigned volunteer */}
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {task.assignedVolunteer?.profileImage ? (
                        <img src={task.assignedVolunteer.profileImage} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                      ) : (
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                          <User size={12} />
                        </div>
                      )}
                      <span style={{ fontSize: '13px' }}>{task.assignedVolunteer?.firstName} {task.assignedVolunteer?.lastName}</span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      fontWeight: '600',
                      color: 
                        task.priority === 'high' ? 'var(--color-accent-rose)' : 
                        task.priority === 'medium' ? 'var(--color-accent-blue)' : 
                        'var(--color-text-secondary)'
                    }}>
                      {task.priority}
                    </span>
                  </td>

                  {/* Log status tag */}
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
                        task.status === 'verified' ? 'rgba(16, 185, 129, 0.1)' : 
                        task.status === 'in-progress' ? 'rgba(59, 130, 246, 0.1)' : 
                        task.status === 'completed' ? 'rgba(245, 158, 11, 0.1)' : 
                        'rgba(255, 255, 255, 0.05)',
                      color: 
                        task.status === 'verified' ? 'var(--color-accent-emerald)' : 
                        task.status === 'in-progress' ? 'var(--color-accent-blue)' : 
                        task.status === 'completed' ? 'var(--color-accent-amber)' : 
                        'var(--color-text-secondary)',
                      borderColor: 
                        task.status === 'verified' ? 'rgba(16, 185, 129, 0.15)' : 
                        task.status === 'in-progress' ? 'rgba(59, 130, 246, 0.15)' : 
                        task.status === 'completed' ? 'rgba(245, 158, 11, 0.15)' : 
                        'rgba(255,255,255,0.05)'
                    }}>
                      {task.status}
                    </span>
                  </td>

                  {/* Hours */}
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500' }}>
                    {task.loggedHours > 0 ? `${task.loggedHours} hrs` : '--'}
                  </td>

                  {/* Actions column */}
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    {/* Volunteer actions */}
                    {dbUser.role === 'volunteer' && (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {task.status === 'pending' && (
                          <button onClick={() => handleLogHours(task._id, 'check-in')} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                            <Play size={12} /> Check-In
                          </button>
                        )}
                        {task.status === 'in-progress' && (
                          <button onClick={() => handleLogHours(task._id, 'check-out')} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', borderColor: 'var(--color-accent-amber)', color: 'var(--color-accent-amber)' }}>
                            <Square size={12} /> Check-Out
                          </button>
                        )}
                        {task.status === 'completed' && (
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Awaiting Approval</span>
                        )}
                        {task.status === 'verified' && (
                          <span style={{ fontSize: '12px', color: 'var(--color-accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Verified</span>
                        )}
                      </div>
                    )}

                    {/* Coordinator/Admin actions */}
                    {isPrivileged && (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {task.status === 'completed' && (
                          <>
                            <button 
                              onClick={() => handleVerifyHours(task._id, 'verified', task.loggedHours)} 
                              className="btn btn-primary" 
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleVerifyHours(task._id, 'pending')} 
                              className="btn btn-secondary" 
                              style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--color-accent-rose)' }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {task.status === 'verified' && (
                          <span style={{ fontSize: '12px', color: 'var(--color-accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}><UserCheck size={12} /> Verified</span>
                        )}
                        {['pending', 'in-progress'].includes(task.status) && (
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Active Log</span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 📋 Assign Task Modal (Coordinator/Admin only) */}
      {showAssignModal && (
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
          <div className="glass-card" style={{ maxWidth: '550px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Allocate Task</h3>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Select Campaign</label>
                <select 
                  value={newTask.campaignId}
                  onChange={(e) => handleCampaignChange(e.target.value)}
                  style={{ background: '#0b0f19', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                  required
                >
                  <option value="">-- Choose Campaign --</option>
                  {campaigns.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Assign Volunteer</label>
                <select 
                  value={newTask.assignedVolunteer}
                  onChange={(e) => setNewTask({...newTask, assignedVolunteer: e.target.value})}
                  style={{ background: '#0b0f19', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                  disabled={!newTask.campaignId}
                  required
                >
                  <option value="">-- Choose Registered Volunteer --</option>
                  {selectedCampaignVolunteers.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.firstName || v.lastName ? `${v.firstName} ${v.lastName} (${v.email})` : v.email}
                    </option>
                  ))}
                </select>
                {!newTask.campaignId && (
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>* Choose a campaign first to load registered volunteers</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Task Title</label>
                <input 
                  type="text" 
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="E.g. Setup Registration Booth"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Task Description</label>
                <textarea 
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Detail instructions for the volunteer..."
                  rows="3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    style={{ background: '#0b0f19', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Due Date</label>
                  <input 
                    type="date" 
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>Assign Task</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`
        .table-row:hover {
          background: rgba(255,255,255,0.015) !important;
        }
      `}</style>
    </div>
  );
};

export default TasksPage;
