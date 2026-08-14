import React from 'react';
import { Award } from 'lucide-react';

const CertificatesPage = () => {
  return (
    <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
      <Award size={48} style={{ color: 'var(--color-accent-emerald)', marginBottom: '16px' }} />
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Cryptographic Certificate Vault</h2>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
        This module will manage cryptographic certificate generation, download widgets, and public validation lookups. It will be fully implemented in **Part 4** of the development plan.
      </p>
    </div>
  );
};

export default CertificatesPage;
