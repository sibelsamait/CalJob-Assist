import { PlanCard } from '@/components/billing/PlanCard';

export const metadata = {
  title: 'Planes | CalJob Assist',
};

export default function PlansPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Planes CalJob Assist</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Elige el nivel de apoyo para tu operación</h1>
          <p className="mt-4 text-lg text-slate-600">Contrata una suscripción y gestiona tus procesos laborales desde un solo lugar.</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <PlanCard planKey="personal" />
          <PlanCard planKey="team" highlighted />
          <PlanCard planKey="enterprise" />
        </div>
      </div>
    </main>
  );
}