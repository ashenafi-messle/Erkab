'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { DataTable, Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiClient } from '../../../lib/api/client';
import {
  Newspaper,
  Plus,
  RefreshCw,
  Trash2,
  Check,
  X,
  Calendar,
  Tag
} from 'lucide-react';

export default function NewsManagementPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New article form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Training Updates');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [readTime, setReadTime] = useState('4 min read');
  const [isPublished, setIsPublished] = useState(true);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await apiClient<{ success: boolean; data: any[] }>('/admin/news');
      setArticles(res.data || []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setSubmitting(true);
      await apiClient('/admin/news', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          category,
          summary: summary.trim(),
          content: content.trim(),
          readTime,
          isPublished,
        }),
      });
      setShowCreateModal(false);
      setTitle('');
      setSummary('');
      setContent('');
      fetchNews();
    } catch (err: any) {
      alert(err.message || 'Failed to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (article: any) => {
    try {
      const newStatus = !article.isPublished;
      await apiClient(`/admin/news/${article.id}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished: newStatus }),
      });
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, isPublished: newStatus } : a))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update publication status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await apiClient(`/admin/news/${id}`, { method: 'DELETE' });
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement.');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Headline',
      render: (row) => (
        <div>
          <div className="fw-bold text-dark">{row.title}</div>
          <span className="text-muted small font-monospace">slug: {row.slug}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      render: (row) => (
        <span className="badge bg-light text-dark border small d-inline-flex align-items-center gap-1">
          <Tag size={12} />
          <span>{row.category}</span>
        </span>
      ),
    },
    {
      header: 'Read Time',
      accessor: 'readTime',
      className: 'small text-muted',
    },
    {
      header: 'Status',
      render: (row) => (
        <StatusBadge status={row.isPublished ? 'PUBLISHED' : 'INACTIVE'} />
      ),
    },
    {
      header: 'Published Date',
      render: (row) => (
        <span className="text-muted small">
          {row.publishedAt ? new Date(row.publishedAt).toLocaleDateString() : 'Draft'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className={`btn btn-sm ${
              row.isPublished ? 'btn-outline-warning' : 'btn-outline-success'
            } d-inline-flex align-items-center gap-1`}
            onClick={() => handleTogglePublish(row)}
            title={row.isPublished ? 'Unpublish' : 'Publish'}
          >
            {row.isPublished ? <X size={14} /> : <Check size={14} />}
            <span>{row.isPublished ? 'Unpublish' : 'Publish'}</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger p-1"
            onClick={() => handleDelete(row.id)}
            title="Delete article"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell requiredRole="SUPER_ADMIN">
      <div className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">News & Public Announcements</h1>
          <p className="text-muted small mb-0">
            Publish institutional milestones, cohort intake deadlines, and organizational newsletters.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
            onClick={fetchNews}
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
            <Plus size={16} />
            <span>New Announcement</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={articles}
        loading={loading}
        searchPlaceholder="Search announcements by title or category..."
        filterOptions={{
          label: 'Category',
          field: 'category',
          options: [
            { label: 'Training Updates', value: 'Training Updates' },
            { label: 'Partnership News', value: 'Partnership News' },
            { label: 'General', value: 'General' },
          ],
        }}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1055 }} onClick={() => setShowCreateModal(false)} />
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content shadow border-0 rounded-4">
                <div className="modal-header border-bottom py-3">
                  <h5 className="modal-title fw-bold text-dark">Create New Announcement</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
                </div>
                <form onSubmit={handleCreate}>
                  <div className="modal-body py-4">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Headline Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Erkab Launches 2026 AI & Mobile Cohort"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Category</label>
                        <select
                          className="form-select"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <option value="Training Updates">Training Updates</option>
                          <option value="Partnership News">Partnership News</option>
                          <option value="Community Impact">Community Impact</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Estimated Read Time</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 4 min read"
                          value={readTime}
                          onChange={(e) => setReadTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Summary (Short Excerpt)</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Brief teaser for news cards..."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Full Article Content</label>
                      <textarea
                        className="form-control"
                        rows={6}
                        placeholder="Write the comprehensive announcement text..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="publishImmediate"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                      />
                      <label className="form-check-label small fw-medium" htmlFor="publishImmediate">
                        Publish immediately to public website
                      </label>
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
                      <span>Publish Announcement</span>
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
