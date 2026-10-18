'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  Shield,
  FileText,
  Heart,
  Newspaper,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Lock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';


const DEFAULT_ADMIN_TOKEN = 'erkab-admin-secret-key-2026';

export default function AdminDashboardPage() {
  const [token, setToken] = useState(DEFAULT_ADMIN_TOKEN);
  const [isAuth, setIsAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'partnerships' | 'donations' | 'news'>('partnerships');

  // Partnerships state
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [loadingPartnerships, setLoadingPartnerships] = useState(false);
  const [selectedPartnership, setSelectedPartnership] = useState<any | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null);

  // Donations state
  const [donations, setDonations] = useState<any[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(false);

  // News state
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsForm, setNewsForm] = useState({
    title: '',
    slug: '',
    category: 'Admissions',
    excerpt: '',
    content: '',
    status: 'PUBLISHED',
  });

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Fetch Partnerships
  const fetchPartnerships = async () => {
    setLoadingPartnerships(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}${API_ENDPOINTS.ADMIN.PARTNERSHIPS.LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPartnerships(data.data.requests || []);
      } else {
        setError(data.message || 'Failed to fetch partnerships');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to admin API');
    } finally {
      setLoadingPartnerships(false);
    }
  };

  // Fetch Donations
  const fetchDonations = async () => {
    setLoadingDonations(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}${API_ENDPOINTS.ADMIN.DONATIONS.LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDonations(data.data.donations || []);
      } else {
        setError(data.message || 'Failed to fetch donations');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to admin API');
    } finally {
      setLoadingDonations(false);
    }
  };

  // Fetch News
  const fetchNews = async () => {
    setLoadingNews(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}${API_ENDPOINTS.ADMIN.NEWS.LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNews(data.data.articles || []);
      } else {
        setError(data.message || 'Failed to fetch news articles');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to admin API');
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'partnerships') fetchPartnerships();
    if (activeTab === 'donations') fetchDonations();
    if (activeTab === 'news') fetchNews();
  }, [activeTab]);

  // Review partnership
  const handleReviewPartnership = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`${apiUrl}${API_ENDPOINTS.ADMIN.PARTNERSHIPS.REVIEW(id)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: reviewStatus,
          reviewNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Partnership status updated successfully');
        setSelectedPartnership(null);
        fetchPartnerships();
      } else {
        setError(data.message || 'Review failed');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Fetch signed license download URL
  const handleGetLicenseUrl = async (docId: string) => {
    setLicenseUrl(null);
    try {
      const res = await fetch(`${apiUrl}${API_ENDPOINTS.ADMIN.PARTNERSHIPS.DOCUMENT_URL(docId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data?.accessUrl) {
        setLicenseUrl(data.data.accessUrl);
        window.open(data.data.accessUrl, '_blank');
      } else {
        setError(data.message || 'Failed to generate signed document link');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Create news article
  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${apiUrl}${API_ENDPOINTS.ADMIN.NEWS.CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newsForm),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('News article created successfully');
        setShowNewsModal(false);
        setNewsForm({
          title: '',
          slug: '',
          category: 'Admissions',
          excerpt: '',
          content: '',
          status: 'PUBLISHED',
        });
        fetchNews();
      } else {
        setError(data.message || 'Failed to create article');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="section-py section-bg-light min-vh-100">
      <Container>
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom border-light-subtle">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Shield className="text-primary" size={24} />
              <h1 className="h4 fw-bold text-dark mb-0">Erkab Administration Directorate</h1>
            </div>
            <p className="text-muted small mb-0">
              Centralized platform management: Partnerships, Donations, and News & Updates
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
            <span className="badge bg-success-subtle text-success border border-success-subtle small px-2 py-1">
              Authenticated Admin
            </span>
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <div className="alert alert-success alert-dismissible fade show small mb-4" role="alert">
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
          </div>
        )}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show small mb-4" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="nav nav-pills gap-2 mb-4">
          <button
            className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 fw-semibold ${
              activeTab === 'partnerships' ? 'btn-primary' : 'btn-white bg-white text-muted border'
            }`}
            onClick={() => setActiveTab('partnerships')}
          >
            <FileText size={16} />
            <span>Partnership Requests</span>
          </button>

          <button
            className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 fw-semibold ${
              activeTab === 'donations' ? 'btn-primary' : 'btn-white bg-white text-muted border'
            }`}
            onClick={() => setActiveTab('donations')}
          >
            <Heart size={16} />
            <span>Donations & Contributions</span>
          </button>

          <button
            className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 fw-semibold ${
              activeTab === 'news' ? 'btn-primary' : 'btn-white bg-white text-muted border'
            }`}
            onClick={() => setActiveTab('news')}
          >
            <Newspaper size={16} />
            <span>News & Updates</span>
          </button>
        </div>

        {/* Tab 1: Partnerships */}
        {activeTab === 'partnerships' && (
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h6 fw-bold text-dark mb-0">Partnership Inquiries & Licenses</h2>
              <button onClick={fetchPartnerships} className="btn btn-sm btn-outline-secondary">
                <RefreshCw size={14} className="me-1 inline" /> Refresh
              </button>
            </div>

            {loadingPartnerships ? (
              <p className="text-muted small py-4 text-center">Loading partnership submissions...</p>
            ) : partnerships.length === 0 ? (
              <p className="text-muted small py-4 text-center">No partnership requests found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle small mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Reference</th>
                      <th>Organization</th>
                      <th>Contact Person</th>
                      <th>Track</th>
                      <th>Status</th>
                      <th>License Doc</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerships.map((item) => (
                      <tr key={item.id}>
                        <td className="font-monospace fw-semibold">{item.reference}</td>
                        <td>
                          <strong>{item.organizationName}</strong>
                          <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                            {item.organizationType} • {item.city || 'N/A'}
                          </span>
                        </td>
                        <td>
                          {item.contactPerson}
                          <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                            {item.email}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">{item.partnershipType}</span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              item.status === 'APPROVED'
                                ? 'bg-success'
                                : item.status === 'REJECTED'
                                ? 'bg-danger'
                                : 'bg-warning text-dark'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>
                          {item.documents && item.documents.length > 0 ? (
                            <button
                              onClick={() => handleGetLicenseUrl(item.documents[0].id)}
                              className="btn btn-sm btn-outline-primary py-0 px-2 d-inline-flex align-items-center gap-1"
                              style={{ fontSize: '0.75rem' }}
                            >
                              <Download size={12} />
                              <span>View License</span>
                            </button>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>No Doc</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedPartnership(item);
                              setReviewStatus(item.status);
                              setReviewNotes(item.reviewNotes || '');
                            }}
                            className="btn btn-sm btn-light border py-0 px-2"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Review Modal / Drawer */}
            {selectedPartnership && (
              <div className="mt-4 p-4 rounded-3 border bg-light">
                <h5 className="h6 fw-bold mb-3">Review Partnership: {selectedPartnership.organizationName}</h5>
                <p className="small text-muted mb-2">
                  <strong>Proposal:</strong> {selectedPartnership.proposal || 'No additional proposal message.'}
                </p>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-bold">Update Status</label>
                    <select
                      className="form-select form-select-sm"
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-8">
                    <label className="form-label small fw-bold">Private Review Notes</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Enter internal review notes..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    onClick={() => handleReviewPartnership(selectedPartnership.id)}
                    className="btn btn-sm btn-primary"
                  >
                    Save Review
                  </button>
                  <button
                    onClick={() => setSelectedPartnership(null)}
                    className="btn btn-sm btn-outline-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Donations */}
        {activeTab === 'donations' && (
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="h6 fw-bold text-dark mb-0">Donation Inquiries & Contribution Records</h2>
                <span className="badge bg-secondary text-white small mt-1">
                  Bank Transfers & Inquiries
                </span>
              </div>
              <button onClick={fetchDonations} className="btn btn-sm btn-outline-secondary">
                <RefreshCw size={14} className="me-1 inline" /> Refresh
              </button>
            </div>

            {loadingDonations ? (
              <p className="text-muted small py-4 text-center">Loading donation records...</p>
            ) : donations.length === 0 ? (
              <p className="text-muted small py-4 text-center">No donations recorded yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle small mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Reference</th>
                      <th>Donor</th>
                      <th>Amount</th>
                      <th>Campaign</th>
                      <th>Status</th>
                      <th>Payment Attempts</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((item) => (
                      <tr key={item.id}>
                        <td className="font-monospace fw-semibold">{item.reference}</td>
                        <td>
                          <strong>{item.donorName || 'Anonymous'}</strong>
                          {item.email && (
                            <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                              {item.email}
                            </span>
                          )}
                        </td>
                        <td>
                          <strong className="text-primary">
                            {(item.amountMinor / 100).toLocaleString()} {item.currency}
                          </strong>
                        </td>
                        <td>
                          {item.campaign ? (
                            <span className="badge bg-light text-muted border">{item.campaign.title}</span>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>General Fund</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              item.status === 'PAID'
                                ? 'bg-success'
                                : item.status === 'PAYMENT_FAILED'
                                ? 'bg-danger'
                                : 'bg-secondary'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>
                          {item.payments && item.payments.length > 0 ? (
                            <div>
                              <span className="badge bg-light text-dark border font-monospace" style={{ fontSize: '0.7rem' }}>
                                {item.payments[0].reference}
                              </span>
                              <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '0.65rem' }}>
                                DEMO
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>None</span>
                          )}
                        </td>
                        <td className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: News & Updates */}
        {activeTab === 'news' && (
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h6 fw-bold text-dark mb-0">Publish & Manage News Articles</h2>
              <div className="d-flex gap-2">
                <button
                  onClick={() => setShowNewsModal(true)}
                  className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                >
                  <Plus size={14} /> Add Article
                </button>
                <button onClick={fetchNews} className="btn btn-sm btn-outline-secondary">
                  <RefreshCw size={14} className="me-1 inline" /> Refresh
                </button>
              </div>
            </div>

            {loadingNews ? (
              <p className="text-muted small py-4 text-center">Loading articles...</p>
            ) : news.length === 0 ? (
              <p className="text-muted small py-4 text-center">No news articles found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle small mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Slug</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Published Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {news.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.title}</strong>
                        </td>
                        <td className="font-monospace text-muted">{item.slug}</td>
                        <td>
                          <span className="badge bg-light text-dark border">{item.category}</span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              item.status === 'PUBLISHED'
                                ? 'bg-success'
                                : item.status === 'DRAFT'
                                ? 'bg-secondary'
                                : 'bg-dark'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Unpublished'}
                        </td>
                        <td>
                          <a
                            href={`/news/${item.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary py-0 px-2 d-inline-flex align-items-center gap-1"
                            style={{ fontSize: '0.75rem' }}
                          >
                            <ExternalLink size={12} /> View Live
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Create News Modal / Box */}
            {showNewsModal && (
              <div className="mt-4 p-4 rounded-3 border bg-light">
                <h5 className="h6 fw-bold mb-3">Create New News Article</h5>
                <form onSubmit={handleCreateNews}>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-bold">Title</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={newsForm.title}
                        onChange={(e) =>
                          setNewsForm({
                            ...newsForm,
                            title: e.target.value,
                            slug: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/^-|-$/g, ''),
                          })
                        }
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold">Category</label>
                      <select
                        className="form-select form-select-sm"
                        value={newsForm.category}
                        onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                      >
                        <option value="Admissions">Admissions</option>
                        <option value="Innovation">Innovation</option>
                        <option value="Community">Community</option>
                        <option value="Event">Event</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-bold">Slug</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace"
                        required
                        value={newsForm.slug}
                        onChange={(e) => setNewsForm({ ...newsForm, slug: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold">Status</label>
                      <select
                        className="form-select form-select-sm"
                        value={newsForm.status}
                        onChange={(e) => setNewsForm({ ...newsForm, status: e.target.value })}
                      >
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Excerpt / Summary</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={2}
                      required
                      value={newsForm.excerpt}
                      onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Content</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={5}
                      required
                      value={newsForm.content}
                      onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-sm btn-primary">
                      Publish Article
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewsModal(false)}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
