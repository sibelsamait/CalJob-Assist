export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

const SOURCES = {
  uf: 'https://mindicador.cl/api/uf',
  utm: 'https://mindicador.cl/api/utm',
  imm: 'https://mindicador.cl/api/imm',
  ipc: 'https://mindicador.cl/api/ipc',
};

export async function GET() {
  try {
    const entries = await Promise.all(Object.entries(SOURCES).map(async ([key, url]) => {
      const response = await fetch(url, { next: { revalidate: 3600 } });
      if (!response.ok) throw new Error(`No se pudo cargar ${key}`);
      const payload = await response.json();
      return [key, payload?.serie?.[0]?.valor ?? null];
    }));

    return NextResponse.json({ ...Object.fromEntries(entries), date: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Indicadores no disponibles' }, { status: 503 });
  }
}