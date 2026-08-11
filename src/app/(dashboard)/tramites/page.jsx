"use client";

import { FileText, Scale, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';

const TRAMITES = [
  { title: 'Liquidación de sueldo', description: 'Revisa estados y movimientos salariales.', href: '/calculadoras/sueldo', icon: FileText },
  { title: 'Finiquito', description: 'Consulta respaldo y cálculo de indemnización.', href: '/calculadoras/finiquito', icon: Scale },
  { title: 'Documentos legales', description: 'Accede a documentos y referencias para tus procesos.', href: '/documentos', icon: ShieldCheck },
];

export default function TramitesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Trámites" description="Centraliza tus procesos, documentos y cálculos legales más comunes." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TRAMITES.map(({ title, description, href, icon: Icon }) => (
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
