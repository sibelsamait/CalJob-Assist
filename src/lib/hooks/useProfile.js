import { useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';

export function useProfile() {
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  return useMemo(() => ({
    user,
    profile,
    isAuthenticated,
    isLoading,
    role: profile?.role ?? 'user',
    plan: profile?.plan ?? 'personal',
    fullName: profile?.full_name || user?.email || 'Usuario',
    organization: profile?.company_name || 'Sin organización',
  }), [user, profile, isAuthenticated, isLoading]);
}

export default useProfile;
