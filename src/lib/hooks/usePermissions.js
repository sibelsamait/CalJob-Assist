import { useMemo } from 'react';
import { useProfile } from '@/lib/hooks/useProfile';

const CAPABILITIES = {
  accessPlatformAdmin: ['admin'],
  manageAllUsers: ['admin'],
  managePlatformBilling: ['admin'],
  viewAuditLogAll: ['admin'],
  assignRoles: ['admin'],
  bypassBilling: ['admin'],

  accessTechPanel: ['admin'],
  viewAllTickets: ['admin'],
  resolveTickets: ['admin'],
  viewAllCompanies: ['admin'],
  viewUserProfiles: ['admin'],
  viewSystemLogs: ['admin'],

  viewOwnBilling: ['admin'],
  manageSubscription: ['admin'],
  inviteTeamMembers: ['admin'],
  manageTeamPermissions: ['admin'],
  viewTeamMemberList: ['admin'],

  useCalculators: ['admin', 'user'],
  saveCalculations: ['admin', 'user'],
  exportCalculationsPDF: ['admin', 'user'],

  viewTramites: ['admin', 'user'],
  createTramites: ['admin', 'user'],
  viewMediaciones: ['admin', 'user'],
  createMediaciones: ['admin', 'user'],

  viewLibrary: ['admin', 'user'],
  viewLibraryBasic: ['admin', 'user'],

  viewSIIGuides: ['admin', 'user'],

  viewCalendar: ['admin', 'user'],
  createCalendarEvents: ['admin', 'user'],

  viewOwnDocuments: ['admin', 'user'],
  uploadDocuments: ['admin', 'user'],

  createSupportTicket: ['admin', 'user'],
  viewOwnTickets: ['admin', 'user'],

  receiveNotifications: ['admin', 'user'],
};

const PLAN_CAPABILITIES = {
  enterprise: {
    maxUsers: -1,
    canExportPDF: true,
    canUseMediaciones: true,
    canUseTramites: true,
    canUseBiblioteca: true,
  },
};

export function usePermissions() {
  const { profile, role: profileRole, plan: profilePlan } = useProfile();

  return useMemo(() => {
    const role = profileRole === 'admin' ? 'admin' : 'user';
    const plan = 'enterprise';
    const effectivePlan = 'enterprise';

    const can = (capability) => {
      const allowed = CAPABILITIES[capability];
      if (!Array.isArray(allowed)) return false;
      return allowed.includes(role);
    };

    const planCaps = PLAN_CAPABILITIES[effectivePlan] || PLAN_CAPABILITIES.none;

    return {
      role,
      plan,
      effectivePlan,
      can,
      planCaps,
      needsBilling: false,
      isAdmin: role === 'admin',
      isPlanOwner: false,
      isTeamMember: false,
      isStaff: role === 'admin',
      isSubscribed: true,
      canViewBilling: false,
      canManageTeam: false,
      canViewCalculators: can('useCalculators'),
      canViewLibrary: can('viewLibrary') || can('viewLibraryBasic'),
      canAccessAdmin: role === 'admin',
      canViewTickets: role === 'admin' || can('viewOwnTickets'),
    };
  }, [profile, profilePlan, profileRole]);
}

export default usePermissions;
