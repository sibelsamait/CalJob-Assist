"use client";

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { EmptyState } from '@/components/ui/EmptyState';
import { PLANS } from '@/lib/constants/plans';
import { PlanBadge } from '@/components/ui/PlanBadge';
import { useAuth } from '@/lib/AuthContext';

export default function BillingPortalPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login?redirect=%2Fbilling%2Fportal');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    fetch('/api/payments/requests')
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error || 'No se pudo cargar tu suscripción.'); return result.requests || []; })
      .then(setRequests)
      .catch((fetchError) => setError(fetchError.message || 'No se pudo cargar tu suscripción.'))
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);

  if (authLoading || loading) return <main className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-slate-700" /></main>;
  if (!isAuthenticated) return null;

  return <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900"><div className="mx-auto max-w-5xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Suscripción</p><h1 className="mt-3 text-3xl font-semibold">Gestionar suscripción</h1><p className="mt-2 text-slate-600">Consulta tus solicitudes y estados de activación.</p>{error ? <div className="mt-6"><AlertBanner tone="error" title="No se pudo cargar la información" description={error} /></div> : null}{!error && requests.length === 0 ? <div className="mt-8"><EmptyState title="Aún no tienes solicitudes" description="Elige un plan para comenzar tu suscripción." actionLabel="Ver planes" href="/billing/planes" /></div> : null}{requests.length > 0 ? <div className="mt-8 space-y-4">{requests.map((request) => <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-3"><h2 className="text-lg font-semibold">{PLANS[request.plan_key]?.label || request.plan_key}</h2><PlanBadge plan={request.plan_key} /></div><p className="mt-2 text-sm text-slate-500">Creada el {new Date(request.created_at).toLocaleDateString('es-CL')}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">{request.status}</span></div><div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-3"><span>Entidad: <strong className="font-medium text-slate-900">{request.entity_type}</strong></span><span>Monto: <strong className="font-medium text-slate-900">${Number(request.amount || 0).toLocaleString('es-CL')} CLP</strong></span><span>Método: <strong className="font-medium text-slate-900">{request.payment_method}</strong></span></div></article>)}</div> : null}</div></main>;
}