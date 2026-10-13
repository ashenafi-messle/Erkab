'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { DataTable, Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiClient } from '../../../lib/api/client';
import {
  HelpCircle,
  CheckCircle,
  Eye,
  RefreshCw,
  Mail,
  User,
  Clock,
  MessageSquare
} from 'lucide-react';

export default function SupportQueuePage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [resolving, setResolving] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await apiClient<{ success: boolean; data: any[] }>(
        '/admin/monitoring/support-tickets'
      );
      setTickets(res.data || []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    try {
      setResolving(true);
      await apiClient(`/admin/monitoring/support-tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setSelectedTicket(null);
      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to update ticket status.');
    } finally {
      setResolving(false);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Subject',
      render: (row) => (
        <div>
          <div className="fw-bold text-dark">{row.subject}</div>
          <span className="text-muted small text-truncate d-inline-block" style={{ maxWidth: 280 }}>
            {row.message}
          </span>
        </div>
      ),
    },
    {
      header: 'Requester',
      render: (row) => (
        <div>
          <span className="fw-semibold text-dark small">{row.userName || 'Student'}</span>
          <div className="text-muted" style={{ fontSize: '0.72rem' }}>{row.userEmail}</div>
        </div>
      ),
    },
    {
      header: 'Priority',
      render: (row) => (
        <span
          className={`badge ${
            row.priority === 'HIGH' ? 'bg-danger' : row.priority === 'MEDIUM' ? 'bg-warning text-dark' : 'bg-light text-dark border'
          } small`}
        >
          {row.priority}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status || 'OPEN'} />,
    },
    {
      header: 'Logged At',
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
          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
          onClick={() => setSelectedTicket(row)}
        >
          <Eye size={14} />
          <span>Inspect</span>
        </button>
      ),
    },
  ];

  return (
    <AdminShell>
      <div className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Customer & Student Support Operations</h1>
          <p className="text-muted small mb-0">
            Field learner inquiries, admission support requests, and platform usability feedback.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
          onClick={fetchTickets}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={tickets}
        loading={loading}
        searchPlaceholder="Search tickets by subject, requester, or email..."
        filterOptions={{
          label: 'Status',
          field: 'status',
          options: [
            { label: 'Open', value: 'OPEN' },
            { label: 'In Progress', value: 'IN_PROGRESS' },
            { label: 'Resolved', value: 'RESOLVED' },
          ],
        }}
      />

      {/* Ticket Inspection Modal */}
      {selectedTicket && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1055 }} onClick={() => setSelectedTicket(null)} />
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow border-0 rounded-4">
                <div className="modal-header border-bottom py-3">
                  <h5 className="modal-title fw-bold text-dark mb-0">Support Inquiry Details</h5>
                  <button type="button" className="btn-close" onClick={() => setSelectedTicket(null)} />
                </div>
                <div className="modal-body py-4">
                  <div className="mb-3">
                    <label className="text-muted small d-block">Subject</label>
                    <span className="fw-bold text-dark fs-6">{selectedTicket.subject}</span>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="text-muted small d-block">Requester</label>
                      <span className="text-dark small fw-medium">{selectedTicket.userName || 'Student'}</span>
                    </div>
                    <div className="col-6">
                      <label className="text-muted small d-block">Current Status</label>
                      <StatusBadge status={selectedTicket.status} />
                    </div>
                    <div className="col-12">
                      <label className="text-muted small d-block">Contact Email</label>
                      <span className="text-dark small">{selectedTicket.userEmail}</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="text-muted small d-block">Student Inquiry Message</label>
                    <div className="p-3 bg-light rounded small text-dark border">
                      {selectedTicket.message}
                    </div>
                  </div>

                  <div className="border-top pt-3">
                    <label className="fw-bold text-dark small d-block mb-2">Resolution Action:</label>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                        disabled={resolving || selectedTicket.status === 'RESOLVED'}
                        onClick={() => handleUpdateStatus('RESOLVED')}
                      >
                        <CheckCircle size={14} />
                        <span>Mark as Resolved</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-warning d-inline-flex align-items-center gap-1"
                        disabled={resolving || selectedTicket.status === 'IN_PROGRESS'}
                        onClick={() => handleUpdateStatus('IN_PROGRESS')}
                      >
                        <span>Mark In Progress</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
