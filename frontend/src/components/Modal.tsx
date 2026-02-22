import React, { useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    variant?: 'primary' | 'danger';
    isLoading?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    variant = 'primary',
    isLoading = false,
}) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-md bg-[#161b2c] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/[0.05] flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 text-slate-400 text-sm leading-relaxed">
                    {children}
                </div>

                {/* Footer */}
                <div className="px-6 py-5 bg-white/[0.02] border-t border-white/[0.05] flex flex-col sm:flex-row gap-3 justify-end leading-none">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="sm:order-1 order-2 py-2.5"
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                    {onConfirm && (
                        <Button
                            variant={variant}
                            onClick={onConfirm}
                            className="sm:order-2 order-1 py-2.5"
                            loading={isLoading}
                        >
                            {confirmLabel}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
