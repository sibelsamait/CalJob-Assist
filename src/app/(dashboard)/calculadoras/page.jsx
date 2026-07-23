"use client";

import Link from 'next/link';
import { ArrowRight, Banknote, CalendarDays, Clock3, FileCheck2, Gift, Scale, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

const CALCULATORS = [
  { href: '/calculadoras/sueldo', title: 'Sueldo líquido', description: 'Estima descuentos legales y monto líquido.', icon: Banknote },
  { href: '/calculadoras/finiquito', title: 'Finiquito', description: 'Calcula indemnizaciones y vacaciones proporcionales.', icon: FileCheck2 },
  { href: '/calculadoras/ipc', title: 'IPC', description: 'Calcula la variación entre dos índices.', icon: TrendingUp },
  { href: '/calculadoras/uf-utm', title: 'UF y UTM', description: 'Convierte montos con indicadores del día.', icon: Scale },
  { href: '/calculadoras/vacaciones', title: 'Vacaciones', description: 'Calcula días y compensación proporcional.', icon: CalendarDays },
  { href: '/calculadoras/gratificacion', title: 'Gratificación', description: 'Estima gratificación legal anual.', icon: Gift },
  { href: '/calculadoras/horas-extra', title: 'Horas extra', description: 'Calcula el valor de horas extraordinarias.', icon: Clock3 },
];

export default function CalculatorsPage() {
  return <div className="space-y-6"><PageHeader title="Calculadoras laborales" description="Herramientas para estimar tus principales operaciones laborales." /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{CALCULATORS.map((calculator) => { const Icon = calculator.icon; return <Link key={calculator.href} href={calculator.href} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-800"><Icon className="h-5 w-5" /></span><ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-1" /></div><h2 className="mt-5 text-lg font-semibold text-slate-900">{calculator.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{calculator.description}</p></Link>; })}</div></div>;
}