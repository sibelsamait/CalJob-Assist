"use client";

import Link from 'next/link';
import { Bell, LogOut, Search, Settings2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { PlanBadge } from '@/components/ui/PlanBadge';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { useProfile } from '@/lib/hooks/useProfile';
import { usePlan } from '@/lib/hooks/usePlan';

export function Header() {
  const { signOut } = useAuth();
  const { fullName, organization, role, profile } = useProfile();
  const { plan } = usePlan();

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Bienvenido, {fullName}</p>
          <p className="text-sm text-slate-500">{organization}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
            <Search className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-500">Buscar</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
            <PlanBadge plan={plan} />
            <RoleBadge role={role} />
          </div>
          <button className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <Bell className="h-4 w-4" />
          </button>
          <Link href="/configuracion" className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <Settings2 className="h-4 w-4" />
          </Link>
          <button
            onClick={() => signOut()} 
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
