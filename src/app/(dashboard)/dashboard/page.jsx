"use client";

import { usePermissions } from '@/lib/hooks/usePermissions';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import UserDashboard from '@/components/dashboards/UserDashboard';

export default function DashboardPage() {
  const { role } = usePermissions();

  const dashboards = {
    admin: <AdminDashboard />,
    user: <UserDashboard />,
  };

  return dashboards[role] ?? <UserDashboard />;
}
