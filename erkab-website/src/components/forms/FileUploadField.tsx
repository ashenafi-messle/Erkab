'use client';

import React, { useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { UploadCloud, FileText, CheckCircle2, Trash2 } from 'lucide-react';

interface FileUploadFieldProps {
  label: string;
  name: string;
  accept: string;
  maxSizeMb?: number;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  required?: boolean;
  error?: string;
  description?: string;
}

export function FileUploadField({
  label,
  name,
  accept,
  maxSizeMb = 10,
  file,
  onFileSelect,
  required = false,
  error,
  description,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { locale } = useLanguage();
  const isAm = locale === 'am';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > maxSizeMb * 1024 * 1024) {
        alert(
          isAm
            ? `የፋይሉ መጠን ከ${maxSizeMb}MB ገደብ በላይ ነው።`
            : `File size exceeds the ${maxSizeMb}MB limit.`
        );
        return;
      }
      onFileSelect(selected);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mb-4 text-start">
      <label htmlFor={name} className="form-label fw-bold small text-dark mb-1">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {description && <div className="text-muted small mb-2">{description}</div>}

      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="d-none"
      />

      {!file ? (
        <div
          className={`file-upload-box ${error ? 'border-danger' : ''}`}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              inputRef.current?.click();
            }
          }}
          aria-label={`Upload ${label}`}
        >
          <UploadCloud size={32} className="text-primary mb-2" />
          <div className="fw-bold small text-dark">
            {isAm ? 'ፋይሎችን ለመምረጥ እዚህ ይጫኑ' : 'Tap or click to browse files'}
          </div>
          <div className="text-muted small">
            {isAm
              ? `የተፈቀዱ፡ ${accept} (እስከ ${maxSizeMb}MB)`
              : `Allowed: ${accept} (Max ${maxSizeMb}MB)`}
          </div>
        </div>
      ) : (
        <div className="file-preview-card">
          <div className="file-preview-info">
            <div className="p-2 rounded bg-white text-primary border border-info-subtle">
              <FileText size={22} />
            </div>
            <div>
              <div className="fw-bold text-dark small text-truncate" style={{ maxWidth: '200px' }}>
                {file.name}
              </div>
              <div className="text-muted small d-flex align-items-center gap-1">
                <CheckCircle2 size={13} className="text-success" />
                <span>{formatFileSize(file.size)}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="btn btn-sm btn-outline-danger p-1 px-2 d-flex align-items-center gap-1"
            title="Remove file"
          >
            <Trash2 size={14} />
            <span className="d-none d-sm-inline small">
              {isAm ? 'ሰርዝ' : 'Remove'}
            </span>
          </button>
        </div>
      )}

      {error && <div className="invalid-feedback d-block mt-1">{error}</div>}
    </div>
  );
}
