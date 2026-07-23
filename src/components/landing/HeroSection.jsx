import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/theme';

export function HeroSection({ isAuthenticated, onSelectPlan }) {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
            <Sparkles className="h-4 w-4" />
            Operación legal y laboral, ordenada
          </div>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Gestiona trámites, calculadoras y suscripciones desde un solo punto de entrada.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            CalJob Assist centraliza tus procesos, pagos y soporte para que cada equipo trabaje con claridad y menos fricción.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => onSelectPlan('personal')} className="bg-white text-slate-900 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              Comenzar ahora
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Link href={isAuthenticated ? '/dashboard' : '/login'}>
              <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                {isAuthenticated ? 'Ir al panel' : 'Iniciar sesión'}
              </Button>
            </Link>
          </div>
        </div>

        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
          <div className="rounded-2xl bg-white p-5 text-slate-900">
            <div className="flex items-center gap-3">
              <Image src="/images/black.png" alt="CalJob Assist" width={48} height={48} priority />
              <div>
                <p className="text-sm font-semibold">CalJob Assist</p>
                <p className="text-sm text-slate-500">Tu operación con más control</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Valor de la propuesta</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-semibold text-slate-900">+40%</span>
                <span className="text-sm text-emerald-600">menos tiempo manual</span>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-3 text-sm">
                <p className="font-semibold text-slate-900">Cálculos</p>
                <p className="mt-1 text-slate-500">Sueldo, finiquito, vacaciones y más.</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 text-sm">
                <p className="font-semibold text-slate-900">Soporte</p>
                <p className="mt-1 text-slate-500">Tickets y mediaciones centralizadas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
