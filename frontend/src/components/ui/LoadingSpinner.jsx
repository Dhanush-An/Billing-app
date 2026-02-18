import React from 'react';

export function LoadingSpinner({ className = '' }) {
  return (
    <div
      className={`inline-block size-8 animate-spin rounded-full border-2 border-current border-t-transparent text-violet-500 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner className="size-10" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}
