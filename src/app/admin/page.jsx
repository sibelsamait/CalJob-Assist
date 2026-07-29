"use client";

import Link from 'next/link';
import { ShieldCheck, Users, Building2, Ticket, FileText, Settings2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

const ADMIN_SECTIONS = [
  {
    title: 'Usuarios',
    description: 'Gestiona cuentas, roles y accesos de todo el personal y los clientes.',
    href: '/admin/usuarios',
    icon: Users,
  },
  {
    title: 'Empresas',
    description: 'Revisa empresas registradas, planes y estados de suscripción.',
    href: '/admin/empresas',
    icon: Building2,
  },
  {
    title: 'Tickets',
    description: 'Atiende solicitudes de soporte y mantiene el seguimiento de casos abiertos.',
    href: '/admin/tickets',
    icon: Ticket,
  },
  {
    title: 'Auditoría',
    description: 'Consulta eventos de seguridad, cambios administrativos y accesos importantes.',
    href: '/admin/audit',
    icon: FileText,
  },
  {
    title: 'Configuración',
    description: 'Ajusta la configuración global de CalJob Assist y los parámetros de SaaS.',
    href: '/admin/config',
    icon: Settings2,
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel admin"
        description="Accede a las herramientas de gestión y soporte para administradores y técnicos."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ADMIN_SECTIONS.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex items-center gap-3 text-primary">
              <section.icon className="h-5 w-5" />
              <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{section.description}</p>
            <span className="mt-6 inline-flex items-center text-sm font-medium text-primary transition group-hover:underline">
              Ir a {section.title}
            </span>
          </Link>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700">
        <p className="text-sm leading-6">
          Nota: el panel admin es el inicio del módulo administrativo. Las secciones de Usuarios, Empresas, Tickets, Auditoría y Configuración se han creado como rutas independientes.
        </p>
      </div>
    </div>
  );
}
