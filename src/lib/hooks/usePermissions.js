import { useMemo } from 'react';
import { useProfile } from '@/lib/hooks/useProfile';

const CAPABILITIES = {
  accessPlatformAdmin: ['admin'],
  manageAllUsers: ['admin'],
  managePlatformBilling: ['admin'],
  viewAuditLogAll: ['admin'],
  assignRoles: ['admin'],
  bypassBilling: ['admin', 'tecnico'],

  accessTechPanel: ['admin', 'tecnico'],
  viewAllTickets: ['admin', 'tecnico'],
  resolveTickets: ['admin', 'tecnico'],
  viewAllCompanies: ['admin', 'tecnico'],
  viewUserProfiles: ['admin', 'tecnico'],
  viewSystemLogs: ['admin', 'tecnico'],

  viewOwnBilling: ['admin', 'plan_owner'],
  manageSubscription: ['admin', 'plan_owner'],
  inviteTeamMembers: ['admin', 'plan_owner'],
  manageTeamPermissions: ['admin', 'plan_owner'],
  viewTeamMemberList: ['admin', 'plan_owner'],

  useCalculators: ['admin', 'tecnico', 'plan_owner', 'team_member', 'user', 'readonly'],
  saveCalculations: ['admin', 'tecnico', 'plan_owner', 'team_member'],
  exportCalculationsPDF: ['admin', 'plan_owner', 'team_member'],

  viewTramites: ['admin', 'tecnico', 'plan_owner', 'team_member'],
  createTramites: ['admin', 'plan_owner', 'team_member'],
  viewMediaciones: ['admin', 'tecnico', 'plan_owner', 'team_member'],
  createMediaciones: ['admin', 'plan_owner', 'team_member'],

  viewLibrary: ['admin', 'tecnico', 'plan_owner', 'team_member'],
  viewLibraryBasic: ['user', 'readonly'],

  viewSIIGuides: ['admin', 'tecnico', 'plan_owner', 'team_member', 'readonly'],

  viewCalendar: ['admin', 'tecnico', 'plan_owner', 'team_member', 'readonly'],
  createCalendarEvents: ['admin', 'tecnico', 'plan_owner', 'team_member'],

  viewOwnDocuments: ['admin', 'plan_owner', 'team_member'],
  uploadDocuments: ['admin', 'plan_owner', 'team_member'],

  createSupportTicket: ['admin', 'tecnico', 'plan_owner', 'team_member', 'user'],
  viewOwnTickets: ['admin', 'plan_owner', 'team_member', 'user'],

  receiveNotifications: ['admin', 'tecnico', 'plan_owner', 'team_member', 'readonly'],
};

const PLAN_CAPABILITIES = {
  personal: {
    maxUsers: 1,
    canExportPDF: true,
    canUseMediaciones: false,
    canUseTramites: true,
    canUseBiblioteca: true,
  },
  team: {
    maxUsers: 10,
    canExportPDF: true,
    canUseMediaciones: true,
    canUseTramites: true,
    canUseBiblioteca: true,
  },
  enterprise: {
    maxUsers: -1,
    canExportPDF: true,
    canUseMediaciones: true,
    canUseTramites: true,
    canUseBiblioteca: true,
  },
  none: {
    maxUsers: 0,
    canExportPDF: false,
    canUseMediaciones: false,
    canUseTramites: false,
    canUseBiblioteca: false,
  },
};

export function usePermissions() {
  const { profile, role: profileRole, plan: profilePlan } = useProfile();

  return useMemo(() => {
    const role = profileRole || 'user';
    const plan = profilePlan || 'none';
    const hasActiveLicense = Boolean(profile?.license_active);

    const effectivePlan = ['admin', 'tecnico'].includes(role)
      ? 'enterprise'
      : ['plan_owner', 'team_member'].includes(role)
      ? hasActiveLicense
        ? plan
        : 'none'
      : role === 'readonly'
      ? 'none'
      : plan;

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
      needsBilling: !['admin', 'tecnico'].includes(role) && effectivePlan === 'none',
      isAdmin: role === 'admin',
      isTecnico: role === 'tecnico',
      isPlanOwner: role === 'plan_owner',
      isTeamMember: role === 'team_member',
      isStaff: ['admin', 'tecnico'].includes(role),
      isSubscribed: effectivePlan !== 'none',
      canViewBilling: can('viewOwnBilling'),
      canManageTeam: can('manageTeamPermissions') || can('inviteTeamMembers'),
      canViewCalculators: can('useCalculators'),
      canViewLibrary: can('viewLibrary') || can('viewLibraryBasic'),
      canAccessAdmin: can('accessPlatformAdmin') || can('accessTechPanel'),
      canViewTickets: can('viewAllTickets') || can('viewOwnTickets'),
    };
  }, [profile, profilePlan, profileRole]);
}

export default usePermissions;
