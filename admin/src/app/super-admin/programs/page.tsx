'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AdminShell } from '../../../components/layout/AdminShell';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiClient } from '../../../lib/api/client';
import { useAuth } from '../../../context/AuthContext';
import {
  BookOpen,
  Check,
  X,
  RefreshCw,
  Clock,
  Search,
  Plus,
  Eye,
  Trash2,
  GraduationCap,
  Layers,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Tag,
  Award,
  FileText
} from 'lucide-react';

interface ProgramItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  duration: string;
  delivery: string;
  scholarship: boolean;
  image: string;
  imageAlt: string;
  summary: string;
  description: string;
  skills: string[];
  modules: string[];
  careerPaths: string[];
  prerequisites: string;
  isPublished: boolean;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ProgramStats {
  total: number;
  published: number;
  draft: number;
  categories: number;
  totalApplications: number;
}

const CATEGORIES = [
  'Software & Technology',
  'Data & AI',
  'Business & Employment',
  'Vocational & Applied',
];

const DELIVERY_MODES = [
  'In-Person & Lab',
  'Hybrid',
  'Online & Interactive',
];

const DEFAULT_PROGRAM_THUMB =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="%23f8fafc" stroke="%2364748b" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="3"/><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>';

export default function ProgramsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [stats, setStats] = useState<ProgramStats>({
    total: 0,
    published: 0,
    draft: 0,
    categories: 0,
    totalApplications: 0,
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
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [viewProgram, setViewProgram] = useState<ProgramItem | null>(null);
  const [editProgram, setEditProgram] = useState<ProgramItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteProgramTarget, setDeleteProgramTarget] = useState<ProgramItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formDuration, setFormDuration] = useState('12 Weeks (Full-Time)');
  const [formDelivery, setFormDelivery] = useState(DELIVERY_MODES[0]);
  const [formScholarship, setFormScholarship] = useState(true);
  const [formImage, setFormImage] = useState('/images/programs/web-development.jpg');
  const [formImageAlt, setFormImageAlt] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSkills, setFormSkills] = useState('');
  const [formModules, setFormModules] = useState('');
  const [formCareerPaths, setFormCareerPaths] = useState('');
  const [formPrerequisites, setFormPrerequisites] = useState('Basic computer literacy and logical problem-solving aptitude.');
  const [formIsPublished, setFormIsPublished] = useState(true);

  // Program Image Upload State
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanupPreviewUrl = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setImageError('File size exceeds 5MB limit. Please select an image under 5MB.');
      e.target.value = '';
      return;
    }

    // Validate MIME type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      setImageError('Unsupported file format. Please upload a JPEG, PNG, or WebP image.');
      e.target.value = '';
      return;
    }

    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
    setSelectedImageFile(file);
  };

  const handleClearImage = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setSelectedImageFile(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFormImage('/images/programs/web-development.jpg');
  };

  const handleCloseModal = () => {
    if (!actionLoading && !imageUploading) {
      cleanupPreviewUrl();
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      setImageError(null);
      setIsCreating(false);
      setEditProgram(null);
    }
  };

  // Fetch Dashboard Summary Counts
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await apiClient<{ success: boolean; data: ProgramStats }>('/admin/programs/stats');
      if (res.data) {
        setStats(res.data);
      }
    } catch {
      // Fallback: keep previous or defaults
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Programs List
  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(page));
      queryParams.set('limit', String(limit));
      if (search.trim()) queryParams.set('search', search.trim());
      if (categoryFilter !== 'ALL') queryParams.set('category', categoryFilter);
      if (statusFilter !== 'ALL') queryParams.set('status', statusFilter);

      const res = await apiClient<{
        success: boolean;
        data: ProgramItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/admin/programs?${queryParams.toString()}`);

      setPrograms(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load training programs from the database.');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, categoryFilter, statusFilter]);

  useEffect(() => {
    if (!user || authLoading) return;
    fetchStats();
  }, [user, authLoading]);

  useEffect(() => {
    if (!user || authLoading) return;
    fetchPrograms();
  }, [user, authLoading, fetchPrograms]);

  // Open Create Modal
  const handleOpenCreate = () => {
    cleanupPreviewUrl();
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsCreating(true);
    setEditProgram(null);
    setActionError(null);
    setFormTitle('');
    setFormSlug('');
    setFormCategory(CATEGORIES[0]);
    setFormDuration('12 Weeks (Full-Time)');
    setFormDelivery(DELIVERY_MODES[0]);
    setFormScholarship(true);
    setFormImage('/images/programs/web-development.jpg');
    setFormImageAlt('');
    setFormSummary('');
    setFormDescription('');
    setFormSkills('');
    setFormModules('');
    setFormCareerPaths('');
    setFormPrerequisites('Basic computer literacy and logical problem-solving aptitude.');
    setFormIsPublished(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (p: ProgramItem) => {
    cleanupPreviewUrl();
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setEditProgram(p);
    setIsCreating(false);
    setActionError(null);
    setFormTitle(p.title);
    setFormSlug(p.slug);
    setFormCategory(p.category);
    setFormDuration(p.duration);
    setFormDelivery(p.delivery);
    setFormScholarship(p.scholarship);
    setFormImage(p.image);
    setFormImageAlt(p.imageAlt || '');
    setFormSummary(p.summary);
    setFormDescription(p.description);
    setFormSkills(Array.isArray(p.skills) ? p.skills.join(', ') : String(p.skills || ''));
    setFormModules(Array.isArray(p.modules) ? p.modules.join('\n') : String(p.modules || ''));
    setFormCareerPaths(Array.isArray(p.careerPaths) ? p.careerPaths.join(', ') : String(p.careerPaths || ''));
    setFormPrerequisites(p.prerequisites || '');
    setFormIsPublished(p.isPublished);
  };

  // Toggle Visibility / Publish Status
  const handleTogglePublish = async (program: ProgramItem) => {
    try {
      setTogglingId(program.id);
      const newStatus = !program.isPublished;
      await apiClient(`/admin/programs/${program.id}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished: newStatus }),
      });
      // Update local state optimistically
      setPrograms((prev) =>
        prev.map((p) => (p.id === program.id ? { ...p, isPublished: newStatus } : p))
      );
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle publication status.');
    } finally {
      setTogglingId(null);
    }
  };

  // Save Program (Create or Update)
  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    if (!formTitle.trim()) {
      setActionError('Program title is required');
      return;
    }
    if (!formSummary.trim() || formSummary.trim().length < 10) {
      setActionError('Summary must be at least 10 characters long');
      return;
    }
    if (!formDescription.trim() || formDescription.trim().length < 20) {
      setActionError('Full curriculum description must be at least 20 characters long');
      return;
    }

    try {
      setActionLoading(true);

      let finalImageUrl = formImage.trim() || '/images/programs/web-development.jpg';

      if (selectedImageFile) {
        setImageUploading(true);
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('image', selectedImageFile);
          const uploadRes = await apiClient<{ success: boolean; url: string; publicId: string }>(
            '/admin/programs/upload-image',
            {
              method: 'POST',
              body: uploadFormData,
            }
          );
          if (uploadRes?.url) {
            finalImageUrl = uploadRes.url;
            setFormImage(uploadRes.url);
          }
        } catch (uploadErr: any) {
          setActionError(`Image upload failed: ${uploadErr.message || 'Could not upload image to Cloudinary'}`);
          setImageUploading(false);
          setActionLoading(false);
          return;
        } finally {
          setImageUploading(false);
        }
      }

      const parsedSkills = formSkills
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedModules = formModules
        .split('\n')
        .map((m) => m.trim())
        .filter(Boolean);

      const parsedCareerPaths = formCareerPaths
        .split(/[,\n]/)
        .map((c) => c.trim())
        .filter(Boolean);

      const payload = {
        title: formTitle.trim(),
        slug: formSlug.trim() || undefined,
        category: formCategory.trim(),
        duration: formDuration.trim(),
        delivery: formDelivery.trim(),
        scholarship: formScholarship,
        image: finalImageUrl,
        imageAlt: formImageAlt.trim() || `${formTitle.trim()} curriculum track at Erkab Gondar training center`,
        summary: formSummary.trim(),
        description: formDescription.trim(),
        skills: parsedSkills,
        modules: parsedModules,
        careerPaths: parsedCareerPaths,
        prerequisites: formPrerequisites.trim(),
        isPublished: formIsPublished,
      };

      if (isCreating) {
        await apiClient('/admin/programs', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } else if (editProgram) {
        await apiClient(`/admin/programs/${editProgram.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      }

      cleanupPreviewUrl();
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      setIsCreating(false);
      setEditProgram(null);
      fetchPrograms();
      fetchStats();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save training program.');
    } finally {
      setActionLoading(false);
      setImageUploading(false);
    }
  };

  // Handle Safe Delete
  const handleConfirmDelete = async () => {
    if (!deleteProgramTarget) return;
    try {
      setActionLoading(true);
      setActionError(null);
      await apiClient(`/admin/programs/${deleteProgramTarget.id}`, {
        method: 'DELETE',
      });
      setDeleteProgramTarget(null);
      fetchPrograms();
      fetchStats();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete program.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminShell requiredRole="SUPER_ADMIN">
      {/* Top Header */}
      <div className="mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <BookOpen size={24} className="text-primary" />
            <span>Training Program Management</span>
          </h1>
          <p className="text-muted small mb-0">
            Authoritatively govern the curriculum tracks, admissions catalog, publication visibility, and scholarship funding.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 align-self-start align-self-sm-auto">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
            onClick={() => {
              fetchStats();
              fetchPrograms();
            }}
            disabled={loading || statsLoading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
            onClick={handleOpenCreate}
          >
            <Plus size={16} />
            <span>Add New Program</span>
          </button>
        </div>
      </div>

      {/* Summary Dashboard Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard
            title="Total Curriculum Tracks"
            value={stats.total}
            subtitle={`${stats.categories} Distinct Disciplines`}
            icon={BookOpen}
            variant="blue"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Live on Public Portal"
            value={stats.published}
            subtitle="Accessible to applicants"
            icon={Check}
            variant="success"
            badgeText="Active Catalog"
            badgePositive={true}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Draft / Hidden"
            value={stats.draft}
            subtitle="Under curriculum review"
            icon={Clock}
            variant="warning"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Scholarship Enrolled"
            value={stats.totalApplications}
            subtitle="Total student submissions"
            icon={GraduationCap}
            variant="cyan"
            badgeText="Enrolled"
            badgePositive={true}
          />
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-3 mb-4 p-3 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search curriculum tracks by title, category, or slug..."
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
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Categories ({stats.categories})</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="UNPUBLISHED">Draft / Hidden</option>
            </select>
          </div>

          <div className="col-12 col-md-2 text-md-end text-muted small">
            Showing {programs.length} of {totalCount} tracks
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
            onClick={fetchPrograms}
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Table / Card Content */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
        {loading ? (
          <div className="p-5 text-center text-muted">
            <span className="spinner-border spinner-border-sm text-primary me-2" />
            <span>Loading training programs from database...</span>
          </div>
        ) : programs.length === 0 ? (
          <div className="p-5 text-center">
            <BookOpen size={48} className="text-muted mb-3 opacity-50" />
            <h5 className="fw-bold text-dark">No Training Programs Found</h5>
            <p className="text-muted small mb-3">
              {search || categoryFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Try clearing your search query or adjusting your category/status filters.'
                : 'No training programs have been registered in the database yet.'}
            </p>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleOpenCreate}
            >
              <Plus size={14} className="me-1" />
              Add First Program
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                  <tr>
                    <th style={{ width: '32%' }}>Program Track</th>
                    <th>Category</th>
                    <th>Delivery & Duration</th>
                    <th>Funding</th>
                    <th>Applicants</th>
                    <th>Status</th>
                    <th className="text-end" style={{ width: '22%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {programs.map((prog) => (
                    <tr key={prog.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={prog.image || '/images/programs/web-development.jpg'}
                            alt={prog.imageAlt || prog.title}
                            className="rounded-3 object-fit-cover shadow-sm flex-shrink-0"
                            style={{ width: 48, height: 48 }}
                            onError={(e) => {
                              const el = e.currentTarget;
                              el.onerror = null;
                              el.src = DEFAULT_PROGRAM_THUMB;
                            }}
                          />
                          <div className="overflow-hidden">
                            <div className="fw-bold text-dark text-truncate" title={prog.title}>
                              {prog.title}
                            </div>
                            <div className="text-muted font-monospace small" style={{ fontSize: '0.72rem' }}>
                              /{prog.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="badge bg-light text-dark border fw-medium small">
                          {prog.category}
                        </span>
                      </td>

                      <td>
                        <div className="small text-dark fw-medium">{prog.delivery || 'In-Person & Lab'}</div>
                        <div className="text-muted small d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                          <Clock size={11} />
                          <span>{prog.duration || '12 Weeks'}</span>
                        </div>
                      </td>

                      <td>
                        <span className={`badge ${prog.scholarship ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'} small`}>
                          {prog.scholarship ? '100% Scholarship' : 'Standard Tuition'}
                        </span>
                      </td>

                      <td>
                        <span className="badge bg-info-subtle text-info fw-semibold">
                          {prog.applicationCount} applicant{prog.applicationCount !== 1 ? 's' : ''}
                        </span>
                      </td>

                      <td>
                        <StatusBadge status={prog.isPublished ? 'PUBLISHED' : 'DRAFT'} />
                      </td>

                      <td className="text-end">
                        <div className="d-inline-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary p-1"
                            title="View Curriculum"
                            onClick={() => setViewProgram(prog)}
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary p-1"
                            title="Edit Track"
                            onClick={() => handleOpenEdit(prog)}
                          >
                            <FileText size={15} />
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm ${
                              prog.isPublished ? 'btn-outline-warning' : 'btn-outline-success'
                            } px-2 py-1 d-inline-flex align-items-center gap-1`}
                            style={{ fontSize: '0.75rem' }}
                            disabled={togglingId === prog.id}
                            onClick={() => handleTogglePublish(prog)}
                            title={prog.isPublished ? 'Unpublish from website' : 'Publish to live website'}
                          >
                            {togglingId === prog.id ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : prog.isPublished ? (
                              <>
                                <X size={13} />
                                <span>Hide</span>
                              </>
                            ) : (
                              <>
                                <Check size={13} />
                                <span>Publish</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger p-1"
                            title="Delete Program"
                            onClick={() => {
                              setActionError(null);
                              setDeleteProgramTarget(prog);
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total tracks)
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

      {/* Curriculum View Modal */}
      {viewProgram && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1055 }} onClick={() => setViewProgram(null)} />
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060, overflowY: 'auto' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable my-3" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
              <div className="modal-content shadow border-0 rounded-4 overflow-hidden d-flex flex-column" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
                <div className="modal-header border-bottom py-3 bg-light flex-shrink-0">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={viewProgram.image || '/images/programs/web-development.jpg'}
                      alt={viewProgram.title}
                      className="rounded-3 object-fit-cover shadow-sm"
                      style={{ width: 44, height: 44 }}
                      onError={(e) => {
                        const el = e.currentTarget;
                        el.onerror = null;
                        el.src = DEFAULT_PROGRAM_THUMB;
                      }}
                    />
                    <div>
                      <h5 className="modal-title fw-bold text-dark mb-0">{viewProgram.title}</h5>
                      <span className="text-muted small font-monospace">/{viewProgram.slug}</span>
                    </div>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setViewProgram(null)} />
                </div>

                <div className="modal-body py-4 flex-grow-1" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 170px)' }}>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="text-muted small d-block">Discipline Category</label>
                      <span className="badge bg-primary-subtle text-primary fw-semibold">{viewProgram.category}</span>
                    </div>
                    <div className="col-md-4">
                      <label className="text-muted small d-block">Delivery & Duration</label>
                      <span className="fw-medium text-dark small">{viewProgram.delivery} • {viewProgram.duration}</span>
                    </div>
                    <div className="col-md-4">
                      <label className="text-muted small d-block">Public Admissions Status</label>
                      <StatusBadge status={viewProgram.isPublished ? 'PUBLISHED' : 'DRAFT'} />
                    </div>

                    <div className="col-12">
                      <label className="text-muted small d-block">Program Summary</label>
                      <p className="text-dark small mb-0">{viewProgram.summary}</p>
                    </div>

                    <div className="col-12">
                      <label className="text-muted small d-block">Full Curriculum Overview</label>
                      <p className="text-dark small mb-0 p-3 bg-light rounded border">{viewProgram.description}</p>
                    </div>

                    {/* Modules */}
                    {viewProgram.modules && viewProgram.modules.length > 0 && (
                      <div className="col-12">
                        <label className="text-muted small d-block mb-2 fw-semibold">
                          <Layers size={14} className="me-1 text-primary" />
                          Curriculum Modules & Phases ({viewProgram.modules.length})
                        </label>
                        <ol className="list-group list-group-numbered small">
                          {viewProgram.modules.map((mod, i) => (
                            <li key={i} className="list-group-item d-flex align-items-center">
                              <span className="ms-2 text-dark">{mod}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Skills Covered */}
                    {viewProgram.skills && viewProgram.skills.length > 0 && (
                      <div className="col-12">
                        <label className="text-muted small d-block mb-2 fw-semibold">
                          <Award size={14} className="me-1 text-info" />
                          Competencies & Tech Stack
                        </label>
                        <div className="d-flex flex-wrap gap-1">
                          {viewProgram.skills.map((skill, i) => (
                            <span key={i} className="badge bg-light text-dark border px-2 py-1">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Career Paths */}
                    {viewProgram.careerPaths && viewProgram.careerPaths.length > 0 && (
                      <div className="col-12">
                        <label className="text-muted small d-block mb-2 fw-semibold">
                          <Award size={14} className="me-1 text-success" />
                          Career & Employment Outcomes
                        </label>
                        <div className="d-flex flex-wrap gap-1">
                          {viewProgram.careerPaths.map((career, i) => (
                            <span key={i} className="badge bg-success-subtle text-success px-2 py-1">
                              {career}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prerequisites */}
                    {viewProgram.prerequisites && (
                      <div className="col-12">
                        <label className="text-muted small d-block mb-1 fw-semibold">Prerequisites</label>
                        <div className="p-2 bg-light rounded small text-muted border">
                          {viewProgram.prerequisites}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer border-top py-2 bg-light">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      const p = viewProgram;
                      setViewProgram(null);
                      handleOpenEdit(p);
                    }}
                  >
                    <FileText size={14} className="me-1" />
                    Edit Track
                  </button>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => setViewProgram(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Program Modal */}
      {(isCreating || editProgram) && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1055 }}
            onClick={handleCloseModal}
          />
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060, overflowY: 'auto' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable my-3" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
              <div className="modal-content shadow border-0 rounded-4 overflow-hidden d-flex flex-column" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
                <form
                  onSubmit={handleSaveProgram}
                  className="d-flex flex-column flex-grow-1"
                  style={{ minHeight: 0, maxHeight: 'calc(100vh - 2rem)', overflow: 'hidden' }}
                >
                  <div className="modal-header border-bottom py-3 bg-light flex-shrink-0">
                    <h5 className="modal-title fw-bold text-dark mb-0">
                      {isCreating ? 'Create New Instructional Program' : `Edit: ${editProgram?.title}`}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      disabled={actionLoading || imageUploading}
                      onClick={handleCloseModal}
                    />
                  </div>

                  <div
                    className="modal-body py-4 flex-grow-1"
                    style={{
                      overflowY: 'auto',
                      maxHeight: 'calc(100vh - 170px)',
                      minHeight: 0,
                    }}
                  >
                    {actionError && (
                      <div className="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
                        <AlertCircle size={16} />
                        <span className="small">{actionError}</span>
                      </div>
                    )}

                    <div className="row g-3">
                      {/* Title */}
                      <div className="col-md-8">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Program Title <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Artificial Intelligence & Machine Learning"
                          required
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                        />
                      </div>

                      {/* Slug */}
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold text-dark mb-1">URL Identifier (Slug)</label>
                        <input
                          type="text"
                          className="form-control form-control-sm font-monospace"
                          placeholder="auto-generated-if-empty"
                          value={formSlug}
                          onChange={(e) => setFormSlug(e.target.value)}
                        />
                      </div>

                      {/* Category */}
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold text-dark mb-1">Category</label>
                        <select
                          className="form-select form-select-sm"
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Duration */}
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold text-dark mb-1">Duration</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. 12 Weeks (Full-Time)"
                          value={formDuration}
                          onChange={(e) => setFormDuration(e.target.value)}
                        />
                      </div>

                      {/* Delivery Mode */}
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold text-dark mb-1">Delivery Mode</label>
                        <select
                          className="form-select form-select-sm"
                          value={formDelivery}
                          onChange={(e) => setFormDelivery(e.target.value)}
                        >
                          {DELIVERY_MODES.map((dm) => (
                            <option key={dm} value={dm}>
                              {dm}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Scholarship Checkbox */}
                      <div className="col-md-12">
                        <div className="form-check form-switch p-2 bg-light rounded border">
                          <input
                            className="form-check-input ms-0 me-2"
                            type="checkbox"
                            role="switch"
                            id="scholarshipCheck"
                            checked={formScholarship}
                            onChange={(e) => setFormScholarship(e.target.checked)}
                          />
                          <label className="form-check-label small fw-semibold text-dark" htmlFor="scholarshipCheck">
                            100% Scholarship Funded Track (Tuition-free sponsorship available for eligible students)
                          </label>
                        </div>
                      </div>

                      {/* Program Image (Upload, Preview & Management) */}
                      <div className="col-12">
                        <div className="card border p-3 bg-light rounded-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <label className="form-label small fw-bold text-dark mb-0 d-flex align-items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                <circle cx="9" cy="9" r="2"/>
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                              </svg>
                              <span>Program Image</span>
                            </label>
                            <span className="badge bg-secondary-subtle text-secondary border small">
                              JPEG, PNG, WebP (Max 5MB)
                            </span>
                          </div>

                          {imageError && (
                            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-2" role="alert">
                              <AlertCircle size={15} className="flex-shrink-0" />
                              <span>{imageError}</span>
                            </div>
                          )}

                          <div className="row g-3 align-items-center">
                            {/* Preview Thumbnail Container */}
                            <div className="col-auto">
                              <div
                                className="position-relative rounded-3 overflow-hidden border shadow-sm bg-dark"
                                style={{ width: '160px', height: '100px' }}
                              >
                                <img
                                  src={imagePreviewUrl || formImage || DEFAULT_PROGRAM_THUMB}
                                  alt="Program Preview"
                                  className="w-100 h-100"
                                  style={{ objectFit: 'cover' }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = DEFAULT_PROGRAM_THUMB;
                                  }}
                                />
                                {imageUploading && (
                                  <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex flex-column align-items-center justify-content-center text-white p-1 text-center">
                                    <span className="spinner-border spinner-border-sm mb-1 text-info" role="status" />
                                    <small style={{ fontSize: '0.65rem' }}>Uploading...</small>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions and Status */}
                            <div className="col">
                              {/* Hidden Native File Input */}
                              <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/jpeg,image/png,image/webp"
                                className="d-none"
                                onChange={handleImageFileChange}
                                disabled={actionLoading || imageUploading}
                              />

                              <div className="d-flex flex-wrap gap-2 mb-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={actionLoading || imageUploading}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" x2="12" y1="3" y2="15"/>
                                  </svg>
                                  <span>{selectedImageFile || formImage ? 'Select / Replace Image' : 'Choose Program Image'}</span>
                                </button>

                                {(selectedImageFile || (formImage && formImage !== '/images/programs/web-development.jpg')) && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                    onClick={handleClearImage}
                                    disabled={actionLoading || imageUploading}
                                  >
                                    <RefreshCw size={14} />
                                    <span>Reset to Default</span>
                                  </button>
                                )}
                              </div>

                              <div className="small">
                                {selectedImageFile ? (
                                  <div className="text-success fw-semibold d-flex align-items-center gap-1">
                                    <Check size={14} className="flex-shrink-0" />
                                    <span>
                                      Selected: {selectedImageFile.name} ({(selectedImageFile.size / 1024).toFixed(0)} KB) — will upload to Cloudinary upon save.
                                    </span>
                                  </div>
                                ) : formImage?.includes('cloudinary.com') ? (
                                  <div className="text-primary d-flex align-items-center gap-1">
                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                                      Cloudinary Secure Asset
                                    </span>
                                    <span className="text-muted text-truncate" style={{ maxWidth: '280px' }}>
                                      {formImage}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted">
                                    Current source: <code className="small">{formImage || '/images/programs/web-development.jpg'}</code>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="col-12">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Short Summary <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={2}
                          placeholder="A concise, punchy description shown in program cards..."
                          required
                          value={formSummary}
                          onChange={(e) => setFormSummary(e.target.value)}
                        />
                      </div>

                      {/* Full Description */}
                      <div className="col-12">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Full Curriculum Overview & Description <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={4}
                          placeholder="Comprehensive details on the track, methodology, labs, and objectives..."
                          required
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                        />
                      </div>

                      {/* Modules */}
                      <div className="col-12">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Curriculum Modules (One module per line)
                        </label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={3}
                          placeholder="Module 1: Foundations of Machine Learning&#10;Module 2: Neural Networks & Deep Learning&#10;Module 3: Capstone Deployment"
                          value={formModules}
                          onChange={(e) => setFormModules(e.target.value)}
                        />
                      </div>

                      {/* Skills */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Skills & Tech Stack (Comma-separated)
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Python, PyTorch, TensorFlow, Scikit-learn"
                          value={formSkills}
                          onChange={(e) => setFormSkills(e.target.value)}
                        />
                      </div>

                      {/* Career Paths */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Career Outcomes (Comma-separated)
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="ML Engineer, AI Research Associate, Data Scientist"
                          value={formCareerPaths}
                          onChange={(e) => setFormCareerPaths(e.target.value)}
                        />
                      </div>

                      {/* Prerequisites */}
                      <div className="col-12">
                        <label className="form-label small fw-semibold text-dark mb-1">Prerequisites & Eligibility</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Introductory programming knowledge or passing logic score"
                          value={formPrerequisites}
                          onChange={(e) => setFormPrerequisites(e.target.value)}
                        />
                      </div>

                      {/* Publish Switch */}
                      <div className="col-12 pt-2 border-top">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="publishCheck"
                            checked={formIsPublished}
                            onChange={(e) => setFormIsPublished(e.target.checked)}
                          />
                          <label className="form-check-label small fw-semibold" htmlFor="publishCheck">
                            Publish immediately to the public Erkab admissions portal
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-top py-2 bg-light flex-shrink-0">
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      disabled={actionLoading || imageUploading}
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
                      disabled={actionLoading || imageUploading}
                    >
                      {(actionLoading || imageUploading) && <span className="spinner-border spinner-border-sm" />}
                      <span>{isCreating ? 'Save & Create Program' : 'Update Program Track'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProgramTarget && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1055 }} onClick={() => setDeleteProgramTarget(null)} />
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow border-0 rounded-4">
                <div className="modal-header border-bottom py-3">
                  <h5 className="modal-title fw-bold text-danger d-flex align-items-center gap-2 mb-0">
                    <AlertCircle size={20} />
                    <span>Delete Program Track</span>
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setDeleteProgramTarget(null)} />
                </div>
                <div className="modal-body py-4">
                  {actionError && (
                    <div className="alert alert-danger small mb-3">
                      {actionError}
                    </div>
                  )}
                  <p className="text-dark mb-2">
                    Are you sure you want to delete <strong>{deleteProgramTarget.title}</strong>?
                  </p>
                  <p className="text-muted small mb-0">
                    If any students have submitted scholarship applications for this track, the system will prevent deletion to safeguard academic history. You can choose to <strong>Unpublish</strong> the track instead to immediately hide it from public discovery.
                  </p>
                </div>
                <div className="modal-footer border-top py-2 bg-light">
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    disabled={actionLoading}
                    onClick={() => setDeleteProgramTarget(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger d-inline-flex align-items-center gap-1"
                    disabled={actionLoading}
                    onClick={handleConfirmDelete}
                  >
                    {actionLoading && <span className="spinner-border spinner-border-sm" />}
                    <span>Confirm Delete</span>
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
