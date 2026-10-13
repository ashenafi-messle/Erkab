'use client';

import React, { useState } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { useAuth } from '../../../context/AuthContext';
import {
  Settings,
  Shield,
  Bell,
  Sliders,
  CheckCircle2,
  Lock,
  User
} from 'lucide-react';

export default function SubAdminSettingsPage() {
  const { user } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoRefreshSecs, setAutoRefreshSecs] = useState('30');
  const [ticketNotify, setTicketNotify] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AdminShell>
      <div className="mb-4">
        <h1 className="h4 fw-bold text-dark mb-1">Delegated Administrative Settings</h1>
        <p className="text-muted small mb-0">
          Operational preferences and monitoring tolerances delegated to Sub Admin personnel.
        </p>
      </div>

      {savedSuccess && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-4">
          <CheckCircle2 size={16} />
          <span>Operational preferences saved successfully.</span>
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="admin-card p-4">
            <h2 className="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Sliders size={18} className="text-primary" />
              <span>Monitoring & Alert Controls</span>
            </h2>

            <form onSubmit={handleSave}>
              <div className="mb-3 border-bottom pb-3">
                <div className="form-check form-switch mb-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="emailAlerts"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                  />
                  <label className="form-check-label fw-semibold text-dark small" htmlFor="emailAlerts">
                    Critical Outage Notifications
                  </label>
                </div>
                <p className="text-muted small mb-0 ps-4">
                  Forward immediate webhook alerts to your registered email when subsystem latency exceeds 500ms or 5xx errors occur.
                </p>
              </div>

              <div className="mb-3 border-bottom pb-3">
                <div className="form-check form-switch mb-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="ticketNotify"
                    checked={ticketNotify}
                    onChange={(e) => setTicketNotify(e.target.checked)}
                  />
                  <label className="form-check-label fw-semibold text-dark small" htmlFor="ticketNotify">
                    Student Inquiry Queue Alerts
                  </label>
                </div>
                <p className="text-muted small mb-0 ps-4">
                  Emit in-portal badge alerts whenever high-priority support feedback is submitted.
                </p>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark small" htmlFor="refreshInterval">
                  Telemetry Auto-Polling Interval
                </label>
                <select
                  id="refreshInterval"
                  className="form-select form-select-sm"
                  style={{ maxWidth: 220 }}
                  value={autoRefreshSecs}
                  onChange={(e) => setAutoRefreshSecs(e.target.value)}
                >
                  <option value="15">Every 15 Seconds</option>
                  <option value="30">Every 30 Seconds (Standard)</option>
                  <option value="60">Every 60 Seconds</option>
                  <option value="manual">Manual Refresh Only</option>
                </select>
                <div className="form-text small text-muted">
                  Controls the background refresh polling rate on the health and performance dashboards.
                </div>
              </div>

              <button type="submit" className="btn btn-sm btn-primary px-3">
                Save Preferences
              </button>
            </form>
          </div>
        </div>

        {/* Delegated Scope Boundary Card */}
        <div className="col-12 col-lg-4">
          <div className="admin-card p-4">
            <h2 className="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Shield size={18} className="text-warning" />
              <span>Assigned Security Scope</span>
            </h2>
            <div className="p-3 bg-light rounded border mb-3">
              <span className="text-muted small d-block">Operator Account</span>
              <span className="fw-bold text-dark small d-block">{user?.fullName || 'Sub Admin'}</span>
              <span className="font-monospace small text-muted">{user?.email}</span>
            </div>

            <h3 className="small fw-bold text-dark mb-2">Granted Operational Authorities:</h3>
            <ul className="list-unstyled small text-muted mb-3">
              <li className="d-flex align-items-center gap-2 mb-1">
                <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                <span>Real-time infrastructure health probe</span>
              </li>
              <li className="d-flex align-items-center gap-2 mb-1">
                <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                <span>Security event and audit trail inspection</span>
              </li>
              <li className="d-flex align-items-center gap-2 mb-1">
                <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                <span>Student inquiry & feedback resolution</span>
              </li>
              <li className="d-flex align-items-center gap-2 mb-1">
                <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                <span>Maintenance cache & vacuum triggering</span>
              </li>
            </ul>

            <h3 className="small fw-bold text-dark mb-2">Restricted Super Admin Privileges:</h3>
            <ul className="list-unstyled small text-muted mb-0">
              <li className="d-flex align-items-center gap-2 mb-1 text-danger">
                <Lock size={14} className="flex-shrink-0" />
                <span>Staff user creation & role promotion</span>
              </li>
              <li className="d-flex align-items-center gap-2 mb-1 text-danger">
                <Lock size={14} className="flex-shrink-0" />
                <span>Financial donation ledger modifications</span>
              </li>
              <li className="d-flex align-items-center gap-2 mb-1 text-danger">
                <Lock size={14} className="flex-shrink-0" />
                <span>Public news article deletion</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
