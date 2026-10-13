'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'default' | 'transaction' | 'system';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'default' }) => {
  const norm = (status || '').toUpperCase();

  let className = 'badge-status ';
  let label = status;

  if (norm === 'ACTIVE' || norm === 'APPROVED' || norm === 'HEALTHY' || norm === 'RESOLVED' || norm === 'PUBLISHED' || norm === 'ONLINE') {
    className += 'active';
  } else if (norm === 'PENDING' || norm === 'IN_PROGRESS' || norm === 'WARNING' || norm === 'INVESTIGATING' || norm === 'SCHEDULED') {
    className += 'pending';
  } else if (norm === 'INACTIVE' || norm === 'REJECTED' || norm === 'CRITICAL' || norm === 'ERROR' || norm === 'DEACTIVATED' || norm === 'OFFLINE' || norm === 'FAILED') {
    className += 'inactive';
  } else if (norm === 'DEMO') {
    className += 'demo';
    label = 'DEMO SIMULATION';
  } else if (norm === 'REAL') {
    className += 'real';
    label = 'REAL FINANCIAL';
  } else {
    className += 'pending';
  }

  return <span className={className}>{label}</span>;
};
