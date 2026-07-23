"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { CheckoutSummary } from '@/components/billing/CheckoutSummary';
import { PaymentMethodSelector, getPaymentMethods } from '@/components/billing/PaymentMethodSelector';
import { PLANS } from '@/lib/constants/plans';

const ENTITY_LABELS = { natural_person: 'Persona natural', private_company: 'Empresa privada', public_entity: 'Organismo público' };

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');
  const [request, setRequest] = useState(null);
  const [method, setMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!requestId) { setLoading(false); return; }
    fetch(`/api/payments/requests/${encodeURIComponent(requestId)}`)
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error || 'No se encontró la solicitud.'); return result.request; })
      .then((data) => { setRequest(data); setMethod(getPaymentMethods(data.entity_type)[0]?.key || ''); })
      .catch((fetchError) => setError(fetchError.message || 'No se pudo cargar la solicitud.'))
      .finally(() => setLoading(false));
  }, [requestId]);

  const selectedMethod = useMemo(() => getPaymentMethods(request?.entity_type).find((item) => item.key === method), [method, request?.entity_type]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-slate-700" /></main>;
  if (error || !request || !PLANS[request.plan_key]) return <main className="min-h-screen bg-slate-50 px-6 py-16"><div className="mx-auto max-w-xl"><AlertBanner tone="error" title="Solicitud no disponible" description={error || 'La solicitud de pago no existe.'} /><Button type="button" onClick={() => router.push('/billing/planes')} className="mt-6">Volver a planes</Button></div></main>;

  const handleContinue = async () => {
    setSubmitting(true); setError('');
    try {
      const response = await fetch(`/api/payments/requests/${encodeURIComponent(request.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentMethod: method }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo guardar el método de pago.');
      if (['webpay_plus', 'mercado_pago', 'flow', 'khipu', 'paypal'].includes(method)) {
        window.location.href = `/api/payments/checkout/session?requestId=${encodeURIComponent(request.id)}`;
        return;
      }
      router.push(`/billing/success?requestId=${encodeURIComponent(request.id)}&status=pending`);
    } catch (submitError) { setError(submitError.message || 'No se pudo iniciar el pago.'); setSubmitting(false); }
  };

  return <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900"><div className="mx-auto max-w-6xl"><Button type="button" variant="ghost" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" />Volver</Button><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Paso 2 de 2</p><h1 className="mt-3 text-3xl font-semibold">Elige cómo pagar</h1><p className="mt-2 text-slate-600">Serás enviado al proveedor seguro cuando corresponda.</p>{error ? <div className="mt-6"><AlertBanner tone="error" title="No se pudo continuar" description={error} /></div> : null}<div className="mt-8"><PaymentMethodSelector entityType={request.entity_type} value={method} onChange={setMethod} /></div><Button type="button" disabled={!method || submitting} onClick={handleContinue} className="mt-8 w-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{submitting ? 'Conectando con el proveedor...' : `Continuar con ${selectedMethod?.label || 'el pago'}`}</Button></section><CheckoutSummary planKey={request.plan_key} entityLabel={ENTITY_LABELS[request.entity_type]} paymentLabel={selectedMethod?.label} /></div></div></main>;
}

export default function PaymentPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-slate-700" /></main>}><PaymentContent /></Suspense>;
}