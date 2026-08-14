import React from 'react';
import { CheckSquare } from 'lucide-react';

const TasksPage = () => {
  return (
    <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
      <CheckSquare size={48} style={{ color: 'var(--color-accent-purple)', marginBottom: '16px' }} />
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Task Management Console</h2>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
        This module will handle task allocations, checking-in/out, and logged hours approvals. It will be fully implemented in **Part 3** of the development plan.
      </p>
    </div>
  );
};

export default TasksPage;
