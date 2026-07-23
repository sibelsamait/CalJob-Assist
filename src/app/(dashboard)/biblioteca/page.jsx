"use client";

import Link from 'next/link';
import { BookOpen, ArrowRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { LEGAL_LIBRARY } from '@/lib/constants/legalLibrary';

export default function LibraryPage() {
  const permissions = usePermissions(); const [query, setQuery] = useState('');
  const results = useMemo(() => LEGAL_LIBRARY.filter((item) => `${item.title} ${item.category} ${item.summary} ${item.content}`.toLowerCase().includes(query.toLowerCase())), [query]);
  if (!permissions.canViewLibrary) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900"><h1 className="font-semibold">Biblioteca no disponible</h1><p className="mt-2 text-sm">Tu plan actual no habilita el acceso a la biblioteca legal.</p></div>;
  return <div className="space-y-6"><PageHeader title="Biblioteca legal" description="Busca normas y referencias laborales para apoyar tus decisiones." /><div className="relative"><Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por título, categoría o contenido" className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm shadow-sm" /></div>{results.length === 0 ? <EmptyState title="No encontramos normas" description="Prueba con otra palabra clave." /> : <div className="grid gap-4 md:grid-cols-2">{results.map((item) => <Link key={item.id} href={`/biblioteca/${item.id}`} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-800"><BookOpen className="h-5 w-5" /></span><ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-1" /></div><p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.category}</p><h2 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p></Link>)}</div>}</div>;
}