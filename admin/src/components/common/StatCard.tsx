'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value?: string | number | null;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'cyan' | 'success' | 'warning' | 'danger' | 'navy';
  badgeText?: string;
  badgePositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  badgeText,
  badgePositive,
}) => {
  const displayValue =
    typeof value === 'number'
      ? Number.isNaN(value)
        ? '0'
        : value
      : value ?? '0';

  return (
    <div className="admin-card p-3 p-md-4 h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className="text-muted small fw-semibold text-uppercase tracking-wider">{title}</span>
        <div className={`stat-icon-wrapper ${variant}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="d-flex align-items-baseline gap-2 mb-1">
        <h3 className="h2 mb-0 fw-bold text-dark">{displayValue}</h3>
        {badgeText && (
          <span
            className={`badge ${
              badgePositive ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'
            } fw-medium small`}
            style={{ fontSize: '0.72rem' }}
          >
            {badgeText}
          </span>
        )}
      </div>
      {subtitle && <p className="mb-0 text-muted small">{subtitle}</p>}
    </div>
  );
};
