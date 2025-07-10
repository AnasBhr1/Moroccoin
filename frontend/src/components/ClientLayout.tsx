'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Handle redirection logic
  useEffect(() => {
    if (!isLoading) {
      // If we're on the home page, redirect based on auth status
      if (pathname === '/') {
        if (isAuthenticated) {
          router.replace('/dashboard');
        } else {
          router.replace('/login');
        }
        return;
      }

      // If we're not authenticated and trying to access protected routes
      if (!isAuthenticated && pathname !== '/login') {
        router.replace('/login');
        return;
      }

      // If we're authenticated and trying to access login page
      if (isAuthenticated && pathname === '/login') {
        router.replace('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);
  
  // Show loading spinner while checking auth or during navigation
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Loading...</h3>
            <p className="text-sm text-gray-600">Preparing your dashboard</p>
          </div>
        </div>
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

  // This should rarely be reached due to the useEffect above, but just in case
  return <>{children}</>;
}