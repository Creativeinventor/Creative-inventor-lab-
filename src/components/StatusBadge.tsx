import React from 'react';
import type { UserStatus } from '../types/index.js';

interface StatusBadgeProps {
  status: UserStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = String(status).toUpperCase();

  if (norm === 'ACTIVE') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        ACTIVE
      </span>
    );
  }

  if (norm === 'EXPIRED') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        EXPIRED
      </span>
    );
  }

  if (norm === 'DISABLED') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-rose-400 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        DISABLED
      </span>
    );
  }

  return (
    <span className={`text-xs text-slate-400 font-mono ${className}`}>
      {status}
    </span>
  );
};
