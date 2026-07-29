"use client";

import { PageHeader } from '@/components/layout/PageHeader';

const tickets = [
  { id: 'TCK-001', subject: 'Error al exportar finiquito', status: 'Abierto', company: 'Constructora Silva SpA' },
  { id: 'TCK-002', subject: 'Solicitud de factura julio', status: 'En progreso', company: 'Estudio Jurídico Morales' },
  { id: 'TCK-003', subject: 'Revisión del cálculo de vacaciones', status: 'Cerrado', company: 'Transporte Andino Ltda.' },
];

export default function AdminTicketsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets de soporte"
        description="Visualiza y administra los tickets generados por empresas y clientes."
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Accede a los tickets recientes y filtra por estado para priorizar la atención.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Asunto</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-t border-slate-100">
                <td className="px-4 py-4 font-medium text-slate-900">{ticket.id}</td>
                <td className="px-4 py-4">{ticket.subject}</td>
                <td className="px-4 py-4">{ticket.company}</td>
                <td className="px-4 py-4">{ticket.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
