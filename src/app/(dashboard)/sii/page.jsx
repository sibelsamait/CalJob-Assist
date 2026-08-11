"use client";

import { FileText, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';

const GUIDES = [
  { title: 'Guías SII', description: 'Consulta contenido cronológico y referencias para tu gestión tributaria.', href: '/biblioteca', icon: FileText },
  { title: 'Biblioteca legal', description: 'Busca normas y artículos legales que respalden tu gestión.', href: '/biblioteca', icon: BookOpen },
];

export default function SiiPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Guías SII" description="Accede a orientación útil para procedimientos tributarios y documentación del SII." />

      <div className="grid gap-4 md:grid-cols-2">
        {GUIDES.map(({ title, description, href, icon: Icon }) => (
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
