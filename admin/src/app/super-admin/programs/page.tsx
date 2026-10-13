'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { DataTable, Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiClient } from '../../../lib/api/client';
import { BookOpen, Check, X, RefreshCw, Award, Clock } from 'lucide-react';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const res = await apiClient<{ success: boolean; data: any[] }>('/admin/programs');
      setPrograms(res.data || []);
    } catch {
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleTogglePublish = async (program: any) => {
    try {
      setTogglingId(program.id);
      const newStatus = !program.isPublished;
      await apiClient(`/admin/programs/${program.id}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished: newStatus }),
      });
      // Optimistic update
      setPrograms((prev) =>
        prev.map((p) => (p.id === program.id ? { ...p, isPublished: newStatus } : p))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle publication status.');
    } finally {
      setTogglingId(null);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Program Track',
      render: (row) => (
        <div>
          <div className="fw-bold text-dark">{row.title}</div>
          <span className="text-muted small font-monospace">slug: {row.slug}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      render: (row) => <span className="badge bg-light text-dark border">{row.category}</span>,
    },
    {
      header: 'Duration',
      render: (row) => (
        <span className="text-muted small d-flex align-items-center gap-1">
          <Clock size={13} />
          <span>{row.duration || '6 Months'}</span>
        </span>
      ),
    },
    {
      header: 'Delivery',
      render: (row) => <span className="small text-muted">{row.delivery || 'Hybrid'}</span>,
    },
    {
      header: 'Scholarship',
      render: (row) => (
        <span className="badge bg-success-subtle text-success small">
          {row.scholarship ? '100% Funded' : 'Standard Tuition'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <StatusBadge status={row.isPublished ? 'PUBLISHED' : 'INACTIVE'} />
      ),
    },
    {
      header: 'Visibility Toggle',
      render: (row) => (
        <button
          type="button"
          className={`btn btn-sm ${
            row.isPublished ? 'btn-outline-danger' : 'btn-outline-success'
          } d-inline-flex align-items-center gap-1`}
          disabled={togglingId === row.id}
          onClick={() => handleTogglePublish(row)}
        >
          {togglingId === row.id ? (
            <span className="spinner-border spinner-border-sm" />
          ) : row.isPublished ? (
            <>
              <X size={14} />
              <span>Unpublish</span>
            </>
          ) : (
            <>
              <Check size={14} />
              <span>Publish</span>
            </>
          )}
        </button>
      ),
    },
  ];

  return (
    <AdminShell requiredRole="SUPER_ADMIN">
      <div className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Instructional Training Programs</h1>
          <p className="text-muted small mb-0">
            Authoritatively govern the 10 professional training tracks, catalog visibility, and scholarship allocation.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 align-self-start"
          onClick={fetchPrograms}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={programs}
        loading={loading}
        searchPlaceholder="Search curriculum tracks by title or category..."
        filterOptions={{
          label: 'Category',
          field: 'category',
          options: [
            { label: 'Technology', value: 'Technology' },
            { label: 'Vocational', value: 'Vocational' },
            { label: 'Business', value: 'Business' },
          ],
        }}
      />
    </AdminShell>
  );
}
