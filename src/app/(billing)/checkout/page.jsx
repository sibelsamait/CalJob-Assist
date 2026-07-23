"use client";

import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { CheckoutSummary } from '@/components/billing/CheckoutSummary';
import { PLANS } from '@/lib/constants/plans';
import { useAuth } from '@/lib/AuthContext';

const ENTITY_TYPES = [
  { value: 'natural_person', label: 'Persona natural' },
  { value: 'private_company', label: 'Empresa privada' },
  { value: 'public_entity', label: 'Organismo público' },
];

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'No se pudo iniciar el checkout.';
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const planKey = searchParams.get('plan') || '';
  const [pageError, setPageError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { entityType: 'natural_person', rut: '', billingEmail: '', phone: '' },
  });
  const entityType = watch('entityType');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(`/billing/checkout?plan=${planKey}`)}`);
    }
  }, [authLoading, isAuthenticated, planKey, router]);

  useEffect(() => {
    if (user?.email) reset((current) => ({ ...current, billingEmail: user.email }));
  }, [reset, user?.email]);

  if (!PLANS[planKey]) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md text-center"><AlertTriangle className="mx-auto h-10 w-10 text-amber-600" /><h1 className="mt-4 text-2xl font-semibold text-slate-900">Plan no disponible</h1><p className="mt-2 text-slate-600">Selecciona un plan válido para continuar.</p><Button type="button" onClick={() => router.push('/billing/planes')} className="mt-6">Ver planes</Button></div>
      </main>
    );
  }

  if (authLoading || !isAuthenticated) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-slate-700" /></main>;
  }

  const onSubmit = async (values) => {
    setPageError('');
    setSubmitting(true);
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planKey,
          entityType: values.entityType,
          paymentMethod: 'pending',
          metadata: { rut: values.rut, billing_email: values.billingEmail, phone: values.phone },
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.paymentRequestId) throw new Error(result.error || 'No se pudo crear la solicitud de pago.');
      router.push(`/billing/pago?requestId=${encodeURIComponent(result.paymentRequestId)}`);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Button type="button" variant="ghost" onClick={() => router.push('/billing/planes')}><ArrowLeft className="h-4 w-4" />Volver a planes</Button>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Paso 1 de 2</p>
            <h1 className="mt-3 text-3xl font-semibold">Datos de facturación</h1>
            <p className="mt-2 text-slate-600">Completa los datos necesarios para preparar tu solicitud.</p>
            {pageError ? <div className="mt-6"><AlertBanner tone="error" title="No se pudo continuar" description={pageError} /></div> : null}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <div><label htmlFor="entityType" className="text-sm font-medium">Tipo de entidad</label><select id="entityType" {...register('entityType', { required: 'Selecciona un tipo de entidad.' })} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">{ENTITY_TYPES.map((entity) => <option key={entity.value} value={entity.value}>{entity.label}</option>)}</select></div>
              <div><label htmlFor="rut" className="text-sm font-medium">RUT</label><input id="rut" {...register('rut', { required: 'Ingresa el RUT.', minLength: { value: 8, message: 'Ingresa un RUT válido.' } })} placeholder="12.345.678-9" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />{errors.rut ? <p className="mt-1 text-sm text-red-700">{errors.rut.message}</p> : null}</div>
              <div><label htmlFor="billingEmail" className="text-sm font-medium">Correo de facturación</label><input id="billingEmail" type="email" {...register('billingEmail', { required: 'Ingresa un correo.', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Ingresa un correo válido.' } })} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />{errors.billingEmail ? <p className="mt-1 text-sm text-red-700">{errors.billingEmail.message}</p> : null}</div>
              <div><label htmlFor="phone" className="text-sm font-medium">Teléfono</label><input id="phone" type="tel" {...register('phone', { required: 'Ingresa un teléfono.' })} placeholder="+56 9 1234 5678" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />{errors.phone ? <p className="mt-1 text-sm text-red-700">{errors.phone.message}</p> : null}</div>
              <Button type="submit" disabled={submitting} className="w-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{submitting ? 'Preparando solicitud...' : 'Continuar al pago'}</Button>
            </form>
          </section>
          <CheckoutSummary planKey={planKey} entityLabel={ENTITY_TYPES.find((entity) => entity.value === entityType)?.label} />
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-slate-700" /></main>}><CheckoutContent /></Suspense>;
}