import React, { useState, useEffect } from 'react';
import { useDbUser } from '../../context/UserContext';
import { useAuth } from '@clerk/clerk-react';
import { 
  Users, 
  Award, 
  Check, 
  X, 
  Plus, 
  UserCheck, 
  Hourglass, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  FileText,
  Search,
  ShieldAlert,
  Ban
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { dbUser, refreshUser } = useDbUser();
  const { getToken } = useAuth();
  
  // Dashboard states
  const [campaigns, setCampaigns] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [volunteerTasks, setVolunteerTasks] = useState([]);
  const [coordinatorRequests, setCoordinatorRequests] = useState([]); // Admin only
  const [pendingUsers, setPendingUsers] = useState([]); // Admin only
  const [coordinators, setCoordinators] = useState([]); // Admin only
  const [activeTab, setActiveTab] = useState('volunteers'); // 'volunteers' or 'coordinators'
  const [rosterSearch, setRosterSearch] = useState('');
  const [selectedRosterUser, setSelectedRosterUser] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalVolunteers: 0,
    totalCoordinators: 0,
    activeCampaigns: 0,
    pendingCampaigns: 0,
    completedCampaigns: 0,
    totalTasks: 0,
    verifiedTasks: 0,
    totalHours: 0,
    certificatesIssued: 0
  });

  const [loading, setLoading] = useState(true);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [detailCampaign, setDetailCampaign] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // Dropdown states for Admin Dashboard
  const [adminDropdowns, setAdminDropdowns] = useState({
    goal: 'Clean Energy & Environment',
    expected: '40 campaigns completed',
    current: '24 campaigns active',
    thisMonth: '5 drives scheduled'
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // 1. Fetch campaigns
      const campRes = await fetch(`${import.meta.env.VITE_API_URL}/campaigns`);
      const campResult = await campRes.json();
      if (campRes.ok && campResult.success) {
        setCampaigns(campResult.data);
      }

      // 2. Role-specific fetches
      if (dbUser.role === 'admin' || dbUser.role === 'coordinator') {
        // Fetch all volunteers
        const volRes = await fetch(`${import.meta.env.VITE_API_URL}/users?role=volunteer`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const volResult = await volRes.json();
        if (volRes.ok && volResult.success) {
          setVolunteers(volResult.data);
          if (volResult.data.length > 0 && !selectedVolunteer) {
            setSelectedVolunteer(volResult.data[0]);
          }
        }

        // Fetch all tasks with status 'completed' (waiting for approval/verification)
        const taskRes = await fetch(`${import.meta.env.VITE_API_URL}/tasks?status=completed`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const taskResult = await taskRes.json();
        if (taskRes.ok && taskResult.success) {
          setPendingTasks(taskResult.data);
        }

        // Fetch global analytics
        const analyticRes = await fetch(`${import.meta.env.VITE_API_URL}/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const analyticResult = await analyticRes.json();
        if (analyticRes.ok && analyticResult.success) {
          setAnalytics(analyticResult.data);
        }

        // Fetch Coordinator Promotion Applications (Admin only)
        if (dbUser.role === 'admin') {
          const promoRes = await fetch(`${import.meta.env.VITE_API_URL}/users/coordinator-requests`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const promoResult = await promoRes.json();
          if (promoRes.ok && promoResult.success) {
            setCoordinatorRequests(promoResult.data);
          }

          // Fetch Pending registrations
          const pendingRes = await fetch(`${import.meta.env.VITE_API_URL}/users?status=pending`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const pendingResult = await pendingRes.json();
          if (pendingRes.ok && pendingResult.success) {
            setPendingUsers(pendingResult.data);
          }

          // Fetch all coordinators
          const coordRes = await fetch(`${import.meta.env.VITE_API_URL}/users?role=coordinator`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const coordResult = await coordRes.json();
          let coords = [];
          if (coordRes.ok && coordResult.success) {
            setCoordinators(coordResult.data);
            coords = coordResult.data;
          }

          // Initialize selected roster user
          if (activeTab === 'volunteers' && volResult.data && volResult.data.length > 0) {
            setSelectedRosterUser(prev => prev || volResult.data[0]);
          } else if (activeTab === 'coordinators' && coords.length > 0) {
            setSelectedRosterUser(prev => prev || coords[0]);
          }
        }
      } else {
        // Volunteer: fetch their tasks
        const taskRes = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const taskResult = await taskRes.json();
        if (taskRes.ok && taskResult.success) {
          setVolunteerTasks(taskResult.data);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dbUser) {
      fetchDashboardData();
    }
  }, [dbUser]);

  const handleEnrollCampaign = async (campaignId) => {
    try {
      setActionLoading(true);
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${campaignId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Registration request submitted! Awaiting coordinator/admin approval.' });
        fetchDashboardData();
      } else {
        setMessage({ type: 'error', text: result.message || 'Enrollment failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error enrolling' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestCoordinator = async () => {
    try {
      setActionLoading(true);
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/request-coordinator`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Promotion request submitted successfully! Awaiting Admin verification.' });
        refreshUser(); // Updates dbUser in context
      } else {
        setMessage({ type: 'error', text: result.message || 'Promotion request failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error submitting promotion request' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveCoordinatorPromotion = async (clerkUserId) => {
    try {
      setActionLoading(true);
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${clerkUserId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'coordinator' })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Volunteer successfully promoted to Coordinator!' });
        fetchDashboardData();
      } else {
        setMessage({ type: 'error', text: result.message || 'Promotion approval failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error approving coordinator' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveEnrollment = async (campaignId, volunteerId, action) => {
    try {
      setActionLoading(true);
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
        setMessage({ type: 'success', text: `Volunteer registration request ${action === 'approve' ? 'approved' : 'rejected'} successfully.` });
        fetchDashboardData();
      } else {
        setMessage({ type: 'error', text: result.message || 'Approval failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error executing enrollment update' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyVolunteerStatus = async (clerkUserId, newStatus) => {
    try {
      setActionLoading(true);
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
        setMessage({ type: 'success', text: `User registration status set to: ${newStatus}` });
        setSelectedVolunteer(result.data);
        if (selectedRosterUser && selectedRosterUser.clerkUserId === clerkUserId) {
          setSelectedRosterUser(result.data);
        }
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUserRole = async (clerkUserId, newRole) => {
    try {
      setActionLoading(true);
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
        setMessage({ type: 'success', text: `User role successfully updated to: ${newRole}` });
        if (selectedRosterUser && selectedRosterUser.clerkUserId === clerkUserId) {
          setSelectedRosterUser(null);
        }
        fetchDashboardData();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update user role' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error updating user role' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveTaskHours = async (taskId, verifyStatus, approvedHrs) => {
    try {
      setActionLoading(true);
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
        setMessage({ type: 'success', text: `Work hours log sheet verified successfully!` });
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (!dbUser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--color-text-secondary)', fontWeight: '500' }}>Waiting for database profile sync...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--color-accent-blue)', fontWeight: '600' }}>Loading Dashboard details...</div>
      </div>
    );
  }

  // 👤 1. Volunteer Dashboard
  const renderVolunteer = () => {
    const joinedCampaigns = campaigns.filter(c => c.volunteersRegistered.includes(dbUser._id));
    const pendingCampaignsList = campaigns.filter(c => c.volunteersRequested.includes(dbUser._id));
    const notJoinedCampaigns = campaigns.filter(c => c.status === 'active' && !c.volunteersRegistered.includes(dbUser._id) && !c.volunteersRequested.includes(dbUser._id));
    
    // Sum hours verified
    const totalVerifiedHours = volunteerTasks
      .filter(t => t.status === 'verified')
      .reduce((sum, t) => sum + (t.loggedHours || 0), 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Top welcome card */}
        <div className="glass-card" style={{ 
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.05) 0%, rgba(22, 163, 74, 0.03) 100%)',
          borderLeft: '4px solid var(--color-accent-blue)'
        }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800' }}>Welcome, {dbUser.firstName}!</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            Earn certificates of appreciation by registering for projects, completing assigned tasks, and submitting verified log hours.
          </p>
        </div>

        {/* Two Column Layout matching image wireframe */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }} className="responsive-grid">
          
          {/* Left Column: Projects Explorer to Enroll */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: 'var(--color-accent-blue)' }}>Ongoing NGO Projects</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Pick a campaign drive to enroll and request service tasks.</p>
            </div>

            {notJoinedCampaigns.length === 0 && pendingCampaignsList.length === 0 && joinedCampaigns.length === 0 && (
              <div className="glass-card" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                No active projects available right now.
              </div>
            )}

            {/* List not joined */}
            {notJoinedCampaigns.map(camp => (
              <div key={camp._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{camp.title}</h4>
                  <span style={{ 
                    fontSize: '11px', 
                    background: '#f0f9ff', 
                    color: 'var(--color-accent-blue)', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    display: 'inline-block',
                    marginTop: '4px',
                    fontWeight: '600'
                  }}>
                    {camp.category}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setDetailCampaign(camp)}>
                    Details
                  </button>
                  <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEnrollCampaign(camp._id)} disabled={actionLoading}>
                    Enroll
                  </button>
                </div>
              </div>
            ))}

            {/* List pending approval */}
            {pendingCampaignsList.map(camp => (
              <div key={camp._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '16px 20px', borderColor: 'var(--color-accent-amber)' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{camp.title}</h4>
                  <span style={{ 
                    fontSize: '11px', 
                    background: 'rgba(245, 158, 11, 0.1)', 
                    color: 'var(--color-accent-amber)', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    display: 'inline-block',
                    marginTop: '4px',
                    fontWeight: '600'
                  }}>
                    Approval Pending
                  </span>
                </div>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setDetailCampaign(camp)}>
                  Details
                </button>
              </div>
            ))}
          </div>

          {/* Right Column: Promotion request and Completed drives */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Coordinator Request Panel */}
            <div className="glass-card" style={{ border: '1px solid #bae6fd', background: '#f0f9ff' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: 'var(--color-accent-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={18} /> Apply for Coordinator Role
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '14px' }}>
                Coordinators can create campaign drives, assign tasks, and verify volunteer logged hours.
              </p>
              {dbUser.coordinatorRequested ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '12px', 
                  color: 'var(--color-accent-amber)', 
                  fontWeight: '600',
                  background: 'rgba(245, 158, 11, 0.1)', 
                  padding: '10px', 
                  borderRadius: '8px'
                }}>
                  <Hourglass size={14} /> Promotion Application Pending Admin Review
                </div>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%', fontSize: '12px' }} onClick={handleRequestCoordinator} disabled={actionLoading}>
                  Request Coordinator Role
                </button>
              )}
            </div>

            {/* Impact Metrics */}
            <div className="glass-card">
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--color-accent-green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} />
                My Impact Metrics
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Total hours log */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Verified service hours</span>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-accent-green)', marginTop: '4px' }}>
                    {totalVerifiedHours} hrs
                  </div>
                </div>

                {/* Progress in current campaigns */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Registered Drives</h4>
                  {joinedCampaigns.length === 0 ? (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>No campaigns joined yet.</span>
                  ) : (
                    joinedCampaigns.map(c => (
                      <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                        <span style={{ fontWeight: '500' }}>{c.title}</span>
                        <span style={{ color: 'var(--color-accent-green)', fontWeight: '600' }}>Joined</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  // 👥 2. Coordinator Dashboard
  const renderCoordinator = () => {
    // Find campaign enrollment requests for campaigns created by this coordinator
    const coordinatorCampaigns = campaigns.filter(
      c => c.createdByRole === 'coordinator' && c.createdBy.toString() === dbUser._id.toString()
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--color-accent-blue)' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '700' }}>Coordinator Roster Panel</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Review volunteer profiles to accept registrations and verify completed service log requests.
          </p>
        </div>

        {/* Three Column/Flex matching image wireframe for Coordinator */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '20px' }} className="responsive-grid">
          
          {/* Left: Volunteer list */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              Volunteer Roster
            </h3>
            {volunteers.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No volunteers registered.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {volunteers.map(vol => (
                  <button 
                    key={vol._id} 
                    onClick={() => setSelectedVolunteer(vol)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'start',
                      width: '100%',
                      background: selectedVolunteer?._id === vol._id ? '#f0f9ff' : 'none',
                      border: selectedVolunteer?._id === vol._id ? '1px solid #bae6fd' : '1px solid transparent',
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: '600', color: selectedVolunteer?._id === vol._id ? 'var(--color-accent-blue)' : 'inherit' }}>
                      {vol.firstName} {vol.lastName}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{vol.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center: Details info of selected volunteer & enrollment approvals */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              Application Review & Details
            </h3>

            {selectedVolunteer ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Full Name</span>
                    <p style={{ fontWeight: '600' }}>{selectedVolunteer.firstName} {selectedVolunteer.lastName}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Phone No</span>
                    <p style={{ fontWeight: '600' }}>{selectedVolunteer.phone || '--'}</p>
                  </div>
                </div>

                <div style={{ fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Email Address</span>
                  <p style={{ fontWeight: '600' }}>{selectedVolunteer.email}</p>
                </div>

                <div style={{ fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Bio / Overview</span>
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px', fontSize: '13px', lineHeight: '1.4' }}>
                    {selectedVolunteer.bio || 'No profile bio provided.'}
                  </p>
                </div>

                {/* Accept Actions */}
                {selectedVolunteer.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button className="btn btn-success" style={{ flexGrow: 1, padding: '8px 16px', fontSize: '12px' }} onClick={() => handleVerifyVolunteerStatus(selectedVolunteer.clerkUserId, 'active')} disabled={actionLoading}>
                      <Check size={14} /> Accept Volunteer
                    </button>
                    <button className="btn btn-secondary" style={{ flexGrow: 1, padding: '8px 16px', fontSize: '12px', color: 'var(--color-accent-rose)' }} onClick={() => handleVerifyVolunteerStatus(selectedVolunteer.clerkUserId, 'rejected')} disabled={actionLoading}>
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                Select a volunteer to view profile details.
              </div>
            )}

            {/* Campaign enrollment requests for this Coordinator's campaigns */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>Project Sign-Up Requests</h4>
              
              {coordinatorCampaigns.every(c => c.volunteersRequested.length === 0) ? (
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', padding: '6px' }}>No pending campaign join requests.</div>
              ) : (
                coordinatorCampaigns.map(camp => (
                  camp.volunteersRequested.map(reqVol => (
                    <div key={`${camp._id}-${reqVol._id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '8px', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '600', display: 'block' }}>{reqVol.firstName} {reqVol.lastName}</span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>wants to join: {camp.title}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          className="btn btn-success" 
                          style={{ padding: '4px 8px', borderRadius: '4px' }}
                          onClick={() => handleApproveEnrollment(camp._id, reqVol._id, 'approve')}
                          disabled={actionLoading}
                        >
                          <Check size={12} />
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 8px', borderRadius: '4px', color: 'var(--color-accent-rose)' }}
                          onClick={() => handleApproveEnrollment(camp._id, reqVol._id, 'reject')}
                          disabled={actionLoading}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                ))
              )}
            </div>
          </div>

          {/* Right: Pending requests checks and active days count */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              Service Log Requests
            </h3>

            {pendingTasks.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', textAlign: 'center', padding: '10px' }}>
                No pending work sheets logs.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingTasks.map(task => (
                  <div key={task._id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-primary)' }}>{task.title}</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Logged: {task.loggedHours} hrs</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          onClick={() => handleApproveTaskHours(task._id, 'verified', task.loggedHours)}
                          style={{ background: 'rgba(22, 163, 74, 0.1)', color: 'var(--color-accent-green)', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={() => handleApproveTaskHours(task._id, 'pending')}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-accent-rose)', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active days counter */}
            <div style={{ marginTop: 'auto', background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.04) 0%, rgba(22, 163, 74, 0.04) 100%)', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Active Drives Count</span>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-accent-blue)', marginTop: '4px' }}>
                {campaigns.filter(c => c.status === 'active').length} active
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  // 👥 3. Admin Dashboard
  const renderAdmin = () => {
    // Find enrollment requests for campaigns created by Admin (where no coordinator is assigned)
    const adminCreatedCampaigns = campaigns.filter(c => c.createdByRole === 'admin' && (!c.createdBy || c.createdBy.role !== 'coordinator'));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Top welcome/analytics card */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--color-accent-blue)' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '700' }}>System Executive Dashboard</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            System configuration metrics, goal targets, and campaign drive controls.
          </p>
        </div>

        {/* Three column grid matching layout wireframe */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: '20px' }} className="responsive-grid">
          
          {/* Left Column: Campaigns list and Coordinator Applications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Campaigns list */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>NGO Campaigns</h3>
                <Link to="/campaigns" style={{ color: 'var(--color-accent-blue)', cursor: 'pointer' }}>
                  <Plus size={18} />
                </Link>
              </div>
              
              {campaigns.length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>No campaigns available.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {campaigns.slice(0, 4).map(c => (
                    <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                        {c.title}
                      </span>
                      <span style={{ 
                        fontSize: '10px', 
                        background: c.status === 'active' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                        color: c.status === 'active' ? 'var(--color-accent-green)' : 'var(--color-accent-amber)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coordinator Applications */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                Coordinator Applications
              </h3>
              {coordinatorRequests.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center' }}>No pending applications.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {coordinatorRequests.map(reqUser => (
                    <div key={reqUser._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f9ff', padding: '10px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '600', display: 'block' }}>{reqUser.firstName} {reqUser.lastName}</span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{reqUser.email}</span>
                      </div>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => handleApproveCoordinatorPromotion(reqUser.clerkUserId)}
                        disabled={actionLoading}
                      >
                        Approve
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Account Approvals */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                Pending Account Approvals
              </h3>
              {pendingUsers.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center' }}>No pending user registrations.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingUsers.map(pendingUser => (
                    <div key={pendingUser._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '600', display: 'block' }}>{pendingUser.firstName} {pendingUser.lastName}</span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{pendingUser.email} ({pendingUser.role})</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          className="btn btn-success" 
                          style={{ padding: '4px 8px', borderRadius: '4px' }}
                          onClick={() => handleVerifyVolunteerStatus(pendingUser.clerkUserId, 'active')}
                          disabled={actionLoading}
                        >
                          <Check size={12} />
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 8px', borderRadius: '4px', color: 'var(--color-accent-rose)' }}
                          onClick={() => handleVerifyVolunteerStatus(pendingUser.clerkUserId, 'rejected')}
                          disabled={actionLoading}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center Column: System stats counters and Assign button */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px' }}>
                Allocations & Roster Stats
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Stat 1 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Volunteers</span>
                  <strong style={{ fontSize: '16px' }}>{analytics.totalVolunteers || volunteers.length}</strong>
                </div>
                
                {/* Stat 2 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Active Coordinators</span>
                  <strong style={{ fontSize: '16px' }}>{analytics.totalCoordinators || 2}</strong>
                </div>

                {/* Stat 3 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Donation Drive</span>
                  <strong style={{ fontSize: '16px', color: 'var(--color-accent-green)' }}>2.07 cr</strong>
                </div>
              </div>
            </div>

            {/* Uncoordinated campaign enrollment requests */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: 'var(--color-accent-blue)' }}>Uncoordinated Sign-Up Requests</h4>
              
              {adminCreatedCampaigns.every(c => c.volunteersRequested.length === 0) ? (
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>No uncoordinated enrollments.</div>
              ) : (
                adminCreatedCampaigns.map(camp => (
                  camp.volunteersRequested.map(reqVol => (
                    <div key={`${camp._id}-${reqVol._id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '8px', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '600', display: 'block' }}>{reqVol.firstName} {reqVol.lastName}</span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>campaign: {camp.title}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          className="btn btn-success" 
                          style={{ padding: '4px 8px', borderRadius: '4px' }}
                          onClick={() => handleApproveEnrollment(camp._id, reqVol._id, 'approve')}
                          disabled={actionLoading}
                        >
                          <Check size={12} />
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 8px', borderRadius: '4px', color: 'var(--color-accent-rose)' }}
                          onClick={() => handleApproveEnrollment(camp._id, reqVol._id, 'reject')}
                          disabled={actionLoading}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                ))
              )}
            </div>

            <Link to="/tasks" className="btn btn-primary" style={{ width: '100%', fontSize: '13px', padding: '8px 16px', marginTop: '16px' }}>
              Assign Tasks
            </Link>
          </div>

          {/* Right Column: Goal/Expected/Current dropdown selectors */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              Milestones Expected
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Dropdown 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Focus Goal</label>
                <select 
                  value={adminDropdowns.goal}
                  onChange={(e) => setAdminDropdowns({ ...adminDropdowns, goal: e.target.value })}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                >
                  <option>Clean Energy & Environment</option>
                  <option>Primary Health Outreach</option>
                  <option>Slum Area Education Programs</option>
                </select>
              </div>

              {/* Dropdown 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Expected Impact</label>
                <select 
                  value={adminDropdowns.expected}
                  onChange={(e) => setAdminDropdowns({ ...adminDropdowns, expected: e.target.value })}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                >
                  <option>40 campaigns completed</option>
                  <option>100 campaigns completed</option>
                </select>
              </div>

              {/* Dropdown 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Current State</label>
                <select 
                  value={adminDropdowns.current}
                  onChange={(e) => setAdminDropdowns({ ...adminDropdowns, current: e.target.value })}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                >
                  <option>24 campaigns active</option>
                  <option>5 campaigns active</option>
                </select>
              </div>

              {/* Dropdown 4 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>This Month Drive</label>
                <select 
                  value={adminDropdowns.thisMonth}
                  onChange={(e) => setAdminDropdowns({ ...adminDropdowns, thisMonth: e.target.value })}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                >
                  <option>5 drives scheduled</option>
                  <option>15 drives scheduled</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* NGO Roster Explorer Section */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} style={{ color: 'var(--color-accent-blue)' }} /> NGO Roster Explorer
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                Browse, search, and view detailed profiles and manage roles of volunteers and coordinators.
              </p>
            </div>
            
            {/* Search & Tabs Toolbar */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px' }}>
                <Search size={16} style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search user name/email..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '13px',
                    outline: 'none',
                    width: '180px',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                <button
                  onClick={() => {
                    setActiveTab('volunteers');
                    const filtered = volunteers.filter(v => `${v.firstName} ${v.lastName} ${v.email}`.toLowerCase().includes(rosterSearch.toLowerCase()));
                    setSelectedRosterUser(filtered[0] || null);
                  }}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '6px',
                    background: activeTab === 'volunteers' ? '#fff' : 'transparent',
                    boxShadow: activeTab === 'volunteers' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    color: activeTab === 'volunteers' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  Volunteers ({volunteers.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('coordinators');
                    const filtered = coordinators.filter(c => `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(rosterSearch.toLowerCase()));
                    setSelectedRosterUser(filtered[0] || null);
                  }}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '6px',
                    background: activeTab === 'coordinators' ? '#fff' : 'transparent',
                    boxShadow: activeTab === 'coordinators' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    color: activeTab === 'coordinators' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  Coordinators ({coordinators.length})
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }} className="responsive-grid">
            {/* Left side: List of Users */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {(activeTab === 'volunteers' 
                ? volunteers.filter(v => `${v.firstName} ${v.lastName} ${v.email}`.toLowerCase().includes(rosterSearch.toLowerCase()))
                : coordinators.filter(c => `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(rosterSearch.toLowerCase()))
              ).length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '40px' }}>
                  No active {activeTab} found.
                </div>
              ) : (
                (activeTab === 'volunteers' 
                  ? volunteers.filter(v => `${v.firstName} ${v.lastName} ${v.email}`.toLowerCase().includes(rosterSearch.toLowerCase()))
                  : coordinators.filter(c => `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(rosterSearch.toLowerCase()))
                ).map(u => (
                  <button
                    key={u._id}
                    onClick={() => setSelectedRosterUser(u)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      background: selectedRosterUser?._id === u._id ? '#f0f9ff' : '#f8fafc',
                      border: selectedRosterUser?._id === u._id ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                      padding: '12px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    {u.profileImage ? (
                      <img src={u.profileImage} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gradient-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>
                        {u.firstName?.[0]}
                      </div>
                    )}
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: selectedRosterUser?._id === u._id ? 'var(--color-accent-blue)' : 'inherit', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {u.firstName} {u.lastName}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {u.email}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      background: u.status === 'active' ? 'rgba(22, 163, 74, 0.1)' : u.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: u.status === 'active' ? 'var(--color-accent-green)' : u.status === 'pending' ? 'var(--color-accent-amber)' : 'var(--color-accent-rose)'
                    }}>
                      {u.status}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Right side: Detailed Profile View */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedRosterUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Profile Header */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {selectedRosterUser.profileImage ? (
                      <img src={selectedRosterUser.profileImage} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} />
                    ) : (
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--gradient-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        {selectedRosterUser.firstName?.[0]}
                      </div>
                    )}
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{selectedRosterUser.firstName} {selectedRosterUser.lastName}</h4>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{selectedRosterUser.email}</span>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        <span style={{ fontSize: '10px', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--color-accent-blue)', padding: '2px 8px', borderRadius: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                          {selectedRosterUser.role}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          background: selectedRosterUser.status === 'active' ? 'rgba(22, 163, 74, 0.1)' : selectedRosterUser.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: selectedRosterUser.status === 'active' ? 'var(--color-accent-green)' : selectedRosterUser.status === 'pending' ? 'var(--color-accent-amber)' : 'var(--color-accent-rose)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {selectedRosterUser.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0' }} />

                  {/* Profile Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', display: 'block', textTransform: 'uppercase' }}>Contact Number</span>
                      <p style={{ fontWeight: '600', marginTop: '2px' }}>{selectedRosterUser.phone || '--'}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', display: 'block', textTransform: 'uppercase' }}>Member Since</span>
                      <p style={{ fontWeight: '600', marginTop: '2px' }}>
                        {new Date(selectedRosterUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', display: 'block', textTransform: 'uppercase' }}>Profile Bio</span>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px', fontSize: '13px', lineHeight: '1.4' }}>
                      {selectedRosterUser.bio || 'No profile bio provided.'}
                    </p>
                  </div>

                  {/* Skills Section */}
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>Skills & Interests</span>
                    {selectedRosterUser.skills && selectedRosterUser.skills.length > 0 ? (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {selectedRosterUser.skills.map((s, idx) => (
                          <span key={idx} style={{ fontSize: '11px', background: '#e2e8f0', color: 'var(--color-text-secondary)', padding: '2px 8px', borderRadius: '4px' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>None listed.</p>
                    )}
                  </div>

                  {/* Availability Section */}
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>Availability</span>
                    {selectedRosterUser.availability && selectedRosterUser.availability.length > 0 ? (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {selectedRosterUser.availability.map((a, idx) => (
                          <span key={idx} style={{ fontSize: '11px', background: '#dcfce7', color: 'var(--color-accent-green)', padding: '2px 8px', borderRadius: '4px' }}>
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>None listed.</p>
                    )}
                  </div>

                  <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', margin: '8px 0' }} />

                  {/* Admin Actions controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Modify Role</span>
                      <select
                        value={selectedRosterUser.role}
                        onChange={(e) => handleUpdateUserRole(selectedRosterUser.clerkUserId, e.target.value)}
                        disabled={actionLoading}
                        style={{
                          background: '#fff',
                          border: '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="volunteer">Volunteer</option>
                        <option value="coordinator">Coordinator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      {selectedRosterUser.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-success"
                            style={{ flexGrow: 1, padding: '8px 16px', fontSize: '12px' }}
                            onClick={() => handleVerifyVolunteerStatus(selectedRosterUser.clerkUserId, 'active')}
                            disabled={actionLoading}
                          >
                            <Check size={14} /> Approve User
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ flexGrow: 1, padding: '8px 16px', fontSize: '12px', color: 'var(--color-accent-rose)' }}
                            onClick={() => handleVerifyVolunteerStatus(selectedRosterUser.clerkUserId, 'rejected')}
                            disabled={actionLoading}
                          >
                            <X size={14} /> Reject
                          </button>
                        </>
                      )}

                      {selectedRosterUser.status === 'active' && (
                        <button
                          className="btn btn-secondary"
                          style={{ width: '100%', padding: '8px 16px', fontSize: '12px', color: 'var(--color-accent-rose)' }}
                          onClick={() => handleVerifyVolunteerStatus(selectedRosterUser.clerkUserId, 'blocked')}
                          disabled={actionLoading}
                        >
                          <Ban size={14} /> Block Account
                        </button>
                      )}

                      {(selectedRosterUser.status === 'blocked' || selectedRosterUser.status === 'rejected') && (
                        <button
                          className="btn btn-primary"
                          style={{ width: '100%', padding: '8px 16px', fontSize: '12px' }}
                          onClick={() => handleVerifyVolunteerStatus(selectedRosterUser.clerkUserId, 'active')}
                          disabled={actionLoading}
                        >
                          <CheckCircle size={14} /> Activate Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', textAlign: 'center', padding: '40px' }}>
                  Select a user from the roster list to inspect details.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    );
  };

  const renderDashboard = () => {
    if (dbUser.role === 'admin') return renderAdmin();
    if (dbUser.role === 'coordinator') return renderCoordinator();
    return renderVolunteer();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Messages */}
      {message.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          background: message.type === 'success' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? 'var(--color-accent-green)' : 'var(--color-accent-rose)',
          border: message.type === 'success' ? '1px solid rgba(22, 163, 74, 0.15)' : '1px solid rgba(239, 68, 68, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Detail info Modal for campaign */}
      {detailCampaign && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 300
        }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{detailCampaign.title}</h3>
              <button onClick={() => setDetailCampaign(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '14px', lineHeight: '1.5' }}>
              {detailCampaign.description}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
              <div><strong>Category:</strong> {detailCampaign.category}</div>
              <div><strong>Address:</strong> {detailCampaign.location.address}</div>
              <div><strong>Dates:</strong> {new Date(detailCampaign.startDate).toLocaleDateString()} - {new Date(detailCampaign.endDate).toLocaleDateString()}</div>
              <div><strong>Target Volunteers:</strong> {detailCampaign.targetVolunteers}</div>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setDetailCampaign(null)}>Close</button>
          </div>
        </div>
      )}

      {renderDashboard()}

      <style>{`
        @media (max-width: 992px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
