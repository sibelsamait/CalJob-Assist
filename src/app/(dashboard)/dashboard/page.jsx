"use client";

import { usePermissions } from '@/lib/hooks/usePermissions';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import TecnicoDashboard from '@/components/dashboards/TecnicoDashboard';
import PlanOwnerDashboard from '@/components/dashboards/PlanOwnerDashboard';
import TeamMemberDashboard from '@/components/dashboards/TeamMemberDashboard';
import UserDashboard from '@/components/dashboards/UserDashboard';

export default function DashboardPage() {
  const { role } = usePermissions();

  const dashboards = {
    admin: <AdminDashboard />,
    tecnico: <TecnicoDashboard />,
    plan_owner: <PlanOwnerDashboard />,
    team_member: <TeamMemberDashboard />,
    readonly: <UserDashboard readonly />,
    user: <UserDashboard />,
  };

  return dashboards[role] ?? <UserDashboard />;
}
