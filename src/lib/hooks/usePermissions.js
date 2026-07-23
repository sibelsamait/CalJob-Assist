import { useMemo } from 'react';
import { ROLE_PERMISSIONS } from '@/lib/constants/roles';
import { useProfile } from '@/lib/hooks/useProfile';

export function usePermissions() {
  const { role } = useProfile();

  const permissions = useMemo(() => {
    const base = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user;
    return {
      ...base,
      canViewBilling: Boolean(base.viewBilling),
      canManageTeam: Boolean(base.manageTeam),
      canViewCalculators: Boolean(base.viewCalculators),
      canViewLibrary: Boolean(base.viewLibrary),
      canAccessAdmin: Boolean(base.all),
    };
  }, [role]);

  return permissions;
}

export default usePermissions;
