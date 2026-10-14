'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Smartphone, Sparkles, CheckCircle2, BellRing, Apple, Play } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface GetAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GetAppModal({ isOpen, onClose }: GetAppModalProps) {
  const { t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);
  const actionButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard accessibility (Escape key) and background scroll locking
  useEffect(() => {
    if (!isOpen) return;

    // Save previous overflow style
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus action button when modal opens
    const timer = setTimeout(() => {
      actionButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Trap focus inside modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="get-app-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="get-app-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="get-app-modal-title"
        aria-describedby="get-app-modal-desc"
      >
        {/* Close Icon Button */}
        <button
          type="button"
          className="get-app-modal-close"
          onClick={onClose}
          aria-label={t.common.close || 'Close'}
        >
          <X size={20} />
        </button>

        <div className="get-app-modal-body">
          {/* Header Icon / Badge Graphic */}
          <div className="get-app-icon-wrapper">
            <div className="get-app-icon-circle">
              <Smartphone size={32} className="get-app-phone-icon" />
              <span className="get-app-sparkle-badge" aria-hidden="true">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="get-app-brand-pill">
              <Image
                src="/images/logo/erkab-logo-square.jpg"
                alt="Erkab Logo"
                width={20}
                height={20}
                className="rounded-circle"
              />
              <span>{t.brand.name}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="d-flex justify-content-center mb-2">
            <span className="get-app-status-badge">
              <span className="get-app-pulse-dot" aria-hidden="true" />
              <span>{t.getAppModal.badge}</span>
            </span>
          </div>

          {/* Title */}
          <h2 id="get-app-modal-title" className="get-app-modal-title">
            {t.getAppModal.title}
          </h2>

          {/* Message Description */}
          <p id="get-app-modal-desc" className="get-app-modal-message">
            {t.getAppModal.message}
          </p>

          {/* Upcoming Platforms Preview Box */}
          <div className="get-app-platforms-box">
            <div className="get-app-platforms-title">
              <BellRing size={14} className="text-primary" />
              <span>{t.getAppModal.platformsTitle}</span>
            </div>
            <div className="row g-2 mt-1">
              <div className="col-6">
                <div className="get-app-platform-item">
                  <div className="d-flex align-items-center gap-2">
                    <Play size={16} className="text-success fill-success" />
                    <span className="fw-semibold">Google Play</span>
                  </div>
                  <span className="get-app-item-status">{t.getAppModal.badge}</span>
                </div>
              </div>
              <div className="col-6">
                <div className="get-app-platform-item">
                  <div className="d-flex align-items-center gap-2">
                    <Apple size={18} className="text-dark" />
                    <span className="fw-semibold">App Store</span>
                  </div>
                  <span className="get-app-item-status">{t.getAppModal.badge}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Web Ready Note */}
          <div className="get-app-web-note">
            <CheckCircle2 size={16} className="text-success flex-shrink-0" />
            <span>{t.getAppModal.webAccess}</span>
          </div>

          {/* Got It Action Button */}
          <div className="mt-4">
            <button
              ref={actionButtonRef}
              type="button"
              className="btn-erkab btn-erkab-lime w-100 justify-content-center py-2"
              onClick={onClose}
            >
              <span>{t.getAppModal.closeButton}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
