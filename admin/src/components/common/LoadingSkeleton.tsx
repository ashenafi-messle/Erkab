'use client';

import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 5 }) => {
  return (
    <div className="p-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="placeholder-glow mb-3">
          <div
            className="placeholder col-12 bg-secondary bg-opacity-10 rounded"
            style={{ height: '2.5rem' }}
          />
        </div>
      ))}
    </div>
  );
};
