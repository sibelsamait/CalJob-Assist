"use client";

import Link from 'next/link';
import { ArrowRight, Calculator, FileText, Library, Ticket } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PlanBadge } from '@/components/ui/PlanBadge';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { IndicatorBar } from '@/components/calculadoras/IndicatorBar';
import { useProfile } from '@/lib/hooks/useProfile';
import { usePlan } from '@/lib/hooks/usePlan';
import { COLORS } from '@/lib/constants/theme';

const SHORTCUTS = [
  { href: '/calculadoras', title: 'Calculadoras laborales', description: 'Sueldo, finiquito, vacaciones e indicadores.', icon: Calculator },
  { href: '/biblioteca', title: 'Biblioteca legal', description: 'Consulta normas y referencias para tu trabajo.', icon: Library },
  { href: '/documentos', title: 'Mis documentos', description: 'Revisa los archivos generados en tu cuenta.', icon: FileText },
  { href: '/tickets', title: 'Soporte', description: 'Abre y revisa tus tickets de atención.', icon: Ticket },
];

export default function DashboardHomePage() {
  const { fullName, organization, profile, isLoading } = useProfile();
  const { daysRemaining, isExpiring, isExpired } = usePlan();

  if (isLoading) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;

  return <div className="space-y-6"><PageHeader title={`Hola, ${fullName}`} description="Este es el resumen de tu operación en CalJob Assist." /><div className="grid gap-6 lg:grid-cols-[1fr_320px]"><section className="space-y-6"><IndicatorBar /><div className="grid gap-4 sm:grid-cols-2">{SHORTCUTS.map((shortcut) => { const Icon = shortcut.icon; return <Link key={shortcut.href} href={shortcut.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${COLORS.primary}12`, color: COLORS.primary }}><Icon className="h-5 w-5" /></span><ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-1" /></div><h2 className="mt-5 font-semibold text-slate-900">{shortcut.title}</h2><p className="mt-1 text-sm text-slate-600">{shortcut.description}</p></Link>; })}</div></section><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Tu plan</p><div className="mt-4 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold text-slate-900">{profile?.plan || 'personal'}</h2><PlanBadge plan={profile?.plan} /></div><p className="mt-4 text-sm text-slate-600">Organización: <strong className="font-medium text-slate-900">{organization}</strong></p>{daysRemaining !== null ? <p className="mt-3 text-sm text-slate-600">{isExpired ? 'Plan vencido' : `Quedan ${daysRemaining} días`}</p> : <p className="mt-3 text-sm text-slate-600">Vigencia administrada por tu suscripción.</p>}<Link href="/billing/portal" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">Gestionar suscripción<ArrowRight className="h-4 w-4" /></Link></aside></div>{isExpired ? <AlertBanner tone="error" title="Tu plan está vencido" description="Renueva para mantener acceso completo." action={<Link href="/billing/planes" className="font-semibold underline">Renovar</Link>} /> : isExpiring ? <AlertBanner tone="warning" title="Tu plan está próximo a vencer" description={`Tu plan vence en ${daysRemaining} días.`} action={<Link href="/billing/planes" className="font-semibold underline">Renovar ahora</Link>} /> : null}</div>;
}