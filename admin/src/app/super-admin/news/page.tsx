'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { DataTable, Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiClient } from '../../../lib/api/client';
import { useAuth } from '../../../context/AuthContext';
import {
  Newspaper,
  Plus,
  RefreshCw,
  Trash2,
  Check,
  X,
  Calendar,
  Tag,
  Edit3,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Star,
  Eye,
  AlertCircle
} from 'lucide-react';

interface AnnouncementImageItem {
  id?: string;
  imageUrl: string;
  cloudinaryPublicId?: string | null;
  caption?: string | null;
  displayOrder: number;
}

interface AnnouncementArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPublished?: boolean;
  coverImageUrl?: string | null;
  coverImageAssetId?: string | null;
  publishedAt?: string | null;
  authorName?: string | null;
  readTime?: string;
  images?: AnnouncementImageItem[];
  createdAt: string;
  updatedAt: string;
}

export default function NewsManagementPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [articles, setArticles] = useState<AnnouncementArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Training Updates');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [readTime, setReadTime] = useState('4 min read');
  const [publishedAt, setPublishedAt] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [images, setImages] = useState<AnnouncementImageItem[]>([]);

  // Carousel Preview State within Modal
  const [previewSlide, setPreviewSlide] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await apiClient<any>('/admin/news');
      const list = res?.data || res?.articles || [];
      const normalized = list.map((a: any) => ({
        ...a,
        isPublished: a.status === 'PUBLISHED' || a.isPublished === true,
        excerpt: a.excerpt || a.summary || '',
        images: a.images || (a.coverImageUrl ? [{ id: 'cover', imageUrl: a.coverImageUrl, displayOrder: 0 }] : []),
      }));
      setArticles(normalized);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || authLoading) return;
    fetchNews();
  }, [user, authLoading]);

  const resetForm = () => {
    setTitle('');
    setCategory('Training Updates');
    setSummary('');
    setContent('');
    setReadTime('4 min read');
    setPublishedAt('');
    setIsPublished(true);
    setImages([]);
    setEditingId(null);
    setFormError(null);
    setPreviewSlide(0);
    setModalMode('create');
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = async (article: AnnouncementArticle) => {
    resetForm();
    setModalMode('edit');
    setEditingId(article.id);
    setTitle(article.title || '');
    setCategory(article.category || 'Training Updates');
    setSummary(article.excerpt || '');
    setContent(article.content || '');
    setReadTime(article.readTime || '4 min read');
    setIsPublished(article.status === 'PUBLISHED' || article.isPublished === true);
    if (article.publishedAt) {
      const dt = new Date(article.publishedAt);
      setPublishedAt(dt.toISOString().slice(0, 16));
    } else {
      setPublishedAt('');
    }

    try {
      // Fetch full details with all attached images
      const res = await apiClient<any>(`/admin/news/${article.id}`);
      const detailed = res?.data || article;
      const imgs = detailed.images || article.images || [];
      setImages(imgs.map((img: any, i: number) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        cloudinaryPublicId: img.cloudinaryPublicId || null,
        caption: img.caption || null,
        displayOrder: typeof img.displayOrder === 'number' ? img.displayOrder : i,
      })));
    } catch {
      setImages(article.images || []);
    }

    setShowModal(true);
  };

  // Image Upload Handling
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFormError(null);
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      // Size check (max 5MB)
      if (f.size > 5 * 1024 * 1024) {
        setFormError(`"${f.name}" exceeds the 5MB maximum file size limit.`);
        return;
      }
      // Type check
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type)) {
        setFormError(`"${f.name}" is not an accepted format. Only JPEG, PNG, and WebP images are allowed.`);
        return;
      }
      validFiles.push(f);
    }

    try {
      setUploadingImages(true);
      const formData = new FormData();
      for (const file of validFiles) {
        formData.append('images', file);
      }
      formData.append('title', title.trim() || 'announcement');

      const res = await apiClient<any>('/admin/news/upload-images', {
        method: 'POST',
        body: formData,
      });

      if (res?.data && Array.isArray(res.data)) {
        const startIndex = images.length;
        const newImgs: AnnouncementImageItem[] = res.data.map((r: any, idx: number) => ({
          id: r.id || String(Date.now() + idx),
          imageUrl: r.imageUrl || r.secureUrl,
          cloudinaryPublicId: r.cloudinaryPublicId || r.publicId || null,
          displayOrder: startIndex + idx,
        }));
        setImages((prev) => [...prev, ...newImgs]);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to upload images. Please check connection and try again.');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      return updated.map((img, idx) => ({ ...img, displayOrder: idx }));
    });
    if (previewSlide >= images.length - 1 && previewSlide > 0) {
      setPreviewSlide((prev) => prev - 1);
    }
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy.map((img, idx) => ({ ...img, displayOrder: idx }));
    });
    setPreviewSlide(toIndex);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    handleMoveImage(index, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormError('Title and full article content are required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const payload = {
        title: title.trim(),
        category,
        excerpt: summary.trim() || title.trim(),
        content: content.trim(),
        status: isPublished ? 'PUBLISHED' : 'DRAFT',
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : (isPublished ? new Date().toISOString() : null),
        coverImageUrl: images.length > 0 ? images[0].imageUrl : null,
        coverImageAssetId: images.length > 0 ? (images[0].cloudinaryPublicId || null) : null,
        images: images.map((img, idx) => ({
          ...img,
          displayOrder: idx,
        })),
      };

      if (modalMode === 'create') {
        await apiClient('/admin/news', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } else if (editingId) {
        await apiClient(`/admin/news/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      }

      setShowModal(false);
      resetForm();
      fetchNews();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (article: AnnouncementArticle) => {
    try {
      const newStatus = !article.isPublished;
      await apiClient(`/admin/news/${article.id}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished: newStatus }),
      });
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, isPublished: newStatus, status: newStatus ? 'PUBLISHED' : 'DRAFT' } : a))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update publication status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement and its uploaded images?')) return;
    try {
      await apiClient(`/admin/news/${id}`, { method: 'DELETE' });
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement.');
    }
  };

  const columns: Column<AnnouncementArticle>[] = [
    {
      header: 'Announcement',
      render: (row) => {
        const cover = row.coverImageUrl || (row.images && row.images[0]?.imageUrl);
        const imgCount = row.images?.length || (cover ? 1 : 0);

        return (
          <div className="d-flex align-items-center gap-3">
            <div
              className="position-relative rounded-3 overflow-hidden bg-light border flex-shrink-0"
              style={{ width: '64px', height: '48px' }}
            >
              {cover ? (
                <img
                  src={cover}
                  alt={row.title}
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                  <ImageIcon size={20} className="opacity-50" />
                </div>
              )}
              {imgCount > 1 && (
                <span
                  className="position-absolute bottom-0 end-0 bg-dark bg-opacity-75 text-white px-1 font-monospace"
                  style={{ fontSize: '0.65rem', borderTopLeftRadius: '4px' }}
                >
                  +{imgCount}
                </span>
              )}
            </div>
            <div>
              <div className="fw-bold text-dark line-clamp-1">{row.title}</div>
              <span className="text-muted small font-monospace">slug: {row.slug}</span>
            </div>
          </div>
        );
      },
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
      header: 'Photos',
      render: (row) => {
        const count = row.images?.length || (row.coverImageUrl ? 1 : 0);
        return (
          <span className={`badge ${count > 1 ? 'bg-primary-subtle text-primary border-primary-subtle' : count === 1 ? 'bg-light text-secondary border' : 'bg-light text-muted'}`}>
            {count} {count === 1 ? 'image' : 'images'}
          </span>
        );
      },
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
          {row.publishedAt ? new Date(row.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Draft'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="d-flex align-items-center gap-1">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary p-1 px-2 d-inline-flex align-items-center gap-1"
            onClick={() => handleOpenEdit(row)}
            title="Edit announcement"
          >
            <Edit3 size={14} />
            <span className="d-none d-md-inline">Edit</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${
              row.isPublished ? 'btn-outline-warning' : 'btn-outline-success'
            } p-1 px-2 d-inline-flex align-items-center gap-1`}
            onClick={() => handleTogglePublish(row)}
            title={row.isPublished ? 'Unpublish' : 'Publish'}
          >
            {row.isPublished ? <X size={14} /> : <Check size={14} />}
            <span className="d-none d-md-inline">{row.isPublished ? 'Unpublish' : 'Publish'}</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger p-1 px-2"
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
            Publish institutional milestones, cohort intake deadlines, and rich multi-image photo slideshows.
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
            onClick={handleOpenCreate}
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
            { label: 'Community Impact', value: 'Community Impact' },
            { label: 'Admissions', value: 'Admissions' },
            { label: 'General', value: 'General' },
          ],
        }}
      />

      {/* Create / Edit Modal */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1055 }}
            onClick={() => !submitting && setShowModal(false)}
          />
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060, overflowY: 'auto' }}>
            <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable my-3" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
              <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden d-flex flex-column" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
                <form
                  onSubmit={handleSubmit}
                  className="d-flex flex-column flex-grow-1"
                  style={{ minHeight: 0, maxHeight: 'calc(100vh - 2rem)', overflow: 'hidden' }}
                >
                  <div className="modal-header border-bottom py-3 px-4 flex-shrink-0">
                    <div>
                      <h5 className="modal-title fw-bold text-dark mb-0">
                        {modalMode === 'create' ? 'Create New Announcement' : 'Edit Announcement'}
                      </h5>
                      <p className="text-muted small mb-0">
                        Manage headline, full announcement text, and multiple image photo slideshow.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-close"
                      disabled={submitting}
                      onClick={() => setShowModal(false)}
                    />
                  </div>

                  <div
                    className="modal-body py-4 px-4 flex-grow-1"
                    style={{
                      overflowY: 'auto',
                      maxHeight: 'calc(100vh - 170px)',
                      minHeight: 0,
                    }}
                  >
                    {formError && (
                      <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-4">
                        <AlertCircle size={18} className="flex-shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="row g-4">
                      {/* Left Column: Core Fields */}
                      <div className="col-12 col-lg-7">
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-secondary">
                            Headline Title <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Erkab Launches 2026 AI & Mobile Cohort"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            disabled={submitting}
                          />
                        </div>

                        <div className="row g-3 mb-3">
                          <div className="col-md-6">
                            <label className="form-label small fw-semibold text-secondary">Category</label>
                            <select
                              className="form-select"
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              disabled={submitting}
                            >
                              <option value="Training Updates">Training Updates</option>
                              <option value="Admissions">Admissions</option>
                              <option value="Partnership News">Partnership News</option>
                              <option value="Community Impact">Community Impact</option>
                              <option value="Innovation">Innovation</option>
                              <option value="General">General</option>
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-semibold text-secondary">Publication Date & Time</label>
                            <input
                              type="datetime-local"
                              className="form-control"
                              value={publishedAt}
                              onChange={(e) => setPublishedAt(e.target.value)}
                              disabled={submitting}
                            />
                            <div className="form-text small" style={{ fontSize: '0.75rem' }}>
                              Leave blank to use current time upon publishing.
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-secondary">
                            Summary (Short Teaser)
                          </label>
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Brief 1-2 sentence teaser for news cards and SEO..."
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            disabled={submitting}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-secondary">
                            Full Announcement Content <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className="form-control font-monospace small"
                            rows={8}
                            placeholder="Write the comprehensive announcement text..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            disabled={submitting}
                          />
                        </div>

                        <div className="form-check form-switch pt-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="publishImmediate"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            disabled={submitting}
                          />
                          <label className="form-check-label small fw-medium" htmlFor="publishImmediate">
                            {isPublished ? 'Published to public website' : 'Saved as Draft (hidden from public)'}
                          </label>
                        </div>
                      </div>

                      {/* Right Column: Multi-Image Upload & Reordering */}
                      <div className="col-12 col-lg-5">
                        <div className="p-3 bg-light rounded-4 border border-light-subtle h-100 d-flex flex-column">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <div>
                              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                <ImageIcon size={18} className="text-primary" />
                                <span>Announcement Images</span>
                              </h6>
                              <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                                Upload 1 or multiple photos for slideshow
                              </span>
                            </div>
                            <span className="badge bg-white text-dark border">
                              {images.length} {images.length === 1 ? 'photo' : 'photos'}
                            </span>
                          </div>

                          {/* Upload Dropzone / Button */}
                          <div
                            className="border border-2 border-dashed rounded-3 p-3 text-center bg-white mb-3 position-relative"
                            style={{ cursor: uploadingImages || submitting ? 'not-allowed' : 'pointer' }}
                            onClick={() => !uploadingImages && !submitting && fileInputRef.current?.click()}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              accept="image/jpeg,image/png,image/webp,image/jpg"
                              className="d-none"
                              onChange={handleFilesSelected}
                              disabled={uploadingImages || submitting}
                            />
                            {uploadingImages ? (
                              <div className="py-2">
                                <span className="spinner-border spinner-border-sm text-primary mb-2" />
                                <div className="small fw-semibold text-primary">Uploading to Cloudinary CDN...</div>
                                <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Optimizing images</div>
                              </div>
                            ) : (
                              <div>
                                <Upload size={24} className="text-primary mb-1 mx-auto" />
                                <div className="small fw-semibold text-dark">
                                  {images.length > 0 ? '+ Add More Images' : 'Choose or Drop Photos'}
                                </div>
                                <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                                  JPEG, PNG, WebP up to 5MB each (multi-select supported)
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Image Thumbnails & Reordering List */}
                          {images.length > 0 && (
                            <div className="mb-3 flex-grow-1 overflow-auto" style={{ maxHeight: '220px' }}>
                              <div className="d-flex flex-column gap-2">
                                {images.map((img, idx) => {
                                  const isCover = idx === 0;
                                  return (
                                    <div
                                      key={img.id || img.imageUrl}
                                      className={`p-2 rounded-3 bg-white border d-flex align-items-center gap-2 ${
                                        isCover ? 'border-primary border-2 shadow-sm' : 'border-light-subtle'
                                      }`}
                                    >
                                      {/* Thumbnail */}
                                      <div
                                        className="position-relative rounded-2 overflow-hidden flex-shrink-0 bg-dark"
                                        style={{ width: '48px', height: '36px' }}
                                      >
                                        <img
                                          src={img.imageUrl}
                                          alt={`Slide ${idx + 1}`}
                                          className="w-100 h-100"
                                          style={{ objectFit: 'cover' }}
                                        />
                                      </div>

                                      {/* Label / Order Indicator */}
                                      <div className="flex-grow-1 small">
                                        <div className="d-flex align-items-center gap-1">
                                          {isCover ? (
                                            <span className="badge bg-primary text-white" style={{ fontSize: '0.7rem' }}>
                                              Cover / Slide 1
                                            </span>
                                          ) : (
                                            <span className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>
                                              Slide {idx + 1}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>
                                          Order #{idx + 1}
                                        </div>
                                      </div>

                                      {/* Reorder and Remove Controls */}
                                      <div className="d-flex align-items-center gap-1">
                                        {!isCover && (
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary p-1"
                                            onClick={() => handleSetCover(idx)}
                                            title="Make this photo the Cover"
                                            style={{ lineHeight: 1 }}
                                          >
                                            <Star size={13} className="text-warning" />
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-secondary p-1"
                                          onClick={() => handleMoveImage(idx, idx - 1)}
                                          disabled={idx === 0}
                                          title="Move photo earlier"
                                          style={{ lineHeight: 1 }}
                                        >
                                          <ChevronLeft size={13} />
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-secondary p-1"
                                          onClick={() => handleMoveImage(idx, idx + 1)}
                                          disabled={idx === images.length - 1}
                                          title="Move photo later"
                                          style={{ lineHeight: 1 }}
                                        >
                                          <ChevronRight size={13} />
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-danger p-1 ms-1"
                                          onClick={() => handleRemoveImage(idx)}
                                          title="Remove photo"
                                          style={{ lineHeight: 1 }}
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Live Slideshow Preview */}
                          {images.length > 0 && (
                            <div className="mt-auto pt-2 border-top">
                              <div className="d-flex align-items-center justify-content-between mb-1">
                                <span className="small fw-semibold text-secondary d-flex align-items-center gap-1">
                                  <Eye size={14} />
                                  <span>Slideshow Preview</span>
                                </span>
                                <span className="badge bg-secondary-subtle text-secondary small" style={{ fontSize: '0.72rem' }}>
                                  {previewSlide + 1} / {images.length}
                                </span>
                              </div>

                              <div
                                className="position-relative w-100 rounded-3 overflow-hidden bg-dark shadow-sm"
                                style={{ aspectRatio: '16 / 9', maxHeight: '180px' }}
                              >
                                <img
                                  src={images[previewSlide]?.imageUrl}
                                  alt={`Slide ${previewSlide + 1}`}
                                  className="w-100 h-100"
                                  style={{ objectFit: 'contain' }}
                                />

                                {images.length > 1 && (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-dark bg-opacity-75 text-white position-absolute top-50 start-0 translate-middle-y rounded-end-pill p-1 px-2 border-0"
                                      onClick={() => setPreviewSlide((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                                      title="Previous preview slide"
                                    >
                                      <ChevronLeft size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-dark bg-opacity-75 text-white position-absolute top-50 end-0 translate-middle-y rounded-start-pill p-1 px-2 border-0"
                                      onClick={() => setPreviewSlide((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                                      title="Next preview slide"
                                    >
                                      <ChevronRight size={16} />
                                    </button>

                                    {/* Indicator Dots */}
                                    <div className="position-absolute bottom-0 start-50 translate-middle-x pb-1 d-flex gap-1">
                                      {images.map((_, i) => (
                                        <button
                                          key={i}
                                          type="button"
                                          onClick={() => setPreviewSlide(i)}
                                          className={`border-0 rounded-circle p-0 ${
                                            previewSlide === i ? 'bg-primary' : 'bg-white bg-opacity-50'
                                          }`}
                                          style={{ width: '6px', height: '6px' }}
                                        />
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {images.length === 0 && (
                            <div className="text-center py-4 text-muted my-auto">
                              <ImageIcon size={32} className="opacity-25 mb-2 mx-auto" />
                              <div className="small">No images attached</div>
                              <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                                Announcement will publish as text-only
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-top py-3 px-4 bg-light bg-opacity-50 flex-shrink-0">
                    <button
                      type="button"
                      className="btn btn-sm btn-light border px-3"
                      disabled={submitting || uploadingImages}
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary px-4 d-inline-flex align-items-center gap-1 shadow-sm"
                      disabled={submitting || uploadingImages}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>{modalMode === 'create' ? 'Publish Announcement' : 'Save Changes'}</span>
                      )}
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
