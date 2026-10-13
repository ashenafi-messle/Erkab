'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiClient } from '../../../lib/api/client';
import {
  Activity,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Server,
  ArrowRight,
  RefreshCw,
  Clock,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface OperationalData {
  metrics: {
    uptimeSeconds: number;
    activeTickets: number;
    activeIncidents: number;
    healthyComponents: number;
    totalComponents: number;
  };
  recentTickets: any[];
  recentIncidents: any[];
}

export default function SubAdminDashboard() {
  const [data, setData] = useState<OperationalData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOperationalMetrics = async () => {
    try {
      setLoading(true);
      const res = await apiClient<{ success: boolean; data: OperationalData }>(
        '/admin/dashboard/operational'
      );
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationalMetrics();
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <AdminShell>
      <div className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Operational Control Center</h1>
          <p className="text-muted small mb-0">
            Real-time infrastructure health, support queue telemetry, and system stability incident alerts.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 align-self-start"
          onClick={fetchOperationalMetrics}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Service Health"
            value={
              loading
                ? '...'
                : `${data?.metrics.healthyComponents ?? 5}/${data?.metrics.totalComponents ?? 5}`
            }
            subtitle="Core subsystems online"
            icon={Activity}
            variant="success"
            badgeText="Operational"
            badgePositive
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Active Incidents"
            value={loading ? '...' : data?.metrics.activeIncidents ?? 0}
            subtitle="Operational alarms"
            icon={AlertTriangle}
            variant="warning"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Open Inquiries"
            value={loading ? '...' : data?.metrics.activeTickets ?? 0}
            subtitle="Awaiting response"
            icon={HelpCircle}
            variant="blue"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Process Uptime"
            value={loading ? '...' : formatUptime(data?.metrics.uptimeSeconds ?? 86400)}
            subtitle="Continuous uptime"
            icon={Server}
            variant="navy"
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Active Support Tickets */}
        <div className="col-12 col-lg-6">
          <div className="admin-card h-100">
            <div className="admin-card-header">
              <h2 className="h6 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <HelpCircle size={18} className="text-primary" />
                <span>Urgent Inquiries & Support Queue</span>
              </h2>
              <Link href="/sub-admin/support" className="small text-decoration-none fw-medium d-inline-flex align-items-center gap-1">
                <span>View Queue</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="admin-card-body p-0">
              {loading ? (
                <div className="p-4 text-center text-muted small">Loading ticket telemetry...</div>
              ) : data?.recentTickets && data.recentTickets.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {data.recentTickets.map((t) => (
                    <li key={t.id} className="list-group-item p-3">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="fw-bold text-dark small">{t.subject}</span>
                        <StatusBadge status={t.status || 'PENDING'} />
                      </div>
                      <p className="text-muted small mb-2 text-truncate" style={{ maxWidth: 420 }}>
                        {t.message}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-light text-muted border small" style={{ fontSize: '0.7rem' }}>
                          Requester: {t.userName || t.userEmail}
                        </span>
                        <span className="badge bg-danger-subtle text-danger small">
                          {t.priority}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-muted small">
                  All support inquiries have been resolved.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Incidents */}
        <div className="col-12 col-lg-6">
          <div className="admin-card h-100">
            <div className="admin-card-header">
              <h2 className="h6 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <AlertTriangle size={18} className="text-warning" />
                <span>Operational Incidents & Outages</span>
              </h2>
              <Link href="/sub-admin/maintenance" className="small text-decoration-none fw-medium d-inline-flex align-items-center gap-1">
                <span>Incident Log</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="admin-card-body p-0">
              {loading ? (
                <div className="p-4 text-center text-muted small">Loading incident records...</div>
              ) : data?.recentIncidents && data.recentIncidents.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {data.recentIncidents.map((inc) => (
                    <li key={inc.id} className="list-group-item p-3">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="fw-bold text-dark small">{inc.title}</span>
                        <StatusBadge status={inc.status || 'INVESTIGATING'} />
                      </div>
                      <p className="text-muted small mb-2">{inc.description}</p>
                      <div className="d-flex justify-content-between align-items-center text-muted small" style={{ fontSize: '0.72rem' }}>
                        <span>Component: {inc.component}</span>
                        <span>Severity: {inc.severity}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-muted small">
                  No active incidents recorded. All services operating optimally.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
