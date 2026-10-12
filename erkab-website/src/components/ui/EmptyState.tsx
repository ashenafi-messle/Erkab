import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="state-box">
      <div className="state-icon">
        <Icon size={28} />
      </div>
      <h3 className="h5 fw-bold mb-2">{title}</h3>
      <p className="text-muted mb-3 mx-auto" style={{ maxWidth: '450px' }}>
        {description}
      </p>
      {actionLabel && actionHref && (
        <Button href={actionHref} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
