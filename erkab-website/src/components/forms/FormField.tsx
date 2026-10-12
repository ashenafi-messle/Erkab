'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  isTextArea?: boolean;
  rows?: number;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  options,
  isTextArea = false,
  rows = 4,
}: FormFieldProps) {
  const { locale } = useLanguage();
  const isAm = locale === 'am';

  return (
    <div className="mb-3 text-start">
      <label htmlFor={name} className="form-label fw-bold small text-dark mb-1">
        {label} {required && <span className="text-danger">*</span>}
      </label>

      {options ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`form-select ${error ? 'is-invalid' : ''}`}
          required={required}
        >
          <option value="">
            {placeholder || (isAm ? 'አንድ አማራጭ ይምረጡ...' : 'Select an option...')}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : isTextArea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          required={required}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          required={required}
        />
      )}

      {helpText && !error && (
        <div className="form-text small text-muted mt-1">{helpText}</div>
      )}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}
