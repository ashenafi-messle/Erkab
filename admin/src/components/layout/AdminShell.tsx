'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { AdminRole } from '../../lib/types/auth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AdminShellProps {
  children: React.ReactNode;
  requiredRole?: AdminRole;
}

export const AdminShell: React.FC<AdminShellProps> = ({ children, requiredRole }) => {
  const { user, isLoading, isSuperAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="admin-shell">
        <div className="admin-sidebar d-none d-lg-flex" style={{ width: 260 }}>
          <div className="sidebar-brand">
            <div className="bg-primary text-white rounded-3 placeholder" style={{ width: 36, height: 36 }} />
          </div>
          <div className="p-3">
            <div className="placeholder-glow">
              <div className="placeholder col-10 bg-secondary bg-opacity-25 rounded mb-3" style={{ height: 28 }} />
              <div className="placeholder col-8 bg-secondary bg-opacity-25 rounded mb-3" style={{ height: 28 }} />
              <div className="placeholder col-9 bg-secondary bg-opacity-25 rounded mb-3" style={{ height: 28 }} />
              <div className="placeholder col-7 bg-secondary bg-opacity-25 rounded mb-3" style={{ height: 28 }} />
            </div>
          </div>
        </div>
        <div className="admin-main-wrapper" style={{ marginLeft: 260 }}>
          <div className="admin-topbar bg-white border-bottom">
            <div className="placeholder-glow">
              <span className="placeholder col-4 bg-secondary bg-opacity-10 rounded" style={{ height: 20 }} />
            </div>
          </div>
          <div className="admin-page-container p-4">
            <div className="placeholder-glow mb-4">
              <div className="placeholder col-3 bg-secondary bg-opacity-15 rounded mb-2" style={{ height: 24 }} />
              <div className="placeholder col-5 bg-secondary bg-opacity-10 rounded" style={{ height: 16 }} />
            </div>
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-xl-3"><div className="placeholder col-12 bg-white rounded-3 shadow-sm border p-4" style={{ height: 110 }} /></div>
              <div className="col-12 col-sm-6 col-xl-3"><div className="placeholder col-12 bg-white rounded-3 shadow-sm border p-4" style={{ height: 110 }} /></div>
              <div className="col-12 col-sm-6 col-xl-3"><div className="placeholder col-12 bg-white rounded-3 shadow-sm border p-4" style={{ height: 110 }} /></div>
              <div className="col-12 col-sm-6 col-xl-3"><div className="placeholder col-12 bg-white rounded-3 shadow-sm border p-4" style={{ height: 110 }} /></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Role validation check
  const isUnauthorized = requiredRole === 'SUPER_ADMIN' && !isSuperAdmin;

  return (
    <div className="admin-shell">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className={`admin-main-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AdminTopBar onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        <main className="admin-page-container">
          {isUnauthorized ? (
            <div className="card border-danger shadow-sm p-4 text-center my-4">
              <div className="d-flex justify-content-center mb-3">
                <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-circle">
                  <ShieldAlert size={48} />
                </div>
              </div>
              <h2 className="h4 fw-bold text-danger">Access Restricted</h2>
              <p className="text-muted mx-auto" style={{ maxWidth: 480 }}>
                This section requires authoritative <strong>Super Admin</strong> privileges. Your account (
                {user.email}) is registered as <strong>{user.role}</strong> and cannot perform organization-level governance actions.
              </p>
              <div className="mt-3">
                <Link href="/sub-admin/dashboard" className="btn btn-primary d-inline-flex align-items-center gap-2">
                  <ArrowLeft size={16} />
                  <span>Return to Operational Dashboard</span>
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};
