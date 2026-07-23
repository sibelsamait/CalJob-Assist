"use client";

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { ResultRow } from '@/components/calculadoras/ResultRow';

export function ResultCard({ title, value, subtitle, rows = [], tone = 'default' }) {
  const [expanded, setExpanded] = useState(true);
  const toneClasses = {
    default: 'border-slate-200 bg-white',
    success: 'border-emerald-200 bg-emerald-50/50',
    warning: 'border-amber-200 bg-amber-50/50',
    error: 'border-red-200 bg-red-50/50',
  };

  return (
    <section className={`rounded-2xl border p-6 shadow-sm ${toneClasses[tone] || toneClasses.default}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</h2>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {rows.length > 0 ? (
          <button type="button" onClick={() => setExpanded((current) => !current)} className="rounded-md p-2 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md" aria-expanded={expanded} aria-label={expanded ? 'Ocultar desglose' : 'Mostrar desglose'}>
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        ) : null}
      </div>
      {expanded && rows.length > 0 ? <div className="mt-5 border-t border-slate-200/70">{rows.map((row) => <ResultRow key={row.label} {...row} />)}</div> : null}
    </section>
  );
}

export default ResultCard;