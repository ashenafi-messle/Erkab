'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Bell,
  LogOut,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '../../lib/api/client';

interface AdminTopBarProps {
  onToggleMobile: () => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ onToggleMobile }) => {
  const pathname = usePathname();
  const { user, logout, isSuperAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    // Probe backend health
    apiClient('/health')
      .then(() => setBackendHealthy(true))
      .catch(() => setBackendHealthy(false));
  }, []);

  // Format breadcrumbs from pathname
  const formatBreadcrumbs = () => {
    if (!pathname) return [{ label: 'Admin', path: '/' }];
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part: string, idx: number) => {
      const url = '/' + parts.slice(0, idx + 1).join('/');
      const formatted = part
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
      return { label: formatted, path: url };
    });
  };

  const breadcrumbs = formatBreadcrumbs();
  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard';

  return (
    <header className="admin-topbar">
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-sm btn-light d-lg-none p-1 text-secondary"
          onClick={onToggleMobile}
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <div className="d-flex flex-column">
          <nav aria-label="breadcrumb" className="d-none d-sm-block">
            <ol className="breadcrumb mb-0" style={{ fontSize: '0.78rem' }}>
              {breadcrumbs.map((bc: { label: string; path: string }, i: number) => (
                <li
                  key={bc.path}
                  className={`breadcrumb-item ${
                    i === breadcrumbs.length - 1 ? 'active text-primary fw-semibold' : 'text-muted'
                  }`}
                >
                  {bc.label}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="h5 mb-0 fw-bold text-dark text-truncate" style={{ fontSize: '1.15rem' }}>
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 gap-sm-3">
        {/* Backend health indicator */}
        <div
          className="d-none d-md-flex align-items-center gap-1 px-2 py-1 rounded-pill small border"
          style={{
            fontSize: '0.75rem',
            backgroundColor: backendHealthy === true ? '#e8f5e9' : backendHealthy === false ? '#ffebee' : '#f5f5f5',
            borderColor: backendHealthy === true ? '#a5d6a7' : backendHealthy === false ? '#ef9a9a' : '#e0e0e0',
          }}
          title={backendHealthy === true ? 'Backend API connected' : 'Backend API unreachable'}
        >
          {backendHealthy === true ? (
            <>
              <CheckCircle2 size={13} className="text-success" />
              <span className="text-success fw-medium">API Online</span>
            </>
          ) : backendHealthy === false ? (
            <>
              <AlertCircle size={13} className="text-danger" />
              <span className="text-danger fw-medium">API Offline</span>
            </>
          ) : (
            <span className="text-muted">Checking API...</span>
          )}
        </div>

        {/* Public Website Link */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline-secondary d-none d-sm-inline-flex align-items-center gap-1"
          style={{ fontSize: '0.78rem' }}
          title="Open Erkab Public Website"
        >
          <ExternalLink size={13} />
          <span>Public Site</span>
        </a>

        {/* User profile dropdown */}
        <div className="position-relative">
          <button
            type="button"
            className="btn btn-sm btn-light border d-flex align-items-center gap-2 p-1 pe-2 rounded-pill"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
          >
            <div
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 30, height: 30, fontSize: '0.82rem', fontWeight: 600 }}
            >
              {user?.fullName ? user.fullName[0].toUpperCase() : 'A'}
            </div>
            <div className="d-none d-md-flex flex-column text-start lh-1">
              <span className="small fw-semibold text-dark text-truncate" style={{ maxWidth: 120 }}>
                {user?.fullName || user?.email}
              </span>
              <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                {isSuperAdmin ? 'Super Admin' : 'Sub Admin'}
              </span>
            </div>
          </button>

          {dropdownOpen && (
            <div
              className="dropdown-menu dropdown-menu-end show shadow-sm border mt-2 py-2"
              style={{
                position: 'absolute',
                right: 0,
                minWidth: '220px',
                zIndex: 1050,
              }}
            >
              <div className="px-3 py-2 border-bottom">
                <p className="mb-0 small fw-bold text-dark">{user?.fullName}</p>
                <p className="mb-0 text-muted small text-truncate">{user?.email}</p>
                <span
                  className="badge mt-1"
                  style={{
                    backgroundColor: isSuperAdmin ? '#0dcaf0' : '#ffc107',
                    color: '#071927',
                    fontSize: '0.68rem',
                  }}
                >
                  {user?.role}
                </span>
              </div>

              <div className="px-3 py-2 border-bottom small text-muted">
                <div>Organization: Erkab EdTech</div>
                <div>Status: Active</div>
              </div>

              <button
                type="button"
                className="dropdown-item text-danger d-flex align-items-center gap-2 py-2 small"
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
