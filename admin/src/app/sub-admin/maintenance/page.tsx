'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { DataTable, Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiClient } from '../../../lib/api/client';
import {
  Wrench,
  AlertTriangle,
  Plus,
  RefreshCw,
  CheckCircle,
  Database,
  Trash2,
  Cpu,
  CheckCircle2
} from 'lucide-react';

export default function MaintenancePage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toolExecuting, setToolExecuting] = useState<string | null>(null);
  const [toolResult, setToolResult] = useState<string | null>(null);

  // New incident form
  const [title, setTitle] = useState('');
  const [component, setComponent] = useState('Backend API');
  const [severity, setSeverity] = useState('MEDIUM');
  const [description, setDescription] = useState('');

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await apiClient<{ success: boolean; data: any[] }>(
        '/admin/monitoring/incidents'
      );
      setIncidents(res.data || []);
    } catch {
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      setSubmitting(true);
      await apiClient('/admin/monitoring/incidents', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          component,
          severity,
          description: description.trim(),
        }),
      });
      setShowLogModal(false);
      setTitle('');
      setDescription('');
      fetchIncidents();
    } catch (err: any) {
      alert(err.message || 'Failed to log incident.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveIncident = async (id: string) => {
    try {
      await apiClient(`/admin/monitoring/incidents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'RESOLVED' }),
      });
      fetchIncidents();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve incident.');
    }
  };

  const handleRunTool = async (action: string) => {
    try {
      setToolExecuting(action);
      setToolResult(null);
      const res = await apiClient<{ success: boolean; message: string }>(
        '/admin/monitoring/maintenance-action',
        {
          method: 'POST',
          body: JSON.stringify({ action }),
        }
      );
      setToolResult(res.message || `Action ${action} completed successfully.`);
    } catch (err: any) {
      setToolResult(`Failed: ${err.message || 'Tool execution error'}`);
    } finally {
      setToolExecuting(null);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Incident',
      render: (row) => (
        <div>
          <div className="fw-bold text-dark">{row.title}</div>
          <span className="text-muted small">{row.description}</span>
        </div>
      ),
    },
    {
      header: 'Affected Subsystem',
      render: (row) => <span className="badge bg-light text-dark border">{row.component}</span>,
    },
    {
      header: 'Severity',
      render: (row) => (
        <span
          className={`badge ${
            row.severity === 'CRITICAL'
              ? 'bg-danger'
              : row.severity === 'HIGH'
              ? 'bg-warning text-dark'
              : 'bg-secondary'
          } small`}
        >
          {row.severity}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status || 'INVESTIGATING'} />,
    },
    {
      header: 'Logged Date',
      render: (row) => (
        <span className="text-muted small">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      header: 'Action',
      render: (row) => (
        <button
          type="button"
          className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1"
          disabled={row.status === 'RESOLVED'}
          onClick={() => handleResolveIncident(row.id)}
        >
          <CheckCircle size={14} />
          <span>{row.status === 'RESOLVED' ? 'Resolved' : 'Mark Resolved'}</span>
        </button>
      ),
    },
  ];

  return (
    <AdminShell>
      <div className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Maintenance Tools & Incident Management</h1>
          <p className="text-muted small mb-0">
            Execute operational maintenance routines, manage active system alarms, and document resolution timelines.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
            onClick={fetchIncidents}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-warning d-inline-flex align-items-center gap-1"
            onClick={() => setShowLogModal(true)}
          >
            <Plus size={16} />
            <span>Log Incident</span>
          </button>
        </div>
      </div>

      {toolResult && (
        <div className="alert alert-info py-2 px-3 small rounded-3 mb-4 d-flex align-items-center justify-content-between">
          <span>{toolResult}</span>
          <button type="button" className="btn-close" onClick={() => setToolResult(null)} />
        </div>
      )}

      {/* Routine Maintenance Action Controls */}
      <div className="card border-0 shadow-sm p-4 bg-white rounded-3 mb-4">
        <h2 className="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <Wrench size={18} className="text-primary" />
          <span>Delegated Maintenance Utilities</span>
        </h2>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="p-3 bg-light rounded border h-100 d-flex flex-column justify-content-between">
              <div>
                <span className="fw-bold text-dark small d-block mb-1">Flush Application Cache</span>
                <p className="text-muted small mb-3">
                  Invalidates in-memory response caches and session key pre-allocations safely.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center gap-2"
                disabled={!!toolExecuting}
                onClick={() => handleRunTool('FLUSH_CACHE')}
              >
                {toolExecuting === 'FLUSH_CACHE' && <span className="spinner-border spinner-border-sm" />}
                <span>Purge Cache</span>
              </button>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="p-3 bg-light rounded border h-100 d-flex flex-column justify-content-between">
              <div>
                <span className="fw-bold text-dark small d-block mb-1">Database Optimization (Vacuum)</span>
                <p className="text-muted small mb-3">
                  Executes SQLite/PostgreSQL vacuum and recalculates indexing statistics.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center gap-2"
                disabled={!!toolExecuting}
                onClick={() => handleRunTool('VACUUM_DB')}
              >
                {toolExecuting === 'VACUUM_DB' && <span className="spinner-border spinner-border-sm" />}
                <span>Run DB Vacuum</span>
              </button>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="p-3 bg-light rounded border h-100 d-flex flex-column justify-content-between">
              <div>
                <span className="fw-bold text-dark small d-block mb-1">Recalculate Health Probes</span>
                <p className="text-muted small mb-3">
                  Forces an immediate round of synthetic pings across all 5 organizational endpoints.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center gap-2"
                disabled={!!toolExecuting}
                onClick={() => handleRunTool('RELOAD_HEALTH')}
              >
                {toolExecuting === 'RELOAD_HEALTH' && <span className="spinner-border spinner-border-sm" />}
                <span>Trigger Probes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <DataTable
        columns={columns}
        data={incidents}
        loading={loading}
        searchPlaceholder="Filter incidents by title or component..."
        emptyTitle="No Open Incidents"
        emptyMessage="All organizational services and background workers are operating normally."
      />

      {/* Log Incident Modal */}
      {showLogModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1055 }} onClick={() => setShowLogModal(false)} />
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow border-0 rounded-4">
                <div className="modal-header border-bottom py-3">
                  <h5 className="modal-title fw-bold text-dark">Log Operational Incident</h5>
                  <button type="button" className="btn-close" onClick={() => setShowLogModal(false)} />
                </div>
                <form onSubmit={handleCreateIncident}>
                  <div className="modal-body py-4">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Incident Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Transient Latency on Student Submissions"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Subsystem</label>
                        <select
                          className="form-select"
                          value={component}
                          onChange={(e) => setComponent(e.target.value)}
                        >
                          <option value="Backend API">Backend API</option>
                          <option value="PostgreSQL / Database">PostgreSQL / Database</option>
                          <option value="Public Website">Public Website</option>
                          <option value="Admin Portal">Admin Portal</option>
                          <option value="Storage & CDN">Storage & CDN</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Severity</label>
                        <select
                          className="form-select"
                          value={severity}
                          onChange={(e) => setSeverity(e.target.value)}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical Outage</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Incident Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Details of observed anomaly..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer border-top py-3">
                    <button
                      type="button"
                      className="btn btn-sm btn-light border"
                      onClick={() => setShowLogModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-sm btn-warning d-inline-flex align-items-center gap-1"
                      disabled={submitting}
                    >
                      {submitting && <span className="spinner-border spinner-border-sm" />}
                      <span>Save Incident</span>
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
