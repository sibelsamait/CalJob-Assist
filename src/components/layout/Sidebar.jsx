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
  CalendarDays,
  MessageSquareMore,
  ShieldCheck,
  Users,
  Building2,
  CircleDollarSign,
  Settings,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useFeatureFlags } from '@/lib/hooks/useFeatureFlags';
import { PlanBadge } from '@/components/ui/PlanBadge';

const TOOL_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutGrid,
    visible: () => true,
  },
  {
    href: '/dashboard/calculadoras',
    label: 'Calculadoras',
    icon: Calculator,
    visible: (permissions) => permissions.canViewCalculators,
  },
  {
    href: '/dashboard/tramites',
    label: 'Trámites',
    icon: Files,
    visible: (permissions) => permissions.planCaps.canUseTramites || permissions.isStaff,
    disabled: (featureFlags, permissions) => permissions.isTeamMember && !featureFlags.tramites,
  },
  {
    href: '/dashboard/mediaciones',
    label: 'Mediaciones',
    icon: Scale,
    visible: (permissions) => permissions.planCaps.canUseMediaciones || permissions.isStaff,
    disabled: (featureFlags, permissions) => permissions.isTeamMember && !featureFlags.mediaciones,
  },
  {
    href: '/dashboard/biblioteca',
    label: 'Biblioteca',
    icon: BookOpen,
    visible: (permissions) => permissions.canViewLibrary || permissions.isStaff,
    disabled: (featureFlags, permissions) => permissions.isTeamMember && !featureFlags.biblioteca,
  },
  {
    href: '/dashboard/sii',
    label: 'Guías SII',
    icon: FileText,
    visible: (permissions) => permissions.can('viewSIIGuides'),
  },
  {
    href: '/dashboard/calendario',
    label: 'Calendario',
    icon: CalendarDays,
    visible: (permissions) => permissions.can('viewCalendar'),
  },
  {
    href: '/dashboard/documentos',
    label: 'Documentos',
    icon: FileText,
    visible: (permissions) => permissions.can('viewOwnDocuments') || permissions.isStaff,
    disabled: (featureFlags, permissions) => permissions.isTeamMember && !featureFlags.documentos,
  },
];

function NavItem({ href, label, icon: Icon, active, disabled, tooltip }) {
  const baseClass = `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
    active ? 'bg-white/10 text-white' : 'text-slate-300 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-md'
  }`;

  if (disabled) {
    return (
      <div
        title={tooltip}
        className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-500 bg-slate-950/60"
      >
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          {label}
        </span>
        <Lock className="h-4 w-4 text-slate-500" />
      </div>
    );
  }

  return (
    <Link href={href} className={baseClass}>
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <ChevronRight className="h-4 w-4" />
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const permissions = usePermissions();
  const featureFlags = useFeatureFlags();

  const isStaff = permissions.isStaff;
  const isPlanOwner = permissions.isPlanOwner;
  const showTeamSection = isPlanOwner && permissions.planCaps.maxUsers !== 0;

  const adminNav = [
    { href: '/admin', label: 'Panel admin', icon: ShieldCheck },
    { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
    { href: '/admin/empresas', label: 'Empresas', icon: Building2 },
    { href: '/admin/audit', label: 'Logs de auditoría', icon: FileText },
    { href: '/admin/config', label: 'Configuración SaaS', icon: Settings },
  ];

  const supportNav = [
    { href: '/admin/tickets', label: 'Centro de Tickets', icon: MessageSquareMore },
    { href: '/admin/empresas', label: 'Empresas', icon: Building2 },
  ];

  const toolsNav = TOOL_ITEMS.filter((item) => item.visible(permissions));

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-slate-950 text-slate-100">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold">
            CJ
          </div>
          <div>
            <p className="text-sm font-semibold">CalJob Assist</p>
            <p className="text-xs text-slate-400">Panel de acceso</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{profile?.full_name || 'Usuario'}</p>
              <p className="text-xs text-slate-400">{profile?.company_name || 'Sin organización'}</p>
            </div>
            <PlanBadge plan={permissions.effectivePlan || profile?.plan || 'none'} className="text-[10px]" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {isStaff && (
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Soporte</p>
            {supportNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return <NavItem key={item.href} {...item} active={active} />;
            })}
          </div>
        )}

        {permissions.canAccessAdmin && (
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Plataforma</p>
            {adminNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const accessible = item.href === '/admin/config' ? permissions.isAdmin : true;
              if (!accessible) return null;
              return <NavItem key={item.href} {...item} active={active} />;
            })}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Herramientas</p>
          {toolsNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const disabled = Boolean(item.disabled && item.disabled(featureFlags, permissions));
            const tooltip = disabled ? 'Tu administrador no ha habilitado esta función.' : undefined;
            return <NavItem key={item.href} {...item} active={active} disabled={disabled} tooltip={tooltip} />;
          })}
        </div>

        {showTeamSection && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Equipo</p>
            <NavItem href="/dashboard/configuracion/equipo" label="Mi equipo" icon={Users} active={pathname === '/dashboard/configuracion/equipo'} />
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-3 space-y-2">
        {isPlanOwner && (
          <Link
            href="/billing/portal"
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-md"
          >
            <span className="flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4" />
              Mi suscripción
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
        <Link
          href="/dashboard/configuracion"
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-md"
        >
          <span className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Mi perfil
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          href="/dashboard/tickets"
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-md"
        >
          <span className="flex items-center gap-2">
            <MessageSquareMore className="h-4 w-4" />
            Soporte
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-left text-sm text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-md"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
