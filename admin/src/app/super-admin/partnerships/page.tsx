'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { DataTable, Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiClient } from '../../../lib/api/client';
import {
  Handshake,
  FileCheck,
  ExternalLink,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Building,
  Mail,
  Phone,
  FileText
} from 'lucide-react';

export default function PartnershipsPage() {
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchPartnerships = async () => {
    try {
      setLoading(true);
      const res = await apiClient<{ success: boolean; data: any[] }>('/admin/partnerships');
      setPartnerships(res.data || []);
    } catch {
      setPartnerships([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerships();
  }, []);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedPartner) return;
    try {
      setStatusUpdating(true);
      await apiClient(`/admin/partnerships/${selectedPartner.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setSelectedPartner(null);
      fetchPartnerships();
    } catch (err: any) {
      alert(err.message || 'Failed to update partnership status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Organization',
      render: (row) => (
        <div>
          <div className="fw-bold text-dark">{row.organizationName}</div>
          <span className="text-muted small">{row.organizationType || 'Private Corp'}</span>
        </div>
      ),
    },
    {
      header: 'Contact Person',
      render: (row) => (
        <div>
          <div className="fw-semibold text-dark small">{row.contactPerson}</div>
          <div className="text-muted" style={{ fontSize: '0.72rem' }}>{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Partnership Type',
      render: (row) => (
        <span className="badge bg-light text-dark border">{row.partnershipType || 'Educational'}</span>
      ),
    },
    {
      header: 'License Verification',
      render: (row) => {
        if (!row.organizationLicenseDoc) {
          return <span className="text-muted small">Not provided</span>;
        }
        return (
          <a
            href={row.organizationLicenseDoc}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1 py-1"
            style={{ fontSize: '0.75rem' }}
          >
            <FileCheck size={13} />
            <span>View License</span>
            <ExternalLink size={11} />
          </a>
        );
      },
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status || 'PENDING'} />,
    },
    {
      header: 'Date',
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
          onClick={() => setSelectedPartner(row)}
        >
          <Eye size={14} />
          <span>Review</span>
        </button>
      ),
    },
  ];

  return (
    <AdminShell requiredRole="SUPER_ADMIN">
      <div className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Partnership & License Reviews</h1>
          <p className="text-muted small mb-0">
            Audit institutional partnership proposals and verify uploaded organizational licenses.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 align-self-start"
          onClick={fetchPartnerships}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={partnerships}
        loading={loading}
        searchPlaceholder="Search by organization, contact person, or email..."
        filterOptions={{
          label: 'Status',
          field: 'status',
          options: [
            { label: 'Pending', value: 'PENDING' },
            { label: 'Approved', value: 'APPROVED' },
            { label: 'Rejected', value: 'REJECTED' },
          ],
        }}
      />

      {/* Detail Review Modal */}
      {selectedPartner && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1055 }} onClick={() => setSelectedPartner(null)} />
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content shadow border-0 rounded-4">
                <div className="modal-header border-bottom py-3">
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">Partnership Proposal Review</h5>
                    <span className="text-muted small">
                      {selectedPartner.organizationName}
                    </span>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setSelectedPartner(null)} />
                </div>
                <div className="modal-body py-4">
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="text-muted small d-block">Organization Name</label>
                      <span className="fw-bold text-dark fs-6">{selectedPartner.organizationName}</span>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small d-block">Current Status</label>
                      <StatusBadge status={selectedPartner.status || 'PENDING'} />
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small d-block">Contact Representative</label>
                      <span className="text-dark small">{selectedPartner.contactPerson}</span>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small d-block">Representative Email & Phone</label>
                      <span className="text-dark small d-block">{selectedPartner.email}</span>
                      <span className="text-muted small">{selectedPartner.phone || '—'}</span>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small d-block">Location</label>
                      <span className="text-dark small">
                        {selectedPartner.city || ''} {selectedPartner.country ? `(${selectedPartner.country})` : '—'}
                      </span>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small d-block">Partnership Framework</label>
                      <span className="badge bg-light text-dark border">
                        {selectedPartner.partnershipType || 'Co-training & Sponsorship'}
                      </span>
                    </div>

                    {selectedPartner.proposal && (
                      <div className="col-12">
                        <label className="text-muted small d-block">Partnership Proposal & Scope</label>
                        <div className="p-3 bg-light rounded small text-dark border">
                          {selectedPartner.proposal}
                        </div>
                      </div>
                    )}

                    {selectedPartner.organizationLicenseDoc && (
                      <div className="col-12">
                        <label className="text-muted small d-block">Official Organization License</label>
                        <div className="p-3 bg-info bg-opacity-10 rounded border border-info border-opacity-25 d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <FileCheck size={20} className="text-info" />
                            <span className="small fw-semibold text-dark">
                              Uploaded Institutional Registration Certificate
                            </span>
                          </div>
                          <a
                            href={selectedPartner.organizationLicenseDoc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                          >
                            <span>Inspect Document</span>
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-top pt-3">
                    <h6 className="fw-bold text-dark small mb-2">Update Partnership Decision:</h6>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                        disabled={statusUpdating || selectedPartner.status === 'APPROVED'}
                        onClick={() => handleUpdateStatus('APPROVED')}
                      >
                        <CheckCircle size={15} />
                        <span>Approve Partnership</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger d-inline-flex align-items-center gap-1"
                        disabled={statusUpdating || selectedPartner.status === 'REJECTED'}
                        onClick={() => handleUpdateStatus('REJECTED')}
                      >
                        <XCircle size={15} />
                        <span>Reject Request</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        disabled={statusUpdating || selectedPartner.status === 'PENDING'}
                        onClick={() => handleUpdateStatus('PENDING')}
                      >
                        Reset to Pending
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
