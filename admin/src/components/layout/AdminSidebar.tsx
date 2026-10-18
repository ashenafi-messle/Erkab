'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Handshake,
  HeartHandshake,
  Newspaper,
  ShieldAlert,
  HelpCircle,
  Activity,
  LineChart,
  Wrench,
  Settings,
  FileText,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Mail
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { user, isSuperAdmin } = useAuth();

  const superAdminNav = [
    { label: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
    { label: 'Applications', href: '/super-admin/applications', icon: GraduationCap },
    { label: 'Contact Messages', href: '/super-admin/messages', icon: Mail },
    { label: 'Training Programs', href: '/super-admin/programs', icon: BookOpen },
    { label: 'Partnerships', href: '/super-admin/partnerships', icon: Handshake },
    { label: 'Donations & Payments', href: '/super-admin/donations', icon: HeartHandshake },
    { label: 'News & Updates', href: '/super-admin/news', icon: Newspaper },
    { label: 'Admin Users & Roles', href: '/super-admin/users', icon: Users },
    { label: 'Reports & Audits', href: '/super-admin/reports', icon: FileText },
  ];

  const subAdminNav = [
    { label: 'Operational Dashboard', href: '/sub-admin/dashboard', icon: LayoutDashboard },
    { label: 'Security & Audit Logs', href: '/sub-admin/security', icon: ShieldAlert },
    { label: 'Support & Feedback', href: '/sub-admin/support', icon: HelpCircle },
    { label: 'System Health', href: '/sub-admin/health', icon: Activity },
    { label: 'Performance & Errors', href: '/sub-admin/performance', icon: LineChart },
    { label: 'Maintenance & Incidents', href: '/sub-admin/maintenance', icon: Wrench },
    { label: 'Delegated Settings', href: '/sub-admin/settings', icon: Settings },
  ];

  const currentNav = isSuperAdmin ? superAdminNav : subAdminNav;

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-backdrop d-lg-none"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'show-mobile' : ''
        }`}
      >
        {/* Brand header */}
        <div className="sidebar-brand justify-content-between">
          <Link
            href={isSuperAdmin ? '/super-admin/dashboard' : '/sub-admin/dashboard'}
            className="text-decoration-none d-flex align-items-center gap-2 overflow-hidden"
          >
            <div
              className="d-flex align-items-center justify-content-center bg-primary text-white rounded-3 flex-shrink-0"
              style={{ width: 36, height: 36, fontWeight: 700, fontSize: '1.1rem' }}
            >
              E
            </div>
            {!collapsed && (
              <div className="d-flex flex-column lh-1 text-truncate">
                <span className="fw-bold text-white fs-6">ERKAB</span>
                <span className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                  Admin Portal
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            className="btn btn-sm btn-link text-white-50 p-1 d-none d-lg-flex"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* User Role Badge */}
        {!collapsed && user && (
          <div className="px-3 py-2 bg-black bg-opacity-25 border-bottom border-secondary border-opacity-25">
            <div className="d-flex align-items-center gap-2">
              <Shield
                size={16}
                className={isSuperAdmin ? 'text-cyan' : 'text-warning'}
                style={{ color: isSuperAdmin ? '#0dcaf0' : '#ffc107' }}
              />
              <div className="d-flex flex-column">
                <span className="small text-white fw-semibold text-truncate" style={{ maxWidth: 170 }}>
                  {user.fullName || user.email}
                </span>
                <span
                  className="badge bg-opacity-25 text-white"
                  style={{
                    fontSize: '0.65rem',
                    backgroundColor: isSuperAdmin ? 'rgba(13, 202, 240, 0.25)' : 'rgba(255, 193, 7, 0.25)',
                    alignSelf: 'flex-start',
                  }}
                >
                  {isSuperAdmin ? 'SUPER ADMIN' : 'SUB ADMIN'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <div className="sidebar-nav-container">
          {!collapsed && (
            <div className="nav-section-title">
              {isSuperAdmin ? 'ORGANIZATION MANAGEMENT' : 'SYSTEM OPERATIONS'}
            </div>
          )}

          <nav className="nav flex-column">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={19} className="flex-shrink-0" />
                  {!collapsed && <span className="text-truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer with portal version */}
        <div className="admin-sidebar-footer text-center">
          {!collapsed ? (
            <div className="small text-white-50" style={{ fontSize: '0.72rem' }}>
              Erkab EdTech Platform v2.4
            </div>
          ) : (
            <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>v2.4</span>
          )}
        </div>
      </aside>
    </>
  );
};
