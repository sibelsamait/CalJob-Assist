import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function EmptyState({ title, description, actionLabel, href = '/' }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div className="mb-4 rounded-full bg-white p-3 shadow-sm">
        <Inbox className="h-6 w-6 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-600">{description}</p>
      {actionLabel ? (
        <Link href={href}>
          <Button className="mt-4">{actionLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}

export default EmptyState;
