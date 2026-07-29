"use client";

import { useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthContext } from '@/lib/AuthContext';
import { usePermissions } from '@/lib/hooks/usePermissions';

export default function ProtectedRoute({
  children,
  requiredCapability = null,
  requiredRoles = null,
  redirectTo = '/login',
}) {
  const { user, isLoading: loading } = useContext(AuthContext);
  const { can, needsBilling, isStaff, role } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isStaff) return;

    if (needsBilling) {
      router.replace('/billing/planes?reason=no_plan');
      return;
    }

    if (requiredCapability && !can(requiredCapability)) {
      router.replace('/dashboard?error=no_permission');
      return;
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      router.replace('/dashboard?error=no_permission');
      return;
    }
  }, [user, loading, isStaff, needsBilling, can, role, requiredCapability, requiredRoles, router, redirectTo, pathname]);

  if (loading) return <LoadingSkeleton />;

  return <>{children}</>;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#F0F3FA] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#003087] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Verificando acceso...</p>
      </div>
    </div>
  );
}
