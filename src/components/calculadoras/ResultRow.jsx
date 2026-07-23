export function ResultRow({ label, value, note }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <div>
        <p className="text-sm text-slate-600">{label}</p>
        {note ? <p className="mt-1 text-xs text-slate-400">{note}</p> : null}
      </div>
      <p className="text-right text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default ResultRow;