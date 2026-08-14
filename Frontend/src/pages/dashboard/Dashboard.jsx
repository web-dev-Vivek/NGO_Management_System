import React, { useState, useEffect } from 'react';
import { useDbUser } from '../../context/UserContext';
import { useAuth } from '@clerk/clerk-react';
import { 
  Users, 
  CalendarDays, 
  CheckSquare, 
  Award, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { dbUser } = useDbUser();
  const { getToken } = useAuth();
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    totalCampaigns: 0,
    totalTasks: 0,
    totalHours: 0,
    myHours: 0,
    myCompletedTasks: 0,
    myCampaigns: 0,
    myCertificates: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!dbUser) return;
      try {
        setLoadingStats(true);
        const token = await getToken();
        
        let loadedStats = {
          totalVolunteers: 0,
          totalCampaigns: 0,
          totalTasks: 0,
          totalHours: 0,
          myHours: 0,
          myCompletedTasks: 0,
          myCampaigns: 0,
          myCertificates: 0
        };

        if (['admin', 'coordinator'].includes(dbUser.role)) {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const result = await res.json();
          if (res.ok && result.success) {
            const data = result.data;
            loadedStats.totalVolunteers = data.totalVolunteers;
            loadedStats.totalCampaigns = data.activeCampaigns + data.pendingCampaigns + data.completedCampaigns;
            loadedStats.totalTasks = data.totalTasks;
            loadedStats.totalHours = data.totalHours;
          }
        } else {
          // Volunteer: query tasks list to calculate hours & completed tasks
          const taskRes = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const taskResult = await taskRes.json();
          
          // Query certificates to count them
          const certRes = await fetch(`${import.meta.env.VITE_API_URL}/certificates/my`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const certResult = await certRes.json();

          if (taskRes.ok && taskResult.success) {
            const vTasks = taskResult.data;
            loadedStats.myCompletedTasks = vTasks.filter(t => t.status === 'completed' || t.status === 'verified').length;
            loadedStats.myHours = vTasks.filter(t => t.status === 'verified').reduce((sum, t) => sum + (t.loggedHours || 0), 0);
            
            // Get unique campaigns they have tasks in
            const uniqueCampIds = new Set(vTasks.map(t => t.campaignId?._id).filter(Boolean));
            loadedStats.myCampaigns = uniqueCampIds.size;
          }

          if (certRes.ok && certResult.success) {
            loadedStats.myCertificates = certResult.data.length;
          }
        }
        
        setStats(loadedStats);
      } catch (err) {
        console.error('Error fetching statistics:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [getToken]);

  if (!dbUser) return null;

  // 👤 Volunteer Dashboard View
  const renderVolunteerDashboard = () => {
    const hoursTarget = 50;
    const progressPercent = Math.min(Math.round((stats.myHours / hoursTarget) * 100), 100);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Welcome Section */}
        <div className="glass-card" style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent-purple)' }}>
            <Sparkles size={18} />
            <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Welcome back</span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: '800' }}>Hello, {dbUser.firstName}!</h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px' }}>
            Thank you for dedication to making an impact. Here is your dashboard summarizing your contributions and progress.
          </p>
        </div>

        {/* Impact Progress Bar Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Volunteering Hour Milestone</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Target: {hoursTarget} total volunteer hours</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-accent-emerald)' }}>{stats.myHours} hrs</span>
              <span style={{ color: 'var(--color-text-muted)' }}> / {hoursTarget} hrs</span>
            </div>
          </div>
          
          {/* Progress track */}
          <div style={{ height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ 
              height: '100%', 
              width: `${progressPercent}%`, 
              background: 'var(--gradient-primary)',
              borderRadius: '5px',
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <span>{progressPercent}% Complete</span>
            <span>{hoursTarget - stats.myHours} hours remaining</span>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-accent-blue)' }}>
              <Clock size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hours Logged</h4>
              <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{stats.myHours} hrs</p>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--color-accent-purple)' }}>
              <CheckSquare size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed Tasks</h4>
              <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{stats.myCompletedTasks}</p>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-accent-emerald)' }}>
              <CalendarDays size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Campaigns</h4>
              <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{stats.myCampaigns}</p>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-accent-amber)' }}>
              <Award size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Certificates</h4>
              <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{stats.myCertificates}</p>
            </div>
          </div>
        </div>

        {/* Quick Links / Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/campaigns" className="btn btn-primary">Find Campaigns</Link>
          <Link to="/tasks" className="btn btn-secondary">Log Hours</Link>
        </div>
      </div>
    );
  };

  // 👥 Coordinator Dashboard View
  const renderCoordinatorDashboard = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="glass-card">
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Coordinator Console</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Manage campaign operations, register tasks, and validate volunteer attendance.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="glass-card">
            <CalendarDays size={32} style={{ color: 'var(--color-accent-blue)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Campaign Management</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '8px 0 16px 0' }}>
              Create a new campaign or update existing details and registration lists.
            </p>
            <Link to="/campaigns" className="btn btn-primary btn-secondary" style={{ width: '100%' }}>View Campaigns</Link>
          </div>

          <div className="glass-card">
            <CheckSquare size={32} style={{ color: 'var(--color-accent-purple)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Task Assignment</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '8px 0 16px 0' }}>
              Allocate and coordinate specific tasks for registered campaign volunteers.
            </p>
            <Link to="/tasks" className="btn btn-primary btn-secondary" style={{ width: '100%' }}>Manage Tasks</Link>
          </div>

          <div className="glass-card">
            <Users size={32} style={{ color: 'var(--color-accent-emerald)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Attendance Sheets</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '8px 0 16px 0' }}>
              Verify logged hours and evaluate check-in/out records.
            </p>
            <Link to="/users" className="btn btn-primary btn-secondary" style={{ width: '100%' }}>Volunteer Roster</Link>
          </div>
        </div>
      </div>
    );
  };

  // 👥 Admin Dashboard View
  const renderAdminDashboard = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Admin Dashboard</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>System governance, user authorizations, and certification control panel.</p>
          </div>
          <span style={{ 
            background: 'rgba(168, 85, 247, 0.1)', 
            color: 'var(--color-accent-purple)', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            fontSize: '12px', 
            fontWeight: '600',
            border: '1px solid rgba(168, 85, 247, 0.2)'
          }}>
            ROOT ADMIN
          </span>
        </div>

        {/* Global Statistics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <Users size={24} style={{ color: 'var(--color-accent-blue)', marginBottom: '8px' }} />
            <h4 style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Total Volunteers</h4>
            <p style={{ fontSize: '32px', fontWeight: '700', marginTop: '4px' }}>{stats.totalVolunteers}</p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center' }}>
            <CalendarDays size={24} style={{ color: 'var(--color-accent-purple)', marginBottom: '8px' }} />
            <h4 style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Campaigns Created</h4>
            <p style={{ fontSize: '32px', fontWeight: '700', marginTop: '4px' }}>{stats.totalCampaigns}</p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center' }}>
            <CheckSquare size={24} style={{ color: 'var(--color-accent-emerald)', marginBottom: '8px' }} />
            <h4 style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Tasks Registered</h4>
            <p style={{ fontSize: '32px', fontWeight: '700', marginTop: '4px' }}>{stats.totalTasks}</p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center' }}>
            <Award size={24} style={{ color: 'var(--color-accent-amber)', marginBottom: '8px' }} />
            <h4 style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Hours Verified</h4>
            <p style={{ fontSize: '32px', fontWeight: '700', marginTop: '4px' }}>{stats.totalHours} hrs</p>
          </div>
        </div>

        {/* Administrative Quick Controls */}
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} style={{ color: 'var(--color-accent-amber)' }} />
            Governance Action Panel
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/users" className="btn btn-primary">Approve New Registrations</Link>
            <Link to="/certificates" className="btn btn-secondary">Certificate Vault</Link>
          </div>
        </div>
      </div>
    );
  };

  // Main Dashboard Dispatcher
  if (dbUser.role === 'admin') return renderAdminDashboard();
  if (dbUser.role === 'coordinator') return renderCoordinatorDashboard();
  return renderVolunteerDashboard();
};

export default Dashboard;
