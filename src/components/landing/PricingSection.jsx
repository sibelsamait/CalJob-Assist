import { CheckCircle2 } from 'lucide-react';
import { COLORS } from '@/lib/constants/theme';

const features = [
  'Acceso inmediato al dashboard completo',
  'Calculadoras laborales, documentos y biblioteca',
  'Trámites, mediaciones, calendario y soporte',
];

export function PricingSection() {
  return (
    <section id="acceso" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Acceso</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">La plataforma completa ahora es gratuita</h2>
          <p className="mt-3 text-lg text-slate-600">Todas las personas registradas obtienen acceso total sin planes, cobros ni niveles bloqueados.</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: COLORS.success }} />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{feature}</h3>
                  <p className="mt-2 text-sm text-slate-600">Sin cobros, sin planes ocultos y sin páginas de checkout.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
