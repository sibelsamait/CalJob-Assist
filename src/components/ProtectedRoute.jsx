"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
  </div>
);

/**
 * Wrap a page component with this to require authentication.
 * requireAdmin / requireStaff redirect non-matching roles to "/".
 */
export default function ProtectedRoute({ children, requireAdmin = false, requireStaff = false }) {
  const { isAuthenticated, isLoading, isAdmin, isStaff } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (requireAdmin && !isAdmin) { router.replace('/'); return; }
    if (requireStaff && !isStaff) { router.replace('/'); return; }
    // check active license/access
    (async () => {
      try {
        const res = await fetch('/api/licenses/check');
        if (res.ok) {
          const json = await res.json();
          if (!json.active) {
            router.replace('/not-authorized');
          }
        }
      } catch (e) {
        // ignore network errors here
      }
    })();
  }, [isLoading, isAuthenticated, isAdmin, isStaff, requireAdmin, requireStaff, router]);

  if (isLoading || !isAuthenticated) return <Spinner />;
  if (requireAdmin && !isAdmin) return <Spinner />;
  if (requireStaff && !isStaff) return <Spinner />;

  return children;
}
