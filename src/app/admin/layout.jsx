"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
    </div>
  );
}

export default function AdminLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isStaff } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!isStaff) {
      router.replace('/dashboard?error=no_permission');
    }
  }, [isAuthenticated, isLoading, isStaff, router]);

  if (isLoading || !isAuthenticated || !isStaff) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Header />
          <main className="flex-1 p-6">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
