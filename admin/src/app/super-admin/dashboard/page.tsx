'use client';

import React, { useEffect, useState } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiClient } from '../../../lib/api/client';
import {
  GraduationCap,
  Users,
  BookOpen,
  Handshake,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  Shield,
  FileCheck
} from 'lucide-react';
import Link from 'next/link';

interface DashboardSummary {
  counts: {
    students: number;
    trainers: number;
    tutors: number;
    programs: number;
    partnerships: number;
    donations: number;
    news: number;
  };
  recentStudents: any[];
  recentPartnerships: any[];
  recentDonations: any[];
  recentAuditLogs: any[];
}

export default function SuperAdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        const res = await apiClient<{ success: boolean; data: DashboardSummary }>(
          '/admin/dashboard/summary'
        );
        if (res.data) {
          setSummary(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load organization metrics.');
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  return (
    <AdminShell requiredRole="SUPER_ADMIN">
      <div className="mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Organization Governance Overview</h1>
          <p className="text-muted small mb-0">
            Real-time enrollment metrics, instructional programs, and authoritative institution health.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link href="/super-admin/applications" className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2">
            <GraduationCap size={16} />
            <span>Review Applications</span>
          </Link>
          <Link href="/super-admin/users" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2">
            <Users size={16} />
            <span>Manage Staff</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning py-2 px-3 small rounded-3 mb-4">
          {error}
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Students"
            value={loading ? '...' : summary?.counts.students ?? 0}
            subtitle="Registered applications"
            icon={GraduationCap}
            variant="blue"
            badgeText="Enrolled"
            badgePositive
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Instructional Tracks"
            value={loading ? '...' : summary?.counts.programs ?? 10}
            subtitle="Active curricula"
            icon={BookOpen}
            variant="cyan"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Partnership Requests"
            value={loading ? '...' : summary?.counts.partnerships ?? 0}
            subtitle="Institutional licenses"
            icon={Handshake}
            variant="warning"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Donations & Pledges"
            value={loading ? '...' : summary?.counts.donations ?? 0}
            subtitle="Transactions logged"
            icon={DollarSign}
            variant="success"
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Recent Student Applications */}
        <div className="col-12 col-lg-7">
          <div className="admin-card h-100">
            <div className="admin-card-header">
              <h2 className="h6 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <GraduationCap size={18} className="text-primary" />
                <span>Recent Student Applications</span>
              </h2>
              <Link href="/super-admin/applications" className="small text-decoration-none fw-medium d-inline-flex align-items-center gap-1">
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Ref #</th>
                    <th>Applicant</th>
                    <th>Track</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted small">Loading records...</td>
                    </tr>
                  ) : summary?.recentStudents && summary.recentStudents.length > 0 ? (
                    summary.recentStudents.map((app) => (
                      <tr key={app.id}>
                        <td className="fw-medium font-monospace small">{app.referenceNumber}</td>
                        <td>
                          <div className="fw-semibold text-dark small">{app.fullName}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>{app.email}</div>
                        </td>
                        <td className="small text-muted">{app.programTitle || 'Skill Track'}</td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="small text-muted">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted small">
                        No recent student applications registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Partnership Inquiries */}
        <div className="col-12 col-lg-5">
          <div className="admin-card h-100">
            <div className="admin-card-header">
              <h2 className="h6 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <Handshake size={18} className="text-warning" />
                <span>Pending Partnerships</span>
              </h2>
              <Link href="/super-admin/partnerships" className="small text-decoration-none fw-medium d-inline-flex align-items-center gap-1">
                <span>All Partners</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="admin-card-body p-0">
              {loading ? (
                <div className="p-4 text-center text-muted small">Loading partnerships...</div>
              ) : summary?.recentPartnerships && summary.recentPartnerships.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {summary.recentPartnerships.map((p) => (
                    <li key={p.id} className="list-group-item p-3">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="fw-bold text-dark small">{p.organizationName}</span>
                        <StatusBadge status={p.status || 'PENDING'} />
                      </div>
                      <div className="small text-muted mb-2">
                        Contact: {p.contactPerson} ({p.email})
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="badge bg-light text-dark border small" style={{ fontSize: '0.7rem' }}>
                          {p.partnershipType || 'Educational'}
                        </span>
                        {p.organizationLicenseDoc && (
                          <span className="badge bg-primary-subtle text-primary small d-flex align-items-center gap-1">
                            <FileCheck size={12} />
                            <span>License Verified</span>
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-muted small">
                  No partnership inquiries awaiting review.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
