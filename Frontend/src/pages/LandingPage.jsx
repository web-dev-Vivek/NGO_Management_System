import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ShieldCheck, Calendar, Users, Award, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const { isSignedIn } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        borderBottom: '1px solid var(--glass-border)',
        backdropFilter: 'var(--backdrop-blur)',
        background: 'rgba(8, 11, 17, 0.6)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Unity NGO
        </h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {isSignedIn ? (
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ fontSize: '13px' }}>Sign In</Link>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: '13px' }}>Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '100px 40px 80px 40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        background: 'radial-gradient(circle at top, rgba(99, 102, 241, 0.1) 0%, transparent 50%)'
      }}>
        <div style={{ 
          background: 'rgba(99, 102, 241, 0.1)', 
          color: 'var(--color-accent-blue)', 
          padding: '6px 16px', 
          borderRadius: '20px', 
          fontSize: '12px', 
          fontWeight: '600',
          letterSpacing: '0.05em',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          EMPOWERING COMMUNITIES TOGETHER
        </div>
        <h2 style={{ fontSize: '56px', fontWeight: '800', lineHeight: 1.1, maxWidth: '800px', letterSpacing: '-0.03em' }}>
          Streamline NGO Campaigns & Verify Volunteer Contributions
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '18px', maxWidth: '640px', lineHeight: 1.6 }}>
          Join campaigns, log active service hours, assign custom tasks, and issue cryptographic certificates of appreciation.
        </p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
            Volunteer Now <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: '15px' }}>
            Coordinator Portal
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <h3 style={{ textAlign: 'center', fontSize: '28px', fontWeight: '700', marginBottom: '40px' }}>Unified Management Platform</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          <div className="glass-card">
            <Calendar size={32} style={{ color: 'var(--color-accent-blue)', marginBottom: '16px' }} />
            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Campaign Coordination</h4>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              Coordinators configure social and environment relief campaigns, target hours, and list opportunities.
            </p>
          </div>

          <div className="glass-card">
            <Users size={32} style={{ color: 'var(--color-accent-purple)', marginBottom: '16px' }} />
            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Role-Based Allocations</h4>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              Specific features and access restrictions tailored for Volunteers, Coordinators, and system Administrators.
            </p>
          </div>

          <div className="glass-card">
            <Award size={32} style={{ color: 'var(--color-accent-emerald)', marginBottom: '16px' }} />
            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Verifiable Certificates</h4>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              Issue digital certificates containing secure verification hashes, checkable via public lookup routes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        padding: '30px 40px',
        borderTop: '1px solid var(--glass-border)',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '13px'
      }}>
        © {new Date().getFullYear()} Unity NGO Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
