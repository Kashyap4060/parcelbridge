import * as React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'} bg-gray-200 rounded`} />
      ))}
    </div>
  );
}


