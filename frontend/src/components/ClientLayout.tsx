'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Public routes that don't need layout
  if (pathname === '/login' || pathname === '/') {
    return <>{children}</>;
  }

  // Protected routes with layout
  if (isAuthenticated) {
    return <Layout>{children}</Layout>;
  }

  // Redirect to login for unauthenticated users
  return <>{children}</>;
}