import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PageHeader({ title, description, actionLabel, href, action }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      {actionLabel && href ? (
        <Link href={href}>
          <Button className="gap-2">
            {actionLabel}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      ) : action ? (
        <div>{action}</div>
      ) : null}
    </div>
  );
}

export default PageHeader;
