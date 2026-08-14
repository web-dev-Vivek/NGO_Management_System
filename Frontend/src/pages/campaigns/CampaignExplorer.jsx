import React from 'react';
import { CalendarDays } from 'lucide-react';

const CampaignExplorer = () => {
  return (
    <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
      <CalendarDays size={48} style={{ color: 'var(--color-accent-blue)', marginBottom: '16px' }} />
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Campaign Explorer</h2>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
        This module will manage active NGO campaigns, category feeds, and registrations. It will be fully implemented in **Part 2** of the development plan.
      </p>
    </div>
  );
};

export default CampaignExplorer;
