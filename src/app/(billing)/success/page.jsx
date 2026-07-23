"use client";

import { Suspense, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { PLANS } from '@/lib/constants/plans';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(Boolean(requestId));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!requestId) return;
    fetch(`/api/payments/requests/${encodeURIComponent(requestId)}`)
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error || 'No se pudo consultar el pago.'); return result.request; })
      .then(setRequest)
      .catch((fetchError) => setError(fetchError.message || 'No se pudo consultar el pago.'))
      .finally(() => setLoading(false));
  }, [requestId]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-slate-700" /></main>;
  if (error) return <main className="min-h-screen bg-slate-50 px-6 py-16"><div className="mx-auto max-w-xl"><AlertBanner tone="error" title="No se pudo confirmar la solicitud" description={error} /><Button type="button" onClick={() => router.push('/dashboard')} className="mt-6">Ir al dashboard</Button></div></main>;

  const pending = !request || !['paid', 'completed', 'authorized'].includes(request.status);
  const planLabel = request && PLANS[request.plan_key]?.label;
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16 text-slate-900"><section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">{pending ? <Clock3 className="h-7 w-7 text-amber-700" /> : <CheckCircle2 className="h-7 w-7 text-emerald-700" />}</div><h1 className="mt-5 text-3xl font-semibold">{pending ? 'Solicitud recibida' : 'Pago confirmado'}</h1><p className="mt-3 text-slate-600">{pending ? `Tu solicitud${planLabel ? ` para el plan ${planLabel}` : ''} quedó registrada y será revisada por nuestro equipo.` : 'Tu suscripción fue procesada correctamente.'}</p>{requestId ? <p className="mt-4 text-xs text-slate-500">Solicitud: {requestId}</p> : null}<Button type="button" onClick={() => router.push('/dashboard')} className="mt-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">Ir al dashboard</Button></section></main>;
}

export default function SuccessPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-slate-700" /></main>}><SuccessContent /></Suspense>;
}