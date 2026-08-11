"use client";

import { Scale, BriefcaseBusiness, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';

const MEDIACIONES = [
  { title: 'Mediación laboral', description: 'Consulta procesos y documentación para negociación.', href: '/biblioteca', icon: Scale },
  { title: 'Revisión legal', description: 'Revisa referencias y documentos relevantes para tus casos.', href: '/documentos', icon: BriefcaseBusiness },
];

export default function MediacionesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Mediaciones" description="Consulta referencias y documentos para resolver disputas y revisiones legales." />

      <div className="grid gap-4 md:grid-cols-2">
        {MEDIACIONES.map(({ title, description, href, icon: Icon }) => (
          <Link key={title} href={href} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                <Icon className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
