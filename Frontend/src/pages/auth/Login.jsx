import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const Login = () => {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--gradient-glow)',
      backgroundAttachment: 'fixed'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Unity NGO
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Sign in to access your volunteer or coordinator account</p>
        </div>

        <SignIn 
          signUpUrl="/register"
          redirectUrl="/dashboard"
          appearance={{
            elements: {
              card: {
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--backdrop-blur)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
                borderRadius: '16px'
              },
              headerTitle: { color: 'var(--color-text-primary)' },
              headerSubtitle: { color: 'var(--color-text-secondary)' },
              socialButtonsBlockButton: {
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                color: 'var(--color-text-primary)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)'
                }
              },
              socialButtonsBlockButtonText: { color: 'var(--color-text-primary)' },
              dividerLine: { background: 'var(--glass-border)' },
              dividerText: { color: 'var(--color-text-muted)' },
              formFieldLabel: { color: 'var(--color-text-secondary)' },
              formFieldInput: {
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--glass-border)',
                color: '#fff'
              },
              formButtonPrimary: {
                background: 'var(--gradient-primary)',
                '&:hover': {
                  opacity: 0.9
                }
              },
              footerActionText: { color: 'var(--color-text-secondary)' },
              footerActionLink: { color: 'var(--color-accent-blue)' }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Login;
