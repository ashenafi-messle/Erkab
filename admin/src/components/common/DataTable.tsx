'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  itemsPerPage?: number;
  emptyTitle?: string;
  emptyMessage?: string;
  filterOptions?: {
    label: string;
    field: keyof T;
    options: { label: string; value: string }[];
  };
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  searchPlaceholder = 'Search records...',
  searchFields,
  itemsPerPage = 10,
  emptyTitle = 'No records found',
  emptyMessage = 'There are no items matching your criteria or no data has been registered yet.',
  filterOptions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Filter by dropdown
    if (filterOptions && selectedFilter !== 'ALL') {
      result = result.filter((item) => String(item[filterOptions.field]) === selectedFilter);
    }

    // Filter by search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => {
        if (searchFields && searchFields.length > 0) {
          return searchFields.some((field) => {
            const val = item[field];
            return val ? String(val).toLowerCase().includes(term) : false;
          });
        }
        return Object.values(item).some((val) =>
          val ? String(val).toLowerCase().includes(term) : false
        );
      });
    }

    return result;
  }, [data, searchTerm, selectedFilter, filterOptions, searchFields]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <div className="admin-card">
      {/* Controls Bar */}
      <div className="p-3 border-bottom d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: 380 }}>
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <Search size={15} />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {filterOptions && (
          <div className="d-flex align-items-center gap-2">
            <label className="small text-muted mb-0 d-flex align-items-center gap-1">
              <Filter size={14} />
              <span>{filterOptions.label}:</span>
            </label>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All {filterOptions.label}s</option>
              {filterOptions.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table Content */}
      {loading ? (
        <LoadingSkeleton rows={itemsPerPage} />
      ) : paginatedData.length === 0 ? (
        <EmptyState title={emptyTitle} message={emptyMessage} />
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className={col.className}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIdx) => (
                <tr key={row.id || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={col.className}>
                      {col.render ? col.render(row) : col.accessor ? String(row[col.accessor] ?? '—') : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && filteredData.length > 0 && (
        <div className="p-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small text-muted">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
          </div>
          <div className="d-flex align-items-center gap-1">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-2 py-1"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-2 py-1"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
