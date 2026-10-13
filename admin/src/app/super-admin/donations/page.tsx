'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { DataTable, Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { StatCard } from '../../../components/common/StatCard';
import { apiClient } from '../../../lib/api/client';
import {
  DollarSign,
  HeartHandshake,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Filter
} from 'lucide-react';

export default function DonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState<'ALL' | 'REAL' | 'DEMO'>('ALL');

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await apiClient<{ success: boolean; data: any[] }>('/admin/donations');
      setDonations(res.data || []);
    } catch {
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Compute separated metrics
  const realTransactions = donations.filter((d) => !d.isDemo && d.status === 'COMPLETED');
  const demoTransactions = donations.filter((d) => d.isDemo);
  const realTotalETB = realTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const displayedData = donations.filter((d) => {
    if (tabFilter === 'REAL') return !d.isDemo;
    if (tabFilter === 'DEMO') return d.isDemo;
    return true;
  });

  const columns: Column<any>[] = [
    {
      header: 'Reference #',
      accessor: 'paymentReference',
      className: 'font-monospace fw-medium small',
    },
    {
      header: 'Donor Name',
      render: (row) => (
        <div>
          <span className="fw-semibold text-dark">{row.donorName || 'Anonymous Donor'}</span>
          <div className="text-muted small">{row.email || '—'}</div>
        </div>
      ),
    },
    {
      header: 'Amount',
      render: (row) => (
        <span className="fw-bold text-dark">
          {Number(row.amount || 0).toLocaleString()} {row.currency || 'ETB'}
        </span>
      ),
    },
    {
      header: 'Financial Mode',
      render: (row) => (
        <StatusBadge status={row.isDemo ? 'DEMO' : 'REAL'} />
      ),
    },
    {
      header: 'Method',
      render: (row) => (
        <span className="badge bg-light text-dark border small">
          {row.paymentMethod || 'Online Gateway'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status || 'COMPLETED'} />,
    },
    {
      header: 'Date',
      render: (row) => (
        <span className="text-muted small">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ];

  return (
    <AdminShell requiredRole="SUPER_ADMIN">
      <div className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Financial Reconciliation & Donations</h1>
          <p className="text-muted small mb-0">
            Audit institutional contributions with strict authoritative separation of real ledger transactions from demo payment simulations.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 align-self-start"
          onClick={fetchDonations}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Financial Separation Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <StatCard
            title="Real Settled Funds"
            value={`${realTotalETB.toLocaleString()} ETB`}
            subtitle="Verified banking transactions"
            icon={DollarSign}
            variant="success"
            badgeText="Audited"
            badgePositive
          />
        </div>
        <div className="col-12 col-md-4">
          <StatCard
            title="Real Financial Ledgers"
            value={realTransactions.length}
            subtitle="Official donor contributions"
            icon={CheckCircle2}
            variant="blue"
          />
        </div>
        <div className="col-12 col-md-4">
          <StatCard
            title="Simulated Demo Payments"
            value={demoTransactions.length}
            subtitle="Sandbox checkout tests"
            icon={CreditCard}
            variant="cyan"
            badgeText="Simulation"
          />
        </div>
      </div>

      {/* Mode Filter Tabs */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <button
          type="button"
          className={`btn btn-sm ${tabFilter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setTabFilter('ALL')}
        >
          All Records ({donations.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${tabFilter === 'REAL' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => setTabFilter('REAL')}
        >
          Real Financial Ledgers ({realTransactions.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${tabFilter === 'DEMO' ? 'btn-info text-white' : 'btn-outline-info'}`}
          onClick={() => setTabFilter('DEMO')}
        >
          Demo Payment Simulations ({demoTransactions.length})
        </button>
      </div>

      <DataTable
        columns={columns}
        data={displayedData}
        loading={loading}
        searchPlaceholder="Search by reference, donor, or method..."
        filterOptions={{
          label: 'Status',
          field: 'status',
          options: [
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Failed', value: 'FAILED' },
          ],
        }}
      />
    </AdminShell>
  );
}
