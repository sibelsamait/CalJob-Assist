"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Calculator,
  Files,
  Scale,
  BookOpen,
  FileText,
  MessageSquareMore,
  Settings,
  ShieldCheck,
  ChevronRight,
  CircleDollarSign,
  Users,
} from 'lucide-react';
import { useProfile } from '@/lib/hooks/useProfile';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { PlanBadge } from '@/components/ui/PlanBadge';
import { COLORS } from '@/lib/constants/theme';

const navigation = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutGrid },
  { href: '/calculadoras', label: 'Calculadoras', icon: Calculator },
  { href: '/tramites', label: 'Trámites', icon: Files },
  { href: '/mediaciones', label: 'Mediaciones', icon: Scale },
  { href: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
  { href: '/documentos', label: 'Documentos', icon: FileText },
  { href: '/tickets', label: 'Tickets', icon: MessageSquareMore },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, fullName } = useProfile();
  const permissions = usePermissions();

  const visibleNavigation = navigation.filter((item) => {
    if (item.href === '/configuracion') return true;
    if (item.href === '/calculadoras') return permissions.canViewCalculators;
    if (item.href === '/biblioteca') return permissions.canViewLibrary;
    return true;
  });

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-slate-950 text-slate-100">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold">
            CJ
          </div>
          <div>
            <p className="text-sm font-semibold">CalJob Assist</p>
            <p className="text-xs text-slate-400">Panel de operación</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{fullName}</p>
            <PlanBadge plan={profile?.plan} className="text-[10px]" />
          </div>
          <p className="mt-1 text-xs text-slate-400">{profile?.company_name || 'Sin organización'}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {visibleNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-md ${isActive ? 'bg-white/10 text-white' : 'text-slate-300'}`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/billing/portal"
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-md"
        >
          <span className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4" />
            Suscripción
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
        {permissions.canAccessAdmin ? (
          <Link
            href="/admin"
            className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-md"
          >
            <ShieldCheck className="h-4 w-4" />
            Administración
          </Link>
        ) : null}
      </div>
    </aside>
  );
}

export default Sidebar;
