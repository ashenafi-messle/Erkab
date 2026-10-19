'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { DataTable, Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiClient } from '../../../lib/api/client';
import { useAuth } from '../../../context/AuthContext';
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Lock,
  Globe,
  AlertTriangle
} from 'lucide-react';

export default function SecurityAuditPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'security' | 'audit'>('security');
  const [events, setEvents] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const [secRes, auditRes] = await Promise.all([
        apiClient<{ success: boolean; data: any[] }>('/admin/monitoring/security-events'),
        apiClient<{ success: boolean; data: any[] }>('/admin/monitoring/audit-logs'),
      ]);
      setEvents(secRes.data || []);
      setAuditLogs(auditRes.data || []);
    } catch {
      setEvents([]);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || authLoading) return;
    fetchSecurityData();
  }, [user, authLoading]);

  const securityColumns: Column<any>[] = [
    {
      header: 'Event Type',
      render: (row) => (
        <span className="badge bg-danger-subtle text-danger font-monospace small">
          {row.type}
        </span>
      ),
    },
    {
      header: 'Details',
      render: (row) => (
        <div>
          <div className="fw-semibold text-dark small">{row.description}</div>
          <span className="text-muted small">Target: {row.targetEmail || 'System'}</span>
        </div>
      ),
    },
    {
      header: 'IP Address',
      accessor: 'ipAddress',
      className: 'font-monospace small',
    },
    {
      header: 'Severity',
      render: (row) => (
        <span
          className={`badge ${
            row.severity === 'HIGH' ? 'bg-danger' : 'bg-warning text-dark'
          } small`}
        >
          {row.severity}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      render: (row) => (
        <span className="text-muted small">
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : 'Recent'}
        </span>
      ),
    },
  ];

  const auditColumns: Column<any>[] = [
    {
      header: 'Action',
      render: (row) => (
        <span className="badge bg-primary-subtle text-primary font-monospace small">
          {row.action}
        </span>
      ),
    },
    {
      header: 'Admin / Initiator',
      render: (row) => <span className="small fw-semibold">{row.adminEmail}</span>,
    },
    {
      header: 'Target / Scope',
      accessor: 'target',
      className: 'small text-muted',
    },
    {
      header: 'IP Address',
      accessor: 'ipAddress',
      className: 'font-monospace small text-muted',
    },
    {
      header: 'Timestamp',
      render: (row) => (
        <span className="text-muted small">
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
        </span>
      ),
    },
  ];

  return (
    <AdminShell>
      <div className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Security Telemetry & Access Audits</h1>
          <p className="text-muted small mb-0">
            Monitor real-time authentication anomalies, failed token attempts, and administrative session events.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
          onClick={fetchSecurityData}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <ul className="nav nav-pills mb-3 border-bottom pb-2">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link btn-sm d-flex align-items-center gap-2 ${
              activeTab === 'security' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('security')}
          >
            <ShieldAlert size={16} />
            <span>Security Alarms ({events.length})</span>
          </button>
        </li>
        <li className="nav-item ms-2">
          <button
            type="button"
            className={`nav-link btn-sm d-flex align-items-center gap-2 ${
              activeTab === 'audit' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('audit')}
          >
            <ShieldCheck size={16} />
            <span>General Audit Trail ({auditLogs.length})</span>
          </button>
        </li>
      </ul>

      <DataTable
        columns={activeTab === 'security' ? securityColumns : auditColumns}
        data={activeTab === 'security' ? events : auditLogs}
        loading={loading}
        searchPlaceholder="Filter events by IP, description, or staff email..."
      />
    </AdminShell>
  );
}
