"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { ResultCard } from '@/components/calculadoras/ResultCard';
import { CalculatorShell } from '@/components/calculadoras/CalculatorShell';

const money = (value) => `$${Math.round(value).toLocaleString('es-CL')} CLP`;

export default function SalaryCalculatorPage() {
  const [form, setForm] = useState({ gross: '', nonTaxable: '', health: '7' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const calculate = (event) => { event.preventDefault(); const gross = Number(form.gross); const nonTaxable = Number(form.nonTaxable) || 0; const health = Number(form.health); if (!gross || gross <= 0 || health < 0 || health > 100) { setError('Ingresa un sueldo imponible válido y una cotización de salud entre 0 y 100%.'); setResult(null); return; } setError(''); const pension = gross * 0.1; const healthAmount = gross * (health / 100); const unemployment = gross * 0.006; const net = gross - pension - healthAmount - unemployment + nonTaxable; setResult({ net, pension, healthAmount, unemployment, nonTaxable }); };

  return <CalculatorShell title="Calculadora de sueldo" description="Estima el sueldo líquido a partir del imponible y descuentos legales."><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"><form onSubmit={calculate} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Sueldo imponible<input value={form.gross} onChange={update('gross')} type="number" min="1" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5" placeholder="850000" /></label><label className="text-sm font-medium text-slate-700">Haberes no imponibles<input value={form.nonTaxable} onChange={update('nonTaxable')} type="number" min="0" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5" placeholder="0" /></label></div><label className="mt-5 block text-sm font-medium text-slate-700">Cotización de salud<input value={form.health} onChange={update('health')} type="number" min="0" max="100" step="0.1" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>{error ? <div className="mt-5"><AlertBanner tone="error" title="Datos inválidos" description={error} /></div> : null}<Button type="submit" className="mt-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">Calcular sueldo líquido</Button></form>{result ? <ResultCard title="Sueldo líquido estimado" value={money(result.net)} subtitle="Estimación referencial" rows={[{ label: 'Sueldo imponible', value: money(Number(form.gross)) }, { label: 'AFP estimada', value: `- ${money(result.pension)}` }, { label: 'Salud', value: `- ${money(result.healthAmount)}` }, { label: 'Seguro de cesantía', value: `- ${money(result.unemployment)}` }, { label: 'Haberes no imponibles', value: `+ ${money(result.nonTaxable)}` }]} /> : <EmptyState title="Aún no hay un resultado" description="Completa los datos para estimar tu sueldo líquido." />}</div></CalculatorShell>;
}