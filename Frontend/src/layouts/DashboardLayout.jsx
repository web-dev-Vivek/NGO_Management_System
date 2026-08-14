import React from 'react';
import { useAuth, SignOutButton } from '@clerk/clerk-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDbUser } from '../context/UserContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  CheckSquare, 
  Award, 
  Users, 
  UserCircle, 
  LogOut,
  Menu,
  X,
  Lock
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { dbUser, loading } = useDbUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const getMenuLinks = () => {
    if (!dbUser) return [];

    const baseLinks = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/campaigns', label: 'Campaigns', icon: CalendarDays },
      { path: '/tasks', label: 'Tasks', icon: CheckSquare },
      { path: '/certificates', label: 'Certificates', icon: Award },
    ];

    if (dbUser.role === 'admin' || dbUser.role === 'coordinator') {
      baseLinks.push({ path: '/users', label: 'Directory', icon: Users });
    }

    baseLinks.push({ path: '/profile', label: 'My Profile', icon: UserCircle });

    return baseLinks;
  };

  const links = getMenuLinks();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'var(--font-heading)'
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: '500',
          letterSpacing: '0.05em',
          color: 'var(--color-accent-blue)'
        }}>
          Loading Session...
        </div>
      </div>
    );
  }

  // Account pending validation page
  if (dbUser && dbUser.status === 'pending') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div className="glass-card" style={{ maxWidth: '500px', width: '100%' }}>
          <Lock size={48} style={{ color: 'var(--color-accent-amber)', marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '12px' }}>Registration Pending</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            Hello, <strong>{dbUser.firstName}</strong>. Your account has been registered successfully but requires administrator approval before you can access the dashboards.
          </p>
          <button className="btn btn-secondary" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Account blocked validation page
  if (dbUser && dbUser.status === 'blocked') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div className="glass-card" style={{ maxWidth: '500px', width: '100%' }}>
          <Lock size={48} style={{ color: 'var(--color-accent-rose)', marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '12px' }}>Account Suspended</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            Your access to the NGO Management System has been restricted. Please reach out to administration if you believe this is in error.
          </p>
          <button className="btn btn-secondary" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile Header Nav */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        background: 'var(--color-bg-base)',
        borderBottom: '1px solid var(--glass-border)',
        zIndex: 50
      }} className="mobile-header">
        <h1 style={{ fontSize: '18px', fontWeight: '700', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          NGO Portal
        </h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`} style={{
        width: '260px',
        background: 'var(--glass-bg)',
        borderRight: '1px solid var(--glass-border)',
        backdropFilter: 'var(--backdrop-blur)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        zIndex: 40,
        transition: 'var(--transition-smooth)'
      }}>
        {/* Brand Logo */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Unity NGO
          </h1>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginTop: '4px' }}>
            Management Portal
          </span>
        </div>

        {/* User Mini Card */}
        {dbUser && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)',
            marginBottom: '30px'
          }}>
            {dbUser.profileImage ? (
              <img src={dbUser.profileImage} alt="User avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {dbUser.firstName?.[0]}
              </div>
            )}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600' }}>{dbUser.firstName}</h3>
              <span style={{ 
                fontSize: '11px', 
                color: dbUser.role === 'admin' ? 'var(--color-accent-purple)' : dbUser.role === 'coordinator' ? 'var(--color-accent-blue)' : 'var(--color-accent-emerald)',
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.05em'
              }}>
                {dbUser.role}
              </span>
            </div>
          </div>
        )}

        {/* Menu Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  color: isActive ? '#fff' : 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: isActive ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                  transition: 'var(--transition-smooth)'
                }}
                className="sidebar-link"
              >
                <Icon size={18} style={{ color: isActive ? 'var(--color-accent-blue)' : 'inherit' }} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button 
          onClick={handleLogout} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'left',
            marginTop: 'auto'
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{
        flexGrow: 1,
        padding: '40px',
        overflowY: 'auto',
        height: '100vh'
      }} className="main-content">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>

      {/* Dynamic Styling override for sidebar mobile responsiveness */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-header {
            display: flex !important;
          }
          .dashboard-sidebar {
            position: fixed !important;
            top: 60px;
            bottom: 0;
            left: -260px;
            width: 260px;
            display: flex !important;
          }
          .dashboard-sidebar.open {
            left: 0 !important;
          }
          .main-content {
            padding: 80px 20px 40px 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
