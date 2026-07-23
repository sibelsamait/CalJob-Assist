"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { ResultCard } from '@/components/calculadoras/ResultCard';
import { CalculatorShell } from '@/components/calculadoras/CalculatorShell';

export default function IpcCalculatorPage() {
  const [values, setValues] = useState({ previous: '', current: '' }); const [result, setResult] = useState(null); const [error, setError] = useState('');
  const calculate = (event) => { event.preventDefault(); const previous = Number(values.previous); const current = Number(values.current); if (previous <= 0 || current <= 0) { setError('Ambos índices deben ser mayores que cero.'); setResult(null); return; } setError(''); setResult(((current - previous) / previous) * 100); };
  return <CalculatorShell title="Calculadora IPC" description="Calcula la variación porcentual entre dos índices de precios."><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"><form onSubmit={calculate} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="grid gap-5 sm:grid-cols-2">{['previous', 'current'].map((field) => <label key={field} className="text-sm font-medium text-slate-700">{field === 'previous' ? 'Índice anterior' : 'Índice actual'}<input value={values[field]} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} type="number" step="0.01" min="0" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>)}</div>{error ? <div className="mt-5"><AlertBanner tone="error" title="Datos inválidos" description={error} /></div> : null}<Button type="submit" className="mt-6">Calcular variación</Button></form>{result !== null ? <ResultCard title="Variación IPC" value={`${result.toFixed(2)}%`} subtitle={result >= 0 ? 'Variación positiva' : 'Variación negativa'} rows={[{ label: 'Índice anterior', value: values.previous }, { label: 'Índice actual', value: values.current }]} /> : <EmptyState title="Aún no hay un resultado" description="Ingresa dos índices para calcular su variación." />}</div></CalculatorShell>;
}