'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { DataTable, Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { apiClient } from '../../../lib/api/client';
import {
  GraduationCap,
  Users,
  BookOpen,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  FileText,
  ExternalLink,
  Download,
  Clock,
  AlertTriangle,
  Award,
  Layers,
  Search,
  Check
} from 'lucide-react';

type TabType = 'students' | 'trainers' | 'tutors';

interface DocumentItem {
  id: string;
  category: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  cloudinaryPublicId: string;
  createdAt: string;
  reviewUrl: string;
}

interface ReviewItem {
  id: string;
  reviewerId: string;
  reviewerName: string;
  decision: string;
  notes?: string;
  createdAt: string;
}

interface ApplicationDetailData {
  application: any;
  documents: DocumentItem[];
  reviews: ReviewItem[];
}

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('students');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Search & Filter
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Counts for tabs
  const [counts, setCounts] = useState<{ students: number; trainers: number; tutors: number }>({
    students: 0,
    trainers: 0,
    tutors: 0,
  });

  // Modal & Detail state
  const [selectedAppSummary, setSelectedAppSummary] = useState<any | null>(null);
  const [detailData, setDetailData] = useState<ApplicationDetailData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Status review state
  const [pendingDecision, setPendingDecision] = useState<string>('APPROVED');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDecision, setConfirmDecision] = useState<string>('');

  const fetchApplications = useCallback(async (tab: TabType, status?: string, search?: string) => {
    try {
      setLoading(true);
      setFetchError(null);

      const params = new URLSearchParams();
      if (status && status !== 'ALL') {
        params.append('status', status);
      }
      if (search && search.trim()) {
        params.append('search', search.trim());
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await apiClient<{ success: boolean; data: any[]; total: number }>(
        `/admin/applications/${tab}${queryString}`
      );

      const data = res.data || [];
      setItems(data);
      setCounts((prev) => ({ ...prev, [tab]: res.total || data.length }));
    } catch (err: any) {
      setFetchError(err.message || 'Failed to retrieve applications from backend.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications(activeTab, statusFilter, searchQuery);
  }, [activeTab, statusFilter, searchQuery, fetchApplications]);

  // Fetch full details when an application is opened for review
  const handleOpenReview = async (app: any) => {
    setSelectedAppSummary(app);
    setDetailData(null);
    setDetailError(null);
    setLoadingDetail(true);
    setReviewNotes('');
    setPendingDecision(app.status === 'APPROVED' ? 'UNDER_REVIEW' : 'APPROVED');

    try {
      const res = await apiClient<{ success: boolean; data: ApplicationDetailData }>(
        `/admin/applications/${activeTab}/${app.id}`
      );
      if (res.data) {
        setDetailData(res.data);
      } else {
        throw new Error('No detailed application data returned');
      }
    } catch (err: any) {
      setDetailError(err.message || 'Unable to retrieve complete application details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseReview = () => {
    setSelectedAppSummary(null);
    setDetailData(null);
    setDetailError(null);
    setReviewNotes('');
  };

  const executeStatusUpdate = async (decision: string) => {
    if (!selectedAppSummary) return;

    try {
      setStatusUpdating(true);
      await apiClient(`/admin/applications/${activeTab}/${selectedAppSummary.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: decision,
          notes: reviewNotes.trim() || undefined,
        }),
      });

      const ref = selectedAppSummary.referenceNumber || selectedAppSummary.id;
      setActionSuccess(`Application ${ref} has been updated to ${decision}.`);
      setConfirmOpen(false);

      // Refresh both list and detail modal
      fetchApplications(activeTab, statusFilter, searchQuery);
      handleOpenReview(selectedAppSummary);
    } catch (err: any) {
      alert(err.message || 'Failed to update application status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const promptStatusUpdate = (decision: string) => {
    setConfirmDecision(decision);
    setConfirmOpen(true);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatCategory = (cat: string) => {
    switch (cat) {
      case 'EDUCATION_CERTIFICATE':
        return 'Education Certificate / Degree';
      case 'NATIONAL_ID':
        return 'National ID / Passport';
      case 'IDEA_PROPOSAL':
        return 'Project Idea Proposal';
      case 'RESUME':
        return 'Curriculum Vitae / Resume';
      default:
        return cat.replace(/_/g, ' ');
    }
  };

  // Student Columns
  const studentColumns: Column<any>[] = [
    {
      header: 'Reference #',
      accessor: 'referenceNumber',
      className: 'font-monospace fw-medium small',
    },
    {
      header: 'Applicant Name',
      render: (row) => (
        <div>
          <span className="fw-semibold text-dark">{row.fullName}</span>
          <div className="text-muted small d-flex align-items-center gap-1">
            <Mail size={12} />
            <span>{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Training Program',
      render: (row) => (
        <div>
          <span className="badge bg-light text-primary border small">
            {row.programTitle || row.programId || 'Web Development'}
          </span>
          {row.programCategory && (
            <div className="text-muted small mt-1">{row.programCategory}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Contact',
      render: (row) => (
        <div className="small">
          <span className="text-dark d-flex align-items-center gap-1">
            <Phone size={12} className="text-muted" />
            <span>{row.telegramPhone || '—'}</span>
          </span>
          <span className="text-muted small">Age: {row.age || '—'} • {row.gender || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Documents',
      render: (row) => {
        const count = row.documentCount !== undefined ? Number(row.documentCount) : 3;
        return (
          <span className="badge bg-light text-secondary border small d-inline-flex align-items-center gap-1">
            <FileText size={12} className="text-primary" />
            <span>{count} {count === 1 ? 'Doc' : 'Docs'}</span>
          </span>
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
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
          onClick={() => handleOpenReview(row)}
        >
          <Eye size={14} />
          <span>Review</span>
        </button>
      ),
    },
  ];

  // Trainer Columns
  const trainerColumns: Column<any>[] = [
    {
      header: 'Reference #',
      accessor: 'referenceNumber',
      className: 'font-monospace fw-medium small',
    },
    {
      header: 'Trainer Name',
      render: (row) => (
        <div>
          <span className="fw-semibold text-dark">{row.fullName}</span>
          <div className="text-muted small d-flex align-items-center gap-1">
            <Mail size={12} />
            <span>{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Expertise Track',
      render: (row) => (
        <span className="badge bg-light text-dark border small">
          {row.expertiseTrack || 'Engineering'}
        </span>
      ),
    },
    {
      header: 'Experience',
      render: (row) => (
        <span className="small text-secondary">{row.yearsOfExperience || '3+ Years'}</span>
      ),
    },
    {
      header: 'Contact',
      render: (row) => (
        <span className="small text-dark d-flex align-items-center gap-1">
          <Phone size={12} className="text-muted" />
          <span>{row.telegramPhone || '—'}</span>
        </span>
      ),
    },
    {
      header: 'Documents',
      render: (row) => (
        <span className="badge bg-light text-secondary border small d-inline-flex align-items-center gap-1">
          <FileText size={12} className="text-success" />
          <span>CV Attached</span>
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status || 'PENDING'} />,
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
          onClick={() => handleOpenReview(row)}
        >
          <Eye size={14} />
          <span>Review</span>
        </button>
      ),
    },
  ];

  // Tutor Columns
  const tutorColumns: Column<any>[] = [
    {
      header: 'Reference #',
      accessor: 'referenceNumber',
      className: 'font-monospace fw-medium small',
    },
    {
      header: 'Student / Requester',
      render: (row) => (
        <div>
          <span className="fw-semibold text-dark">
            {row.studentOrApplicantName || row.fullName || 'Tutoring Student'}
          </span>
          <div className="text-muted small d-flex align-items-center gap-1">
            <Phone size={12} />
            <span>{row.parentOrContactPhone || row.phone || '—'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Grade & Subjects',
      render: (row) => (
        <div>
          <span className="badge bg-light text-dark border small">{row.gradeLevel}</span>
          <div className="text-muted small mt-1">{row.subjects || 'General Curriculum'}</div>
        </div>
      ),
    },
    {
      header: 'Delivery Preference',
      render: (row) => (
        <span className="small text-secondary">{row.deliveryPreference || 'Online'}</span>
      ),
    },
    {
      header: 'Payment Status',
      render: (row) => (
        <div>
          {row.paymentStatus ? (
            <span
              className={`badge small ${
                row.paymentStatus === 'SUCCEEDED' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'
              }`}
            >
              {row.paymentStatus === 'SUCCEEDED' ? 'PAID (DEMO)' : row.paymentStatus}
            </span>
          ) : (
            <span className="badge bg-light text-muted border small">NO FEE</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status || 'PENDING'} />,
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
          onClick={() => handleOpenReview(row)}
        >
          <Eye size={14} />
          <span>Review</span>
        </button>
      ),
    },
  ];

  const appData = detailData?.application || selectedAppSummary;

  return (
    <AdminShell requiredRole="SUPER_ADMIN">
      <div className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Student & Instructional Applications</h1>
          <p className="text-muted small mb-0">
            Authoritatively inspect, review credentials, verify Cloudinary supporting documents, and record admissions decisions.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 align-self-start"
          onClick={() => fetchApplications(activeTab, statusFilter, searchQuery)}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="alert alert-success alert-dismissible fade show py-2 px-3 small rounded-3 mb-3 d-flex align-items-center justify-content-between">
          <span className="d-flex align-items-center gap-2">
            <CheckCircle size={16} />
            <span>{actionSuccess}</span>
          </span>
          <button type="button" className="btn-close p-2" onClick={() => setActionSuccess(null)} />
        </div>
      )}

      {fetchError && (
        <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center justify-content-between">
          <span className="d-flex align-items-center gap-2">
            <AlertTriangle size={16} />
            <span>{fetchError}</span>
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => fetchApplications(activeTab, statusFilter, searchQuery)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-pills mb-3 border-bottom pb-2">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link btn-sm d-flex align-items-center gap-2 ${
              activeTab === 'students' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('students')}
          >
            <GraduationCap size={16} />
            <span>Student Scholarships ({activeTab === 'students' ? items.length : counts.students || '...'})</span>
          </button>
        </li>
        <li className="nav-item ms-2">
          <button
            type="button"
            className={`nav-link btn-sm d-flex align-items-center gap-2 ${
              activeTab === 'trainers' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('trainers')}
          >
            <Users size={16} />
            <span>Trainers & Mentors ({activeTab === 'trainers' ? items.length : counts.trainers || '...'})</span>
          </button>
        </li>
        <li className="nav-item ms-2">
          <button
            type="button"
            className={`nav-link btn-sm d-flex align-items-center gap-2 ${
              activeTab === 'tutors' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('tutors')}
          >
            <BookOpen size={16} />
            <span>Academic Tutors ({activeTab === 'tutors' ? items.length : counts.tutors || '...'})</span>
          </button>
        </li>
      </ul>

      {/* Search and Status Filters */}
      <div className="row g-2 mb-3 align-items-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white border-end-0">
              <Search size={14} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder={`Search ${activeTab} by name, email, ref...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="col-auto">
          <select
            className="form-select form-select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved / Accepted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="WAITLISTED">Waitlisted</option>
            <option value="NEEDS_INFO">Needs Info</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={
          activeTab === 'students'
            ? studentColumns
            : activeTab === 'trainers'
            ? trainerColumns
            : tutorColumns
        }
        data={items}
        loading={loading}
        searchPlaceholder={`Filter loaded ${activeTab}...`}
        emptyTitle={`No ${activeTab} applications found`}
        emptyMessage={`No applications currently registered in the database for ${activeTab}. New submissions from the public website will automatically appear here.`}
      />

      {/* Detail Review Modal */}
      {selectedAppSummary && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1055 }} onClick={handleCloseReview} />
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
              <div className="modal-content shadow border-0 rounded-4">
                <div className="modal-header border-bottom py-3 px-4 bg-light bg-opacity-50">
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h5 className="modal-title fw-bold text-dark mb-0">Application Review</h5>
                      <StatusBadge status={appData?.status || 'PENDING'} />
                    </div>
                    <span className="text-muted small font-monospace">
                      Reference: {appData?.referenceNumber || appData?.id}
                    </span>
                  </div>
                  <button type="button" className="btn-close" onClick={handleCloseReview} />
                </div>

                <div className="modal-body p-4">
                  {loadingDetail ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm mb-2" role="status" />
                      <div className="text-muted small">Loading applicant credentials and Cloudinary documents...</div>
                    </div>
                  ) : detailError ? (
                    <div className="alert alert-warning small p-3 rounded-3 mb-3">
                      <div className="fw-semibold mb-1">Notice</div>
                      <div>{detailError}</div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-warning mt-2"
                        onClick={() => handleOpenReview(selectedAppSummary)}
                      >
                        Retry Loading Details
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Section 1: Applicant Details */}
                      <div className="card border-0 bg-light rounded-3 p-3 mb-4">
                        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                          <Award size={16} className="text-primary" />
                          <span>Applicant Profile & Details</span>
                        </h6>
                        <div className="row g-3 small">
                          <div className="col-12 col-md-4">
                            <label className="text-muted d-block small">Full Name</label>
                            <span className="fw-semibold text-dark fs-6">
                              {appData?.fullName || appData?.studentOrApplicantName || '—'}
                            </span>
                          </div>
                          <div className="col-12 col-md-4">
                            <label className="text-muted d-block small">Email Address</label>
                            <span className="text-dark d-flex align-items-center gap-1">
                              <Mail size={13} className="text-muted" />
                              <span>{appData?.email || '—'}</span>
                            </span>
                          </div>
                          <div className="col-12 col-md-4">
                            <label className="text-muted d-block small">Telegram / Phone</label>
                            <span className="text-dark d-flex align-items-center gap-1">
                              <Phone size={13} className="text-muted" />
                              <span>{appData?.telegramPhone || appData?.parentOrContactPhone || '—'}</span>
                            </span>
                          </div>

                          {/* Student Specific Details */}
                          {activeTab === 'students' && (
                            <>
                              <div className="col-12 col-md-4">
                                <label className="text-muted d-block small">Gender / Age</label>
                                <span className="text-dark">
                                  {appData?.gender || '—'} • {appData?.age ? `${appData.age} Years` : '—'}
                                </span>
                              </div>
                              <div className="col-12 col-md-4">
                                <label className="text-muted d-block small">Class Completion Year</label>
                                <span className="text-dark">{appData?.classCompletionYear || '—'}</span>
                              </div>
                              <div className="col-12 col-md-4">
                                <label className="text-muted d-block small">Selected Program Track</label>
                                <span className="badge bg-primary text-white">
                                  {appData?.programTitle || appData?.programId || 'Standard Track'}
                                </span>
                              </div>
                            </>
                          )}

                          {/* Trainer Specific Details */}
                          {activeTab === 'trainers' && (
                            <>
                              <div className="col-12 col-md-4">
                                <label className="text-muted d-block small">Expertise Track</label>
                                <span className="text-dark fw-medium">{appData?.expertiseTrack || '—'}</span>
                              </div>
                              <div className="col-12 col-md-4">
                                <label className="text-muted d-block small">Years of Experience</label>
                                <span className="text-dark">{appData?.yearsOfExperience || '—'}</span>
                              </div>
                              <div className="col-12 col-md-4">
                                <label className="text-muted d-block small">Portfolio / Profile Link</label>
                                {appData?.portfolioUrl ? (
                                  <a
                                    href={appData.portfolioUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary text-truncate d-inline-flex align-items-center gap-1"
                                  >
                                    <span>{appData.portfolioUrl}</span>
                                    <ExternalLink size={12} />
                                  </a>
                                ) : (
                                  <span className="text-muted">No external link provided</span>
                                )}
                              </div>
                              {appData?.teachingStatement && (
                                <div className="col-12">
                                  <label className="text-muted d-block small">Teaching Philosophy & Statement</label>
                                  <div className="p-3 bg-white rounded border text-dark mt-1">
                                    {appData.teachingStatement}
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* Tutor Specific Details */}
                          {activeTab === 'tutors' && (
                            <>
                              <div className="col-12 col-md-4">
                                <label className="text-muted d-block small">Academic Grade Level</label>
                                <span className="text-dark fw-medium">{appData?.gradeLevel || '—'}</span>
                              </div>
                              <div className="col-12 col-md-4">
                                <label className="text-muted d-block small">Subjects Requested / Taught</label>
                                <span className="text-dark">{appData?.subjects || '—'}</span>
                              </div>
                              <div className="col-12 col-md-4">
                                <label className="text-muted d-block small">Delivery Preference</label>
                                <span className="text-dark">{appData?.deliveryPreference || 'Online'}</span>
                              </div>
                              {appData?.locationDetails && (
                                <div className="col-12 col-md-6">
                                  <label className="text-muted d-block small">Location Details</label>
                                  <span className="text-dark">{appData.locationDetails}</span>
                                </div>
                              )}
                              {appData?.hourlyRate && (
                                <div className="col-12 col-md-6">
                                  <label className="text-muted d-block small">Requested Rate</label>
                                  <span className="text-dark">{appData.hourlyRate}</span>
                                </div>
                              )}
                              {appData?.paymentReference && (
                                <div className="col-12 col-md-6">
                                  <label className="text-muted d-block small">Payment Registration</label>
                                  <span className="font-monospace text-dark">
                                    Ref: {appData.paymentReference} • {appData.paymentAmount || 500} ETB ({appData.paymentStatus || 'PENDING'})
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Section 2: Supporting Documents */}
                      <div className="card border rounded-3 p-3 mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                            <FileText size={16} className="text-primary" />
                            <span>Supporting Documents & Credentials</span>
                          </h6>
                          <span className="badge bg-light text-secondary border small">
                            {detailData?.documents?.length || 0} Documents Uploaded
                          </span>
                        </div>

                        {detailData?.documents && detailData.documents.length > 0 ? (
                          <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 small">
                              <thead className="table-light">
                                <tr>
                                  <th>Document Category</th>
                                  <th>Original Filename</th>
                                  <th>Size</th>
                                  <th>Cloudinary Reference</th>
                                  <th className="text-end">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detailData.documents.map((doc) => (
                                  <tr key={doc.id}>
                                    <td>
                                      <span className="badge bg-light text-dark border">
                                        {formatCategory(doc.category)}
                                      </span>
                                    </td>
                                    <td>
                                      <div className="fw-medium text-dark d-flex align-items-center gap-2">
                                        <FileText size={15} className="text-primary" />
                                        <span>{doc.originalFilename}</span>
                                      </div>
                                    </td>
                                    <td className="text-muted">{formatFileSize(doc.fileSize)}</td>
                                    <td>
                                      <span className="font-monospace text-muted small">
                                        {doc.cloudinaryPublicId?.slice(0, 30)}...
                                      </span>
                                    </td>
                                    <td className="text-end">
                                      <div className="d-flex align-items-center justify-content-end gap-2">
                                        {doc.reviewUrl ? (
                                          <>
                                            <a
                                              href={doc.reviewUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                              title="View secured document in browser tab"
                                            >
                                              <ExternalLink size={13} />
                                              <span>View Secure</span>
                                            </a>
                                            <a
                                              href={doc.reviewUrl}
                                              download={doc.originalFilename}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                              title={`Download ${doc.originalFilename}`}
                                            >
                                              <Download size={13} />
                                              <span>Download</span>
                                            </a>
                                          </>
                                        ) : (
                                          <span className="text-muted small">Not Available</span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-4 bg-light rounded text-center text-muted small">
                            <FileText size={24} className="mb-2 text-muted opacity-50" />
                            <div>No supporting documents attached or registered for this application.</div>
                          </div>
                        )}
                      </div>

                      {/* Section 3: Review History */}
                      {detailData?.reviews && detailData.reviews.length > 0 && (
                        <div className="card border rounded-3 p-3 mb-4">
                          <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                            <Clock size={16} className="text-primary" />
                            <span>Review & Admissions History</span>
                          </h6>
                          <div className="d-flex flex-column gap-2">
                            {detailData.reviews.map((rev) => (
                              <div key={rev.id} className="p-3 bg-light rounded border small">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <div className="d-flex align-items-center gap-2">
                                    <span className="fw-semibold text-dark">{rev.reviewerName}</span>
                                    <StatusBadge status={rev.decision} />
                                  </div>
                                  <span className="text-muted small">
                                    {new Date(rev.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                {rev.notes && <div className="text-secondary mt-1">{rev.notes}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 4: Decision & Status Update Form */}
                      <div className="card border border-primary-subtle bg-primary bg-opacity-10 rounded-3 p-3">
                        <h6 className="fw-bold text-dark mb-2">Record Review Decision</h6>
                        <p className="text-muted small mb-3">
                          Select the updated admissions status and include any internal review remarks. Decisions are recorded in the audit log.
                        </p>
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-dark mb-1">Internal Reviewer Notes</label>
                          <textarea
                            className="form-control form-control-sm"
                            rows={3}
                            placeholder="Enter admissions evaluation, interview remarks, or required next steps..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                          />
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                            disabled={statusUpdating || appData?.status === 'APPROVED'}
                            onClick={() => promptStatusUpdate('APPROVED')}
                          >
                            <CheckCircle size={15} />
                            <span>Approve Application</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger d-inline-flex align-items-center gap-1"
                            disabled={statusUpdating || appData?.status === 'REJECTED'}
                            onClick={() => promptStatusUpdate('REJECTED')}
                          >
                            <XCircle size={15} />
                            <span>Reject Application</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                            disabled={statusUpdating || appData?.status === 'UNDER_REVIEW'}
                            onClick={() => promptStatusUpdate('UNDER_REVIEW')}
                          >
                            <Clock size={15} />
                            <span>Mark Under Review</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning d-inline-flex align-items-center gap-1"
                            disabled={statusUpdating || appData?.status === 'WAITLISTED'}
                            onClick={() => promptStatusUpdate('WAITLISTED')}
                          >
                            <Layers size={15} />
                            <span>Place on Waitlist</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            disabled={statusUpdating || appData?.status === 'PENDING'}
                            onClick={() => promptStatusUpdate('PENDING')}
                          >
                            Reset to Pending
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-footer border-top py-2 px-4 bg-light bg-opacity-25">
                  <button type="button" className="btn btn-sm btn-secondary" onClick={handleCloseReview}>
                    Close Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirm Admissions Decision"
        message={`Are you sure you want to change the status of application ${
          selectedAppSummary?.referenceNumber || selectedAppSummary?.id
        } to "${confirmDecision}"? This action will be audited.`}
        confirmText={`Yes, Set to ${confirmDecision}`}
        variant={confirmDecision === 'REJECTED' ? 'danger' : 'primary'}
        loading={statusUpdating}
        onConfirm={() => executeStatusUpdate(confirmDecision)}
        onClose={() => setConfirmOpen(false)}
      />
    </AdminShell>
  );
}
