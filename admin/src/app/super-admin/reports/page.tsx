'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { DataTable, Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiClient } from '../../../lib/api/client';
import {
  FileText,
  Download,
  Shield,
  RefreshCw,
  Search,
  Activity,
  Calendar
} from 'lucide-react';

export default function ReportsAndAuditsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient<{ success: boolean; data: any[] }>('/admin/monitoring/audit-logs');
      setLogs(res.data || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportCSV = () => {
    if (!logs.length) return;
    const headers = ['Action', 'Admin', 'Target', 'IP Address', 'Date'];
    const rows = logs.map((l) => [
      `"${l.action || ''}"`,
      `"${l.adminEmail || ''}"`,
      `"${l.target || ''}"`,
      `"${l.ipAddress || ''}"`,
      `"${l.createdAt || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `erkab_audit_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<any>[] = [
    {
      header: 'Audit Action',
      render: (row) => (
        <span className="badge bg-primary-subtle text-primary font-monospace small">
          {row.action}
        </span>
      ),
    },
    {
      header: 'Staff Responsible',
      render: (row) => (
        <div>
          <span className="fw-semibold text-dark small">{row.adminEmail || 'System Process'}</span>
        </div>
      ),
    },
    {
      header: 'Target Entity',
      render: (row) => <span className="small text-muted">{row.target || 'General System'}</span>,
    },
    {
      header: 'Network IP',
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
    <AdminShell requiredRole="SUPER_ADMIN">
      <div className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Audit Reports & Organizational Compliance</h1>
          <p className="text-muted small mb-0">
            Immutable tracking of administrator logins, role alterations, admissions decisions, and financial operations.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
            onClick={handleExportCSV}
            disabled={logs.length === 0}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchPlaceholder="Filter audit trails by action, staff email, or target..."
      />
    </AdminShell>
  );
}
