'use client';

import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon: Icon = Inbox,
  actionText,
  onAction,
}) => {
  return (
    <div className="text-center py-5 px-3">
      <div className="d-inline-flex p-3 bg-light text-muted rounded-circle mb-3 border">
        <Icon size={36} />
      </div>
      <h3 className="h6 fw-bold text-dark mb-1">{title}</h3>
      <p className="text-muted small mx-auto mb-3" style={{ maxWidth: 380 }}>
        {message}
      </p>
      {actionText && onAction && (
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};
