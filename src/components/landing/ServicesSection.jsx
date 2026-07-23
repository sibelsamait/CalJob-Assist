import { Calculator, CalendarClock, BookOpen, FileText, ShieldCheck, TrendingUp } from 'lucide-react';
import { COLORS } from '@/lib/constants/theme';

const services = [
  { icon: Calculator, title: 'Cálculos laborales', description: 'Automatiza sueldo, finiquito, vacaciones y horas extra con reglas claras.' },
  { icon: CalendarClock, title: 'Seguimiento de pagos', description: 'Controla suscripciones, renovaciones y estados de cobro en un solo lugar.' },
  { icon: TrendingUp, title: 'Indicadores y métricas', description: 'Monitorea desempeño y mantén visibilidad del negocio.' },
  { icon: BookOpen, title: 'Biblioteca legal', description: 'Accede a contenidos y normas relevantes para tus procesos.' },
  { icon: FileText, title: 'Documentos y tickets', description: 'Genera archivos y gestiona soporte sin dispersar la información.' },
  { icon: ShieldCheck, title: 'Seguridad y permisos', description: 'Define roles con control de acceso y trazabilidad.' },
];

export function ServicesSection() {
  return (
    <section id="servicios" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Servicios</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Todo lo que necesitas para operar con orden</h2>
          <p className="mt-3 text-lg text-slate-600">Una propuesta más simple, moderna y escalable para equipos y clientes.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${COLORS.primary}14`, color: COLORS.primary }}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
