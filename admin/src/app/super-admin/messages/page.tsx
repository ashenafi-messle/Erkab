'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { StatCard } from '../../../components/common/StatCard';
import { apiClient } from '../../../lib/api/client';
import { useAuth } from '../../../context/AuthContext';
import {
  Mail,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Calendar,
  Tag,
  ShieldAlert,
  FileText,
  Check,
  X,
  Inbox
} from 'lucide-react';

interface ContactMessageItem {
  id: string;
  referenceCode: string;
  fullName: string;
  email: string;
  phone?: string | null;
  subject: string;
  category: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'WAITING_FOR_VISITOR' | 'RESOLVED' | 'CLOSED' | 'SPAM';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  internalNotes?: string | null;
  readAt?: string | null;
  resolvedAt?: string | null;
  assignedAdminId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ContactStats {
  total: number;
  newCount: number;
  inProgressCount: number;
  waitingCount: number;
  resolvedCount: number;
  closedCount: number;
  spamCount: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'General Inquiry',
  GENERAL_INQUIRY: 'General Inquiry',
  TRAINING_PROGRAMS: 'Training Programs',
  SCHOLARSHIPS: 'Scholarship Application',
  SCHOLARSHIP_APPLICATION: 'Scholarship Application',
  TUTORING: 'Tutoring Services',
  PARTNERSHIPS: 'Partnership & Mentorship',
  PARTNERSHIP_MENTORSHIP: 'Partnership & Mentorship',
  DONATIONS: 'Donations & Giving',
  TECHNICAL_SUPPORT: 'Technical Support',
  OTHER: 'Other Inquiries',
};

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; bg: string; text: string }
> = {
  NEW: { label: 'New', badgeClass: 'badge bg-primary text-white', bg: '#e8f4fc', text: '#0878B9' },
  IN_PROGRESS: { label: 'In Progress', badgeClass: 'badge bg-warning text-dark', bg: '#fef3c7', text: '#b45309' },
  WAITING_FOR_VISITOR: { label: 'Waiting for Visitor', badgeClass: 'badge bg-info text-dark', bg: '#e0f2fe', text: '#0369a1' },
  RESOLVED: { label: 'Resolved', badgeClass: 'badge bg-success text-white', bg: '#dcfce7', text: '#15803d' },
  CLOSED: { label: 'Closed', badgeClass: 'badge bg-secondary text-white', bg: '#f1f5f9', text: '#475569' },
  SPAM: { label: 'Spam', badgeClass: 'badge bg-danger text-white', bg: '#fee2e2', text: '#b91c1c' },
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  LOW: { label: 'Low', badgeClass: 'badge bg-light text-secondary border' },
  NORMAL: { label: 'Normal', badgeClass: 'badge bg-secondary text-white' },
  HIGH: { label: 'High', badgeClass: 'badge bg-warning text-dark' },
  URGENT: { label: 'Urgent', badgeClass: 'badge bg-danger text-white' },
};

export default function SuperAdminMessagesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    newCount: 0,
    inProgressCount: 0,
    waitingCount: 0,
    resolvedCount: 0,
    closedCount: 0,
    spamCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal & Edit State
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);
  const [editStatus, setEditStatus] = useState<string>('NEW');
  const [editPriority, setEditPriority] = useState<string>('NORMAL');
  const [editNotes, setEditNotes] = useState<string>('');
  const [savingChanges, setSavingChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiClient<{ success: boolean; data: any }>(
        '/admin/contact-messages/stats'
      );
      if (res?.data) {
        const raw = res.data;
        setStats({
          total: Number(raw.total ?? raw.TOTAL ?? 0),
          newCount: Number(raw.newCount ?? raw.NEW ?? 0),
          inProgressCount: Number(raw.inProgressCount ?? raw.IN_PROGRESS ?? 0),
          waitingCount: Number(raw.waitingCount ?? raw.WAITING_FOR_VISITOR ?? 0),
          resolvedCount: Number(raw.resolvedCount ?? raw.RESOLVED ?? 0),
          closedCount: Number(raw.closedCount ?? raw.CLOSED ?? 0),
          spamCount: Number(raw.spamCount ?? raw.SPAM ?? 0),
        });
      }
    } catch (err: any) {
      console.warn('Failed to load contact message stats:', err?.message);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);

      const res = await apiClient<{
        success: boolean;
        data: {
          items?: ContactMessageItem[];
          messages?: ContactMessageItem[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        };
      }>(`/admin/contact-messages?${params.toString()}`);

      if (res?.data) {
        const msgList = res.data.items || res.data.messages || [];
        setMessages(msgList);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalCount(res.data.pagination?.total || 0);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to retrieve messages. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, categoryFilter]);

  useEffect(() => {
    if (!user || authLoading) return;
    fetchStats();
  }, [user, authLoading, fetchStats]);

  useEffect(() => {
    if (!user || authLoading) return;
    fetchMessages();
  }, [user, authLoading, fetchMessages]);

  const handleOpenDetail = (msg: ContactMessageItem) => {
    setSelectedMessage(msg);
    setEditStatus(msg.status);
    setEditPriority(msg.priority);
    setEditNotes(msg.internalNotes || '');
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleCloseDetail = () => {
    setSelectedMessage(null);
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedMessage) return;
    setSavingChanges(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await apiClient<{ success: boolean; data: ContactMessageItem }>(
        `/admin/contact-messages/${selectedMessage.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: editStatus,
            priority: editPriority,
            internalNotes: editNotes,
          }),
        }
      );

      if (res?.data) {
        setSaveSuccess(true);
        setSelectedMessage(res.data);
        // Refresh items & stats
        fetchMessages();
        fetchStats();
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to update message record.');
    } finally {
      setSavingChanges(false);
    }
  };

  return (
    <AdminShell>
      <div className="container-fluid py-4">
        {/* Page Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">
              <Mail className="text-primary" size={28} />
              Contact Messages & Inquiries
            </h1>
            <p className="text-muted small mb-0">
              Manage public inquiries, scholarship questions, tutoring requests, and institutional communications.
            </p>
          </div>
          <button
            onClick={() => {
              fetchStats();
              fetchMessages();
            }}
            disabled={loading}
            className="btn btn-outline-secondary d-flex align-items-center gap-2 shadow-sm"
          >
            <RefreshCw size={16} className={loading ? 'spinner-border spinner-border-sm' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-2">
            <StatCard
              title="Total Messages"
              value={stats.total}
              icon={Inbox}
              variant="blue"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-2">
            <StatCard
              title="New Inquiries"
              value={stats.newCount}
              icon={AlertCircle}
              variant="cyan"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-2">
            <StatCard
              title="In Progress"
              value={stats.inProgressCount}
              icon={Clock}
              variant="warning"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-2">
            <StatCard
              title="Waiting Visitor"
              value={stats.waitingCount}
              icon={AlertTriangle}
              variant="navy"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-2">
            <StatCard
              title="Resolved"
              value={stats.resolvedCount}
              icon={CheckCircle}
              variant="success"
            />
          </div>
          <div className="col-12 col-sm-6 col-xl-2">
            <StatCard
              title="Spam / Closed"
              value={(stats.spamCount || 0) + (stats.closedCount || 0)}
              icon={ShieldAlert}
              variant="danger"
            />
          </div>
        </div>

        {/* Filter Controls Card */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Search size={16} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-start-0"
                    placeholder="Search reference, name, email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <Filter size={16} className="text-muted" />
                  </span>
                  <select
                    className="form-select bg-light"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="NEW">New</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="WAITING_FOR_VISITOR">Waiting for Visitor</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                    <option value="SPAM">Spam</option>
                  </select>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <Tag size={16} className="text-muted" />
                  </span>
                  <select
                    className="form-select bg-light"
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="ALL">All Categories</option>
                    <option value="GENERAL_INQUIRY">General Inquiry</option>
                    <option value="TRAINING_PROGRAMS">Training Programs</option>
                    <option value="SCHOLARSHIP_APPLICATION">Scholarship Application</option>
                    <option value="TUTORING">Tutoring Services</option>
                    <option value="PARTNERSHIP_MENTORSHIP">Partnership & Mentorship</option>
                    <option value="DONATIONS">Donations & Giving</option>
                    <option value="TECHNICAL_SUPPORT">Technical Support</option>
                    <option value="OTHER">Other Inquiries</option>
                  </select>
                </div>
              </div>
              <div className="col-12 col-md-2 text-md-end d-flex align-items-center justify-content-md-end">
                <span className="text-muted small">
                  Showing <strong>{messages.length}</strong> of <strong>{totalCount}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Table Card */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2 small">Loading contact inquiries...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <div className="alert alert-danger d-inline-block text-start mb-0">
                  <AlertCircle size={20} className="me-2" />
                  {error}
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-5">
                <Inbox size={48} className="text-muted mb-2 opacity-50" />
                <h6 className="fw-semibold text-secondary">No inquiries found</h6>
                <p className="text-muted small mb-0">
                  {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                    ? 'Try adjusting your filters or search keywords.'
                    : 'New public contact inquiries will appear here.'}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Reference</th>
                      <th>Date</th>
                      <th>Visitor</th>
                      <th>Category</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((msg) => {
                      const statusCfg = STATUS_CONFIG[msg.status] || STATUS_CONFIG.NEW;
                      const priorityCfg = PRIORITY_CONFIG[msg.priority] || PRIORITY_CONFIG.NORMAL;
                      const isUnread = !msg.readAt;

                      return (
                        <tr
                          key={msg.id}
                          className={isUnread ? 'table-light fw-medium' : ''}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleOpenDetail(msg)}
                        >
                          <td className="ps-4">
                            <span className="badge bg-light text-dark font-monospace border">
                              {msg.referenceCode}
                            </span>
                            {isUnread && (
                              <span className="badge bg-primary ms-2" style={{ fontSize: '0.65rem' }}>
                                NEW
                              </span>
                            )}
                          </td>
                          <td className="text-muted small" style={{ whiteSpace: 'nowrap' }}>
                            {new Date(msg.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <span className="fw-semibold text-dark">{msg.fullName}</span>
                              <span className="text-muted small">{msg.email}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-secondary border">
                              {CATEGORY_LABELS[msg.category] || msg.category}
                            </span>
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: 220 }}>
                              {msg.subject}
                            </div>
                          </td>
                          <td>
                            <span className={statusCfg.badgeClass}>{statusCfg.label}</span>
                          </td>
                          <td>
                            <span className={priorityCfg.badgeClass}>{priorityCfg.label}</span>
                          </td>
                          <td className="text-end pe-4" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                              onClick={() => handleOpenDetail(msg)}
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center py-3">
              <span className="text-muted small">
                Page {page} of {totalPages}
              </span>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Message Detail & Management Modal */}
        {selectedMessage && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 shadow-lg">
                {/* Modal Header */}
                <div className="modal-header bg-light">
                  <div>
                    <h5 className="modal-title fw-bold d-flex align-items-center gap-2 mb-1">
                      <Mail className="text-primary" size={20} />
                      {selectedMessage.subject}
                    </h5>
                    <div className="d-flex align-items-center gap-2 text-muted small">
                      <span className="badge bg-secondary font-monospace">
                        {selectedMessage.referenceCode}
                      </span>
                      <span>•</span>
                      <span>
                        Received{' '}
                        {new Date(selectedMessage.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleCloseDetail}
                  />
                </div>

                {/* Modal Body */}
                <div className="modal-body p-4">
                  {/* Sender Details Panel */}
                  <div className="card bg-light border-0 p-3 mb-4 rounded-3">
                    <div className="row g-3">
                      <div className="col-12 col-sm-4">
                        <div className="text-muted small">Sender Name</div>
                        <div className="fw-semibold d-flex align-items-center gap-1 text-dark">
                          <User size={15} className="text-primary" />
                          {selectedMessage.fullName}
                        </div>
                      </div>
                      <div className="col-12 col-sm-4">
                        <div className="text-muted small">Email Address</div>
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="fw-semibold text-primary text-decoration-none d-flex align-items-center gap-1"
                        >
                          <Mail size={15} />
                          {selectedMessage.email}
                        </a>
                      </div>
                      <div className="col-12 col-sm-4">
                        <div className="text-muted small">Phone Number</div>
                        <div className="fw-semibold text-dark d-flex align-items-center gap-1">
                          <Phone size={15} className="text-secondary" />
                          {selectedMessage.phone ? (
                            <a
                              href={`tel:${selectedMessage.phone}`}
                              className="text-decoration-none text-dark"
                            >
                              {selectedMessage.phone}
                            </a>
                          ) : (
                            <span className="text-muted fw-normal">Not provided</span>
                          )}
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="text-muted small">Category</div>
                        <span className="badge bg-white text-dark border mt-1">
                          {CATEGORY_LABELS[selectedMessage.category] || selectedMessage.category}
                        </span>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="text-muted small">Last Status Update</div>
                        <div className="small text-muted mt-1">
                          {new Date(selectedMessage.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="mb-4">
                    <label className="fw-bold form-label text-dark d-flex align-items-center gap-2">
                      <FileText size={18} className="text-primary" />
                      Inquiry Message Content
                    </label>
                    <div
                      className="p-3 bg-white border rounded-3"
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        minHeight: '120px',
                        lineHeight: 1.6,
                      }}
                    >
                      {selectedMessage.message}
                    </div>
                  </div>

                  {/* Administrative Workflow Section */}
                  <div className="card border p-3 rounded-3 bg-light">
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                      <ShieldAlert size={18} className="text-primary" />
                      Administrative Workflow & Staff Notes
                    </h6>

                    {saveSuccess && (
                      <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3">
                        <CheckCircle size={18} />
                        Message updated successfully.
                      </div>
                    )}
                    {saveError && (
                      <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                        <AlertCircle size={18} />
                        {saveError}
                      </div>
                    )}

                    <div className="row g-3 mb-3">
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-secondary">
                          Workflow Status
                        </label>
                        <select
                          className="form-select bg-white"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                        >
                          <option value="NEW">New</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="WAITING_FOR_VISITOR">Waiting for Visitor</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                          <option value="SPAM">Mark as Spam</option>
                        </select>
                      </div>
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-secondary">
                          Priority Level
                        </label>
                        <select
                          className="form-select bg-white"
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value)}
                        >
                          <option value="LOW">Low</option>
                          <option value="NORMAL">Normal</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold text-secondary">
                          Private Staff Internal Notes (Not visible to visitor)
                        </label>
                        <textarea
                          className="form-control bg-white"
                          rows={3}
                          placeholder="Record review notes, assigned counselor, follow-up outcome..."
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleCloseDetail}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={savingChanges}
                    onClick={handleSaveChanges}
                  >
                    {savingChanges ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <Check size={16} />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
