import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-14 w-14 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
      <div className={`${sizeClasses[size]} border-white/10 border-t-primary-500 rounded-full animate-spin`} />
      {message && <p className="mt-6 text-slate-400 font-medium tracking-wide animate-pulse">{message}</p>}
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-4xl mb-8 shadow-xl">
        📭
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      {description && <p className="text-slate-400 mb-10 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">{action}</div>}
    </div>
  );
};

export const Skeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mb-6 animate-pulse p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="h-5 bg-white/[0.05] rounded-lg mb-4 w-1/3" />
          <div className="h-4 bg-white/[0.05] rounded-lg w-full mb-3" />
          <div className="h-4 bg-white/[0.05] rounded-lg w-5/6 mb-4" />
          <div className="flex gap-3">
            <div className="h-8 w-20 bg-white/[0.05] rounded-lg" />
            <div className="h-8 w-20 bg-white/[0.05] rounded-lg" />
          </div>
        </div>
      ))}
    </>
  );
};
