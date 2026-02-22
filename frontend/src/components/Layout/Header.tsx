// src/components/Layout/Header.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { Button } from '../Button';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="bg-slate-950/50 backdrop-blur-md border-b border-white/[0.08] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            CollaborateX
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {isAuthenticated && user && (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold leading-tight">Authenticated as</p>
                <p className="font-semibold text-slate-200">{user.username}</p>
              </div>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
