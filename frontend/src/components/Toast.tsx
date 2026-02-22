import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { removeToast } from '../store/slices/uiSlice';

export const ToastContainer: React.FC = () => {
    const { toasts } = useAppSelector((state) => state.ui);

    return (
        <div className="fixed top-6 right-6 z-[60] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} {...toast} />
            ))}
        </div>
    );
};

interface ToastItemProps {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

const ToastItem: React.FC<ToastItemProps> = ({ id, message, type }) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(removeToast(id));
        }, 5000);
        return () => clearTimeout(timer);
    }, [id, dispatch]);

    const typeStyles = {
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10',
        error: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/10',
        info: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/10',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10',
    };

    const icons = {
        success: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        ),
        error: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
        ),
        info: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12.01" y2="16" /><path d="M12 8v4" />
            </svg>
        ),
        warning: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
    };

    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl animate-in slide-in-from-right-8 duration-300 ${typeStyles[type]}`}
        >
            <div className="shrink-0">{icons[type]}</div>
            <p className="text-xs font-bold tracking-tight">{message}</p>
            <button
                onClick={() => dispatch(removeToast(id))}
                className="ml-2 hover:opacity-70 transition-opacity p-1"
            >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    );
};
