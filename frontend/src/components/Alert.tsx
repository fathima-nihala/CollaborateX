import React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose, className = '', ...props }) => {
  const typeStyles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_4px_12px_rgba(16,185,129,0.1)]',
    error: 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_4px_12px_rgba(239,68,68,0.1)]',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_4px_12px_rgba(245,158,11,0.1)]',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_4px_12px_rgba(59,130,246,0.1)]',
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12.01" y2="16" /><path d="M12 8v4" />
      </svg>
    ),
  };

  return (
    <div
      className={`border rounded-xl p-4 flex items-center justify-between backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-500 ${typeStyles[type]} ${className}`}
      {...props}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 opacity-80">{icons[type]}</div>
        <span className="text-sm font-semibold tracking-tight leading-tight">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};
