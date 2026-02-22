// src/components/Layout/Layout.tsx
import React from 'react';
import { Header } from './Header';
import { ToastContainer } from '../Toast';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Header />
      <ToastContainer />
      <main className="max-w-7xl mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  );
};
