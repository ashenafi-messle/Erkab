'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1055 }} onClick={onClose} />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        style={{ zIndex: 1060 }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content shadow-lg border-0 rounded-3">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                {variant === 'danger' ? (
                  <AlertTriangle className="text-danger" size={20} />
                ) : variant === 'warning' ? (
                  <AlertTriangle className="text-warning" size={20} />
                ) : (
                  <CheckCircle className="text-primary" size={20} />
                )}
                <span>{title}</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
                disabled={loading}
              />
            </div>
            <div className="modal-body py-3">
              <p className="text-muted mb-0">{message}</p>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-sm btn-light border px-3"
                onClick={onClose}
                disabled={loading}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`btn btn-sm btn-${variant} px-3 d-inline-flex align-items-center gap-2`}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading && <span className="spinner-border spinner-border-sm" role="status" />}
                <span>{confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
