'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { DataTable, Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiClient } from '../../../lib/api/client';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  RefreshCw,
  Power,
  Key,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New admin form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'SUB_ADMIN'>('SUB_ADMIN');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient<{ success: boolean; data: any[] }>('/admin/users');
      setUsers(res.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError('Email and initial password are required.');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim() || undefined,
          email: email.trim(),
          password,
          role,
        }),
      });
      setShowCreateModal(false);
      setFullName('');
      setEmail('');
      setPassword('');
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create administrative user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: any) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${user.email}?`)) return;

    try {
      await apiClient(`/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (err: any) {
      alert(err.message || `Failed to ${action} user.`);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Administrator',
      render: (row) => (
        <div>
          <div className="fw-bold text-dark">{row.fullName || 'Admin User'}</div>
          <span className="text-muted small">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'System Role',
      render: (row) => (
        <span
          className="badge"
          style={{
            backgroundColor: row.role === 'SUPER_ADMIN' ? '#0dcaf0' : '#ffc107',
            color: '#071927',
            fontSize: '0.72rem',
          }}
        >
          {row.role}
        </span>
      ),
    },
    {
      header: 'Account Status',
      render: (row) => (
        <StatusBadge status={row.isActive ? 'ACTIVE' : 'DEACTIVATED'} />
      ),
    },
    {
      header: 'Last Session Login',
      render: (row) => (
        <span className="text-muted small">
          {row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : 'Never logged in'}
        </span>
      ),
    },
    {
      header: 'Registered',
      render: (row) => (
        <span className="text-muted small">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      header: 'Access Control',
      render: (row) => (
        <button
          type="button"
          className={`btn btn-sm ${
            row.isActive ? 'btn-outline-danger' : 'btn-outline-success'
          } d-inline-flex align-items-center gap-1`}
          onClick={() => handleToggleStatus(row)}
        >
          <Power size={13} />
          <span>{row.isActive ? 'Deactivate' : 'Activate'}</span>
        </button>
      ),
    },
  ];

  return (
    <AdminShell requiredRole="SUPER_ADMIN">
      <div className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Administrative Staff & Role Governance</h1>
          <p className="text-muted small mb-0">
            Centrally manage Super Admin governance privileges and configure restricted Sub Admin operational roles.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
            onClick={() => setShowCreateModal(true)}
          >
            <UserPlus size={16} />
            <span>Add Admin Account</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search staff by name or email..."
        filterOptions={{
          label: 'Role',
          field: 'role',
          options: [
            { label: 'Super Admin', value: 'SUPER_ADMIN' },
            { label: 'Sub Admin', value: 'SUB_ADMIN' },
          ],
        }}
      />

      {/* Create User Modal */}
      {showCreateModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1055 }} onClick={() => setShowCreateModal(false)} />
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow border-0 rounded-4">
                <div className="modal-header border-bottom py-3">
                  <h5 className="modal-title fw-bold text-dark">Register New Administrator</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
                </div>
                <form onSubmit={handleCreate}>
                  <div className="modal-body py-4">
                    {formError && (
                      <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
                        {formError}
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Almaz Bekele"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Organizational Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="staff@erkab.org"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Initial Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="At least 8 characters..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Authoritative Role</label>
                      <select
                        className="form-select"
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                      >
                        <option value="SUB_ADMIN">Sub Admin (Operational, Support, Health & Monitoring)</option>
                        <option value="SUPER_ADMIN">Super Admin (Full Organizational Governance & Financials)</option>
                      </select>
                      <p className="form-text small text-muted mb-0 mt-1">
                        Sub Admins are barred from financial reconciliations and modifying other staff roles.
                      </p>
                    </div>
                  </div>
                  <div className="modal-footer border-top py-3">
                    <button
                      type="button"
                      className="btn btn-sm btn-light border"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                      disabled={submitting}
                    >
                      {submitting && <span className="spinner-border spinner-border-sm" />}
                      <span>Create Account</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
