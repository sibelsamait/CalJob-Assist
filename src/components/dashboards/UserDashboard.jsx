import { PageHeader } from '@/components/layout/PageHeader';
import { Calculator, BookOpen, ScrollText, Ticket } from 'lucide-react';

export default function UserDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bienvenido a CalJob Assist" description="Tu punto de inicio para usar la plataforma completa sin restricciones de pago." />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Calculadoras básicas</h2>
          <p className="mt-3 text-slate-600">Usa sueldo líquido, IPC, UF/UTM y más sin guardar resultados.</p>
          <div className="mt-6 grid gap-3 text-sm text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-4 flex items-center gap-3"><Calculator className="h-4 w-4" /> Sueldo líquido</div>
            <div className="rounded-2xl bg-slate-50 p-4 flex items-center gap-3"><BookOpen className="h-4 w-4" /> IPC y UF/UTM</div>
            <div className="rounded-2xl bg-slate-50 p-4 flex items-center gap-3"><Ticket className="h-4 w-4" /> Indicadores laborales</div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Tu acceso</h2>
          <p className="mt-3 text-slate-600">Tienes acceso completo a la plataforma sin restricciones de pago.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">¿Qué puedes hacer?</h2>
          <p className="mt-3 text-slate-600">Puedes usar calculadoras, biblioteca, documentos, tickets y el resto de funciones disponibles.</p>
          <ul className="mt-5 space-y-2 text-sm text-slate-700">
            <li>- Calculadoras, biblioteca y documentos</li>
            <li>- Trámites, mediaciones y calendario</li>
            <li>- Soporte y configuración personal</li>
          </ul>
      </div>
    </div>
  );
}
