'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiClient, getAuthToken } from '../../../lib/api/client';
import { useAuth } from '../../../context/AuthContext';
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
  FileText,
  Clock,
  Search,
  Filter,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  UserCheck,
  Calendar
} from 'lucide-react';

interface PartnershipItem {
  id: string;
  reference: string;
  organizationName: string;
  organizationType: string;
  contactPerson: string;
  email: string;
  phone: string;
  country?: string | null;
  city?: string | null;
  partnershipType: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  reviewNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  hasDocument?: boolean;
  documents?: Array<{
    id: string;
    category: string;
    originalFilename: string;
    fileType: string;
    fileSize: number;
  }>;
  organizationLicenseDoc?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PartnershipStats {
  total: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
}

interface PartnershipDetailData {
  partnership: PartnershipItem & { proposal?: string | null };
  documents: Array<{
    id: string;
    category: string;
    originalFilename: string;
    fileType: string;
    fileSize: number;
    reviewUrl: string;
    viewUrl: string;
    downloadUrl: string;
  }>;
  auditLogs?: Array<{
    id: string;
    adminUserId?: string;
    adminName: string;
    action: string;
    details?: string;
    createdAt: string;
  }>;
}

export default function PartnershipsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [partnerships, setPartnerships] = useState<PartnershipItem[]>([]);
  const [stats, setStats] = useState<PartnershipStats>({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Modal State
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<PartnershipDetailData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Review Form State
  const [decisionStatus, setDecisionStatus] = useState<string>('APPROVED');
  const [reviewNotes, setReviewNotes] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    filename: string;
    isPdf: boolean;
  } | null>(null);

  // Confirmation Modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPendingStatus, setConfirmPendingStatus] = useState<string>('');

  // Fetch Summary Stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await apiClient<{ success: boolean; data: PartnershipStats }>('/admin/partnerships/stats');
      if (res.data) {
        setStats(res.data);
      }
    } catch {
      // Keep previous
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Partnerships List
  const fetchPartnerships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(page));
      queryParams.set('limit', String(limit));
      if (search.trim()) queryParams.set('search', search.trim());
      if (statusFilter !== 'ALL') queryParams.set('status', statusFilter);

      const res = await apiClient<{
        success: boolean;
        data: PartnershipItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/admin/partnerships?${queryParams.toString()}`);

      setPartnerships(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load partnership requests.');
      setPartnerships([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    if (!user || authLoading) return;
    fetchStats();
  }, [user, authLoading]);

  useEffect(() => {
    if (!user || authLoading) return;
    fetchPartnerships();
  }, [user, authLoading, fetchPartnerships]);

  // Load Partnership Detail
  const handleOpenDetail = async (id: string) => {
    setSelectedPartnerId(id);
    setDetailData(null);
    setDetailError(null);
    setActionSuccess(null);
    try {
      setLoadingDetail(true);
      const res = await apiClient<{ success: boolean; data: PartnershipDetailData }>(`/admin/partnerships/${id}`);
      if (res.data) {
        setDetailData(res.data);
        setDecisionStatus(res.data.partnership.status === 'PENDING' ? 'UNDER_REVIEW' : res.data.partnership.status);
        setReviewNotes(res.data.partnership.reviewNotes || '');
      }
    } catch (err: any) {
      setDetailError(err.message || 'Failed to load partnership details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Submit Review Status Change
  const handleSubmitReview = async (overrideStatus?: string) => {
    if (!selectedPartnerId) return;
    const targetStatus = overrideStatus || decisionStatus;

    try {
      setStatusUpdating(true);
      setActionSuccess(null);
      setDetailError(null);

      const res = await apiClient<{ success: boolean; message: string }>(
        `/admin/partnerships/${selectedPartnerId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: targetStatus,
            reviewNotes: reviewNotes.trim() || undefined,
          }),
        }
      );

      setActionSuccess(res.message || `Partnership updated to ${targetStatus}`);
      setConfirmOpen(false);

      // Refresh detail data
      handleOpenDetail(selectedPartnerId);
      // Refresh list and metrics
      fetchPartnerships();
      fetchStats();
    } catch (err: any) {
      setDetailError(err.message || 'Failed to update partnership status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Trigger Confirmation for consequential decisions
  const handleInitiateDecision = (status: string) => {
    if (status === 'APPROVED' || status === 'REJECTED') {
      setConfirmPendingStatus(status);
      setConfirmOpen(true);
    } else {
      handleSubmitReview(status);
    }
  };

  // Open Document Preview Modal safely
  const handlePreviewDocument = (doc: any) => {
    const isPdf =
      doc.fileType?.includes('pdf') ||
      doc.originalFilename?.toLowerCase().endsWith('.pdf') ||
      doc.originalName?.toLowerCase().endsWith('.pdf');

    const token = getAuthToken();
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '');

    let cleanViewPath = doc.viewUrl || '';
    if (apiBase.endsWith('/api/v1') && cleanViewPath.startsWith('/api/v1/')) {
      cleanViewPath = cleanViewPath.substring('/api/v1'.length);
    }
    const fallbackStreamUrl = `${apiBase}${cleanViewPath}${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    // Prefer Cloudinary signed reviewUrl if present and not mock, otherwise use backend stream proxy
    const finalUrl = (doc.reviewUrl && !doc.reviewUrl.includes('mock-erkab')) ? doc.reviewUrl : fallbackStreamUrl;

    setPreviewDoc({
      url: finalUrl,
      filename: doc.originalFilename || doc.originalName || 'registration_license.pdf',
      isPdf,
    });
  };

  return (
    <AdminShell requiredRole="SUPER_ADMIN">
      {/* Top Header */}
      <div className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Handshake size={24} className="text-primary" />
            <span>Institutional Partnership Reviews</span>
          </h1>
          <p className="text-muted small mb-0">
            Audit institutional proposals, verify organizational registration certificates, and record authorized partnership decisions.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 align-self-start align-self-sm-auto">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
            onClick={() => {
              fetchStats();
              fetchPartnerships();
            }}
            disabled={loading || statsLoading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary StatCards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard
            title="Total Inquiries"
            value={stats.total}
            subtitle="Submitted across all channels"
            icon={Handshake}
            variant="blue"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Pending Review"
            value={stats.pending}
            subtitle="Awaiting initial admissions review"
            icon={Clock}
            variant="warning"
            badgeText={stats.pending > 0 ? 'Requires Action' : 'All Clear'}
            badgePositive={stats.pending === 0}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Under Evaluation"
            value={stats.underReview}
            subtitle="In progress with legal/academics"
            icon={Building}
            variant="cyan"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Approved Strategic Partners"
            value={stats.approved}
            subtitle="Ratified institutional partners"
            icon={CheckCircle}
            variant="success"
            badgeText="Verified"
            badgePositive={true}
          />
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-3 mb-4 p-3 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by organization name, contact representative, reference, or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              {search && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Statuses ({stats.total})</option>
              <option value="PENDING">Pending Review ({stats.pending})</option>
              <option value="UNDER_REVIEW">Under Evaluation ({stats.underReview})</option>
              <option value="APPROVED">Approved Partners ({stats.approved})</option>
              <option value="REJECTED">Rejected Proposals ({stats.rejected})</option>
            </select>
          </div>

          <div className="col-6 col-md-3 text-md-end text-muted small">
            Showing {partnerships.length} of {totalCount} requests
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <AlertCircle size={18} />
          <div>{error}</div>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-auto"
            onClick={fetchPartnerships}
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Table Content */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
        {loading ? (
          <div className="p-5 text-center text-muted">
            <span className="spinner-border spinner-border-sm text-primary me-2" />
            <span>Loading partnership records from database...</span>
          </div>
        ) : partnerships.length === 0 ? (
          <div className="p-5 text-center">
            <Handshake size={48} className="text-muted mb-3 opacity-50" />
            <h5 className="fw-bold text-dark">No Partnership Inquiries Found</h5>
            <p className="text-muted small mb-0">
              {search || statusFilter !== 'ALL'
                ? 'Try clearing your search query or switching your status filter.'
                : 'No public partnership requests have been submitted yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                  <tr>
                    <th style={{ width: '15%' }}>Reference</th>
                    <th style={{ width: '25%' }}>Organization</th>
                    <th>Contact Person</th>
                    <th>Partnership Type</th>
                    <th>Documentation</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {partnerships.map((partner) => (
                    <tr key={partner.id}>
                      <td>
                        <span className="font-monospace fw-semibold text-primary small">
                          {partner.reference}
                        </span>
                      </td>

                      <td>
                        <div className="fw-bold text-dark">{partner.organizationName}</div>
                        <span className="badge bg-light text-dark border small fw-normal">
                          {partner.organizationType || 'Institution'}
                        </span>
                        {partner.city && (
                          <span className="text-muted small ms-1" style={{ fontSize: '0.72rem' }}>
                            • {partner.city}
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="fw-semibold text-dark small">{partner.contactPerson}</div>
                        <div className="text-muted small d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                          <Mail size={11} />
                          <span>{partner.email}</span>
                        </div>
                        {partner.phone && (
                          <div className="text-muted small d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                            <Phone size={11} />
                            <span>{partner.phone}</span>
                          </div>
                        )}
                      </td>

                      <td>
                        <span className="badge bg-light text-dark border">
                          {partner.partnershipType}
                        </span>
                      </td>

                      <td>
                        {partner.hasDocument ? (
                          <span className="badge bg-success-subtle text-success d-inline-flex align-items-center gap-1">
                            <FileCheck size={12} />
                            <span>License Uploaded</span>
                          </span>
                        ) : (
                          <span className="text-muted small">No file</span>
                        )}
                      </td>

                      <td>
                        <StatusBadge status={partner.status || 'PENDING'} />
                      </td>

                      <td>
                        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          {partner.createdAt ? new Date(partner.createdAt).toLocaleDateString() : '—'}
                        </span>
                      </td>

                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm px-2 py-1"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => handleOpenDetail(partner.id)}
                        >
                          <Eye size={13} />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 bg-light bg-opacity-50">
                <div className="text-muted small">
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total requests)
                </div>
                <div className="d-flex align-items-center gap-1">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Comprehensive Detail & Review Modal */}
      {selectedPartnerId && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1055 }}
            onClick={() => {
              if (!statusUpdating) setSelectedPartnerId(null);
            }}
          />
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
              <div className="modal-content shadow border-0 rounded-4 overflow-hidden">
                <div className="modal-header border-bottom py-3 bg-light">
                  <div className="d-flex align-items-center gap-2">
                    <Building size={20} className="text-primary" />
                    <div>
                      <h5 className="modal-title fw-bold text-dark mb-0">
                        {detailData?.partnership.organizationName || 'Partnership Inquiry Review'}
                      </h5>
                      <span className="text-muted small font-monospace">
                        Ref: {detailData?.partnership.reference || selectedPartnerId}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    disabled={statusUpdating}
                    onClick={() => setSelectedPartnerId(null)}
                  />
                </div>

                <div className="modal-body py-4">
                  {loadingDetail ? (
                    <div className="p-5 text-center text-muted">
                      <span className="spinner-border spinner-border-sm text-primary me-2" />
                      <span>Loading complete partnership dossier & document references...</span>
                    </div>
                  ) : detailError ? (
                    <div className="alert alert-danger d-flex align-items-center gap-2">
                      <AlertCircle size={18} />
                      <div>{detailError}</div>
                    </div>
                  ) : detailData ? (
                    <>
                      {/* Success Feedback */}
                      {actionSuccess && (
                        <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
                          <CheckCircle size={18} />
                          <div>{actionSuccess}</div>
                        </div>
                      )}

                      <div className="row g-4">
                        {/* Left Column: Organization & Proposal Details */}
                        <div className="col-12 col-lg-7">
                          {/* Organization Overview */}
                          <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-light bg-opacity-50">
                            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                              <Building size={16} className="text-primary" />
                              <span>Organization Identity</span>
                            </h6>
                            <div className="row g-3">
                              <div className="col-sm-6">
                                <label className="text-muted small d-block">Entity Name</label>
                                <span className="fw-bold text-dark">{detailData.partnership.organizationName}</span>
                              </div>
                              <div className="col-sm-6">
                                <label className="text-muted small d-block">Organization Type</label>
                                <span className="badge bg-light text-dark border">
                                  {detailData.partnership.organizationType}
                                </span>
                              </div>
                              <div className="col-sm-6">
                                <label className="text-muted small d-block">Location</label>
                                <span className="text-dark small d-flex align-items-center gap-1">
                                  <Building size={13} className="text-muted" />
                                  <span>
                                    {detailData.partnership.city || ''}{' '}
                                    {detailData.partnership.country ? `(${detailData.partnership.country})` : '—'}
                                  </span>
                                </span>
                              </div>
                              <div className="col-sm-6">
                                <label className="text-muted small d-block">Partnership Framework</label>
                                <span className="badge bg-primary-subtle text-primary">
                                  {detailData.partnership.partnershipType}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Contact Person */}
                          <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-light bg-opacity-50">
                            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                              <UserCheck size={16} className="text-info" />
                              <span>Primary Representative</span>
                            </h6>
                            <div className="row g-3">
                              <div className="col-sm-6">
                                <label className="text-muted small d-block">Contact Full Name</label>
                                <span className="fw-semibold text-dark small">{detailData.partnership.contactPerson}</span>
                              </div>
                              <div className="col-sm-6">
                                <label className="text-muted small d-block">Email Address</label>
                                <a href={`mailto:${detailData.partnership.email}`} className="text-primary small text-decoration-none">
                                  {detailData.partnership.email}
                                </a>
                              </div>
                              <div className="col-sm-6">
                                <label className="text-muted small d-block">Telephone / Mobile</label>
                                <span className="text-dark small">{detailData.partnership.phone || '—'}</span>
                              </div>
                              <div className="col-sm-6">
                                <label className="text-muted small d-block">Inquiry Date</label>
                                <span className="text-muted small d-flex align-items-center gap-1">
                                  <Calendar size={13} />
                                  <span>{new Date(detailData.partnership.createdAt).toLocaleString()}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Proposal Scope & Narrative */}
                          <div className="card border-0 shadow-sm rounded-3 p-3 bg-light bg-opacity-50">
                            <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                              <MessageSquare size={16} className="text-primary" />
                              <span>Submitted Partnership Scope & Narrative</span>
                            </h6>
                            <div className="p-3 bg-white rounded-3 small text-dark border">
                              {detailData.partnership.proposal ? (
                                <p className="mb-0 text-break" style={{ whiteSpace: 'pre-wrap' }}>
                                  {detailData.partnership.proposal}
                                </p>
                              ) : (
                                <span className="text-muted italic">No proposal scope text provided with inquiry.</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Supporting Documents & Review Action */}
                        <div className="col-12 col-lg-5">
                          {/* Section: Uploaded License Documents */}
                          <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
                            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                              <ShieldCheck size={18} className="text-success" />
                              <span>Organization Registration License</span>
                            </h6>

                            {detailData.documents.length === 0 ? (
                              <div className="p-3 bg-light rounded text-muted small text-center">
                                No registration documents attached to this partnership inquiry.
                              </div>
                            ) : (
                              <div className="d-flex flex-column gap-2">
                                {detailData.documents.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="p-3 bg-info bg-opacity-10 rounded-3 border border-info border-opacity-25"
                                  >
                                    <div className="d-flex align-items-start justify-content-between mb-2">
                                      <div className="d-flex align-items-center gap-2 overflow-hidden">
                                        <FileCheck size={20} className="text-info flex-shrink-0" />
                                        <div className="overflow-hidden">
                                          <div
                                            className="fw-bold text-dark small text-truncate"
                                            title={doc.originalFilename}
                                          >
                                            {doc.originalFilename}
                                          </div>
                                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                                            {(doc.fileSize / 1024).toFixed(1)} KB • {doc.category}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action buttons: View and Download */}
                                    <div className="d-flex align-items-center gap-2 pt-2 border-top border-info border-opacity-25">
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 flex-fill justify-content-center"
                                        onClick={() => handlePreviewDocument(doc)}
                                      >
                                        <Eye size={14} />
                                        <span>Preview</span>
                                      </button>
                                      <a
                                        href={
                                          (doc.reviewUrl && !doc.reviewUrl.includes('mock-erkab'))
                                            ? doc.reviewUrl
                                            : ((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '') +
                                                (doc.downloadUrl?.startsWith('/api/v1') ? doc.downloadUrl.substring('/api/v1'.length) : doc.downloadUrl) +
                                                (getAuthToken() ? `?token=${encodeURIComponent(getAuthToken()!)}` : ''))
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 flex-fill justify-content-center"
                                      >
                                        <Download size={14} />
                                        <span>Download</span>
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Section: Decision Status & Review Action */}
                          <div className="card border border-primary-subtle bg-primary bg-opacity-10 rounded-3 p-3">
                            <h6 className="fw-bold text-dark mb-2">Record Review Decision</h6>
                            <p className="text-muted small mb-3">
                              Select updated status and include internal reviewer remarks. Decisions are recorded in the audit log.
                            </p>

                            <div className="mb-3">
                              <label className="form-label small fw-semibold text-dark mb-1">
                                Current Status
                              </label>
                              <div>
                                <StatusBadge status={detailData.partnership.status} />
                              </div>
                            </div>

                            {/* Previous Review History */}
                            {detailData.partnership.reviewedBy && (
                              <div className="p-2 mb-3 bg-white rounded border small text-muted">
                                <div>
                                  <strong>Last Reviewed By:</strong> {detailData.partnership.reviewedBy}
                                </div>
                                {detailData.partnership.reviewedAt && (
                                  <div>
                                    <strong>Date:</strong> {new Date(detailData.partnership.reviewedAt).toLocaleString()}
                                  </div>
                                )}
                                {detailData.partnership.reviewNotes && (
                                  <div className="mt-1">
                                    <strong>Notes:</strong> {detailData.partnership.reviewNotes}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="mb-3">
                              <label className="form-label small fw-semibold text-dark mb-1">
                                Update Status
                              </label>
                              <select
                                className="form-select form-select-sm"
                                value={decisionStatus}
                                onChange={(e) => setDecisionStatus(e.target.value)}
                              >
                                <option value="UNDER_REVIEW">UNDER_REVIEW — In evaluation</option>
                                <option value="APPROVED">APPROVED — Formal institutional partner</option>
                                <option value="REJECTED">REJECTED — Declined proposal</option>
                                <option value="PENDING">PENDING — Reset to pending</option>
                              </select>
                            </div>

                            <div className="mb-3">
                              <label className="form-label small fw-semibold text-dark mb-1">
                                Internal Reviewer Notes
                              </label>
                              <textarea
                                className="form-control form-control-sm"
                                rows={3}
                                placeholder="Enter evaluation comments, legal checks, or follow-up milestones..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                              />
                            </div>

                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-primary flex-fill d-inline-flex align-items-center justify-content-center gap-1 shadow-sm"
                                disabled={statusUpdating}
                                onClick={() => handleInitiateDecision(decisionStatus)}
                              >
                                {statusUpdating && <span className="spinner-border spinner-border-sm" />}
                                <span>Save Decision</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="modal-footer border-top py-2 bg-light">
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setSelectedPartnerId(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Document Safe Preview Modal */}
      {previewDoc && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1065 }} onClick={() => setPreviewDoc(null)} />
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1070 }}>
            <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
              <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
                <div className="modal-header border-bottom py-3 bg-light">
                  <div className="d-flex align-items-center gap-2">
                    <FileCheck size={20} className="text-info" />
                    <h5 className="modal-title fw-bold text-dark mb-0 text-truncate" style={{ maxWidth: '600px' }}>
                      Document Preview: {previewDoc.filename}
                    </h5>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setPreviewDoc(null)} />
                </div>
                <div className="modal-body p-0" style={{ height: '75vh', backgroundColor: '#525659' }}>
                  {previewDoc.isPdf ? (
                    <iframe
                      src={previewDoc.url}
                      className="w-100 h-100 border-0"
                      title={previewDoc.filename}
                    />
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center p-3">
                      <img
                        src={previewDoc.url}
                        alt={previewDoc.filename}
                        className="img-fluid rounded shadow"
                        style={{ maxHeight: '70vh' }}
                      />
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top py-2 bg-light d-flex justify-content-between">
                  <span className="text-muted small">
                    Served securely through authenticated Erkab backend document proxy
                  </span>
                  <div className="d-flex gap-2">
                    <a
                      href={previewDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                    >
                      <ExternalLink size={14} />
                      <span>Open in New Tab</span>
                    </a>
                    <a
                      href={previewDoc.url.replace('/view', '/download')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                    >
                      <Download size={14} />
                      <span>Download File</span>
                    </a>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setPreviewDoc(null)}>
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal for Final Decision */}
      {confirmOpen && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1075 }} onClick={() => setConfirmOpen(false)} />
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1080 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow border-0 rounded-4">
                <div className="modal-header border-bottom py-3">
                  <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                    <AlertCircle size={20} className={confirmPendingStatus === 'APPROVED' ? 'text-success' : 'text-danger'} />
                    <span>Confirm Partnership Decision</span>
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setConfirmOpen(false)} />
                </div>
                <div className="modal-body py-4">
                  <p className="text-dark mb-2">
                    Are you sure you want to mark this partnership request as{' '}
                    <strong className={confirmPendingStatus === 'APPROVED' ? 'text-success' : 'text-danger'}>
                      {confirmPendingStatus}
                    </strong>
                    ?
                  </p>
                  <p className="text-muted small mb-0">
                    This decision will be officially logged in the administrative audit log alongside your reviewer identity and timestamp.
                  </p>
                </div>
                <div className="modal-footer border-top py-2 bg-light">
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    disabled={statusUpdating}
                    onClick={() => setConfirmOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${confirmPendingStatus === 'APPROVED' ? 'btn-success' : 'btn-danger'} d-inline-flex align-items-center gap-1`}
                    disabled={statusUpdating}
                    onClick={() => handleSubmitReview(confirmPendingStatus)}
                  >
                    {statusUpdating && <span className="spinner-border spinner-border-sm" />}
                    <span>Confirm {confirmPendingStatus}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
