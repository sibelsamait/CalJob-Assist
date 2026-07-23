"use client";

import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { LEGAL_LIBRARY } from '@/lib/constants/legalLibrary';

export default function LegalDetailPage() {
  const { id } = useParams(); const permissions = usePermissions(); const item = LEGAL_LIBRARY.find((entry) => entry.id === id);
  if (!permissions.canViewLibrary) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900"><h1 className="font-semibold">Sin permisos</h1><p className="mt-2 text-sm">Tu plan actual no habilita la biblioteca legal.</p></div>;
  if (!item) return <EmptyState title="Norma no encontrada" description="La referencia solicitada no existe en la biblioteca." actionLabel="Volver a biblioteca" href="/biblioteca" />;
  return <div className="space-y-6"><Link href="/biblioteca" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"><ArrowLeft className="h-4 w-4" />Volver a biblioteca</Link><PageHeader title={item.title} description={`${item.category} · Actualizada el ${item.updatedAt}`} /><article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><BookOpen className="h-6 w-6 text-blue-800" /><p className="text-sm font-semibold text-slate-700">Referencia de consulta</p></div><p className="mt-6 text-base leading-8 text-slate-700">{item.content}</p><p className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">Esta ficha es informativa y no reemplaza la revisión de la norma oficial vigente.</p></article></div>;
}