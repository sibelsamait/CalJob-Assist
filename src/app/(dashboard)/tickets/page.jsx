"use client";

import { Loader2, MessageSquareMore } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { supabase, useAuth } from '@/lib/AuthContext';

const STATUS_LABELS = { open: 'Abierto', in_progress: 'En progreso', resolved: 'Resuelto', closed: 'Cerrado' };

export default function TicketsPage() {
  const { user, isLoading: authLoading } = useAuth(); const [tickets, setTickets] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { if (authLoading || !user) return; if (!supabase) { setError('No se pudo conectar con Supabase.'); setLoading(false); return; } supabase.from('tickets').select('id, subject, description, status, priority, resolution, created_at, updated_at').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data, error: queryError }) => { if (queryError) setError(queryError.message); setTickets(data || []); }).finally(() => setLoading(false)); }, [authLoading, user]);
  if (authLoading || loading) return <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-700" /></div>;
  return <div className="space-y-6"><PageHeader title="Mis tickets" description="Revisa el historial de solicitudes y respuestas de soporte." />{error ? <AlertBanner tone="error" title="No se pudieron cargar los tickets" description={error} /> : null}{!error && tickets.length === 0 ? <EmptyState title="No tienes tickets" description="Cuando contactes a soporte, tus solicitudes aparecerán aquí." actionLabel="Contactar soporte" href="/#contacto" /> : <div className="space-y-4">{tickets.map((ticket) => <article key={ticket.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><MessageSquareMore className="mt-1 h-5 w-5 text-blue-800" /><div><h2 className="font-semibold text-slate-900">{ticket.subject}</h2><p className="mt-1 text-xs text-slate-500">Creado el {new Date(ticket.created_at).toLocaleDateString('es-CL')}</p></div></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{STATUS_LABELS[ticket.status] || ticket.status}</span></div><p className="mt-5 text-sm leading-6 text-slate-600">{ticket.description}</p>{ticket.resolution ? <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900"><strong>Respuesta:</strong> {ticket.resolution}</div> : null}</article>)}</div>}</div>;
}