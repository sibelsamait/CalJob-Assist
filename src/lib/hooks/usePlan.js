import { useMemo } from 'react';
import { useProfile } from '@/lib/hooks/useProfile';

export function usePlan() {
  const { profile, isLoading } = useProfile();

  const plan = profile?.plan ?? 'personal';
  const isActive = Boolean(profile?.plan) && profile.plan !== 'internal' ? true : false;
  const daysRemaining = profile?.plan_expires_at
    ? Math.max(0, Math.ceil((new Date(profile.plan_expires_at) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  const data = useMemo(() => ({
    plan,
    isActive,
    daysRemaining,
    isExpiring: daysRemaining !== null && daysRemaining <= 7,
    isExpired: daysRemaining !== null && daysRemaining <= 0,
    isLoading,
  }), [plan, isActive, daysRemaining, isLoading]);

  return data;
}

export default usePlan;
