import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FormErrorProps {
  message: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className="alert alert-danger d-flex align-items-center gap-2 mb-4 text-start small"
      role="alert"
    >
      <AlertTriangle size={18} className="flex-shrink-0" />
      <div>{message}</div>
    </div>
  );
}
