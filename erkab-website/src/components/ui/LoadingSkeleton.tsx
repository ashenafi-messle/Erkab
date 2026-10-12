import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export function LoadingSkeleton({ rows = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`p-4 bg-white rounded-4 border border-light-subtle ${className}`}>
      <div className="placeholder-glow">
        <span className="placeholder col-7 placeholder-lg mb-3 rounded"></span>
        {Array.from({ length: rows }).map((_, i) => (
          <span key={i} className="placeholder col-12 mb-2 rounded"></span>
        ))}
        <span className="placeholder col-4 mt-2 rounded"></span>
      </div>
    </div>
  );
}
