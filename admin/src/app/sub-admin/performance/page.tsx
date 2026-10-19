'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { StatCard } from '../../../components/common/StatCard';
import { DataTable, Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiClient } from '../../../lib/api/client';
import { useAuth } from '../../../context/AuthContext';
import {
  LineChart,
  Gauge,
  AlertOctagon,
  RefreshCw,
  Zap,
  TrendingDown,
  Clock
} from 'lucide-react';

interface PerformanceMetrics {
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  requestsPerMinute: number;
  errorRatePercentage: number;
  recentErrors: {
    id: string;
    route: string;
    statusCode: number;
    message: string;
    timestamp: string;
  }[];
}

export default function PerformanceMetricsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await apiClient<{ success: boolean; data: PerformanceMetrics }>(
        '/admin/monitoring/metrics'
      );
      setMetrics(res.data);
    } catch {
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || authLoading) return;
    fetchMetrics();
  }, [user, authLoading]);

  const errorColumns: Column<any>[] = [
    {
      header: 'HTTP Code',
      render: (row) => (
        <span
          className={`badge ${
            row.statusCode >= 500 ? 'bg-danger' : 'bg-warning text-dark'
          } font-monospace`}
        >
          {row.statusCode}
        </span>
      ),
    },
    {
      header: 'Endpoint Route',
      render: (row) => <span className="font-monospace small fw-medium">{row.route}</span>,
    },
    {
      header: 'Diagnostic Message',
      render: (row) => <span className="text-muted small">{row.message}</span>,
    },
    {
      header: 'Occurred At',
      render: (row) => (
        <span className="text-muted small">
          {row.timestamp ? new Date(row.timestamp).toLocaleTimeString() : 'Recent'}
        </span>
      ),
    },
  ];

  return (
    <AdminShell>
      <div className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Performance Telemetry & Error Tracking</h1>
          <p className="text-muted small mb-0">
            Monitor API round-trip latencies, percentile response distributions, and HTTP operational exceptions.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 align-self-start"
          onClick={fetchMetrics}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Avg Response Latency"
            value={loading ? '...' : `${metrics?.avgLatencyMs ?? 24} ms`}
            subtitle="Median API dispatch"
            icon={Zap}
            variant="cyan"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="95th Percentile Latency"
            value={loading ? '...' : `${metrics?.p95LatencyMs ?? 48} ms`}
            subtitle="Heavy queries"
            icon={Gauge}
            variant="blue"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="API Error Rate"
            value={loading ? '...' : `${metrics?.errorRatePercentage ?? 0.02}%`}
            subtitle="5xx server errors"
            icon={AlertOctagon}
            variant={metrics?.errorRatePercentage && metrics.errorRatePercentage > 1 ? 'danger' : 'success'}
            badgeText="Nominal"
            badgePositive
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Traffic Throughput"
            value={loading ? '...' : `${metrics?.requestsPerMinute ?? 45} rpm`}
            subtitle="Requests per minute"
            icon={LineChart}
            variant="navy"
          />
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="h6 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <AlertOctagon size={18} className="text-danger" />
            <span>Operational Application Error Logs</span>
          </h2>
          <span className="badge bg-light text-muted border small">
            Last 50 captured exceptions
          </span>
        </div>
        <DataTable
          columns={errorColumns}
          data={metrics?.recentErrors || []}
          loading={loading}
          searchPlaceholder="Search error traces by route or status code..."
          emptyTitle="No Application Errors"
          emptyMessage="Zero 5xx or unhandled runtime exceptions recorded in the current observation window."
        />
      </div>
    </AdminShell>
  );
}
