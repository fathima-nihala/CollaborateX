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
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          CollaborateX
        </Link>

        <div className="flex items-center gap-6">
          {isAuthenticated && user && (
            <>
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome</p>
                <p className="font-semibold text-gray-900">{user.username}</p>
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
