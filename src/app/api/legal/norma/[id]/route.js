import { NextResponse } from 'next/server';
import { fetchBcnEndpoint, normalizeBcnNorma } from '@/lib/leychile';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const idNorma = params?.id;
  const url = new URL(request.url);
  const idParte = url.searchParams.get('idParte') || url.searchParams.get('parte') || '';

  if (!idNorma) {
    return NextResponse.json({ error: 'id es obligatorio' }, { status: 400 });
  }

  try {
    const result = await fetchBcnEndpoint(
      ['servicio', '7.2'],
      {
        idNorma,
        idParte,
      },
      { fallbackPaths: [['servicio', '7']] },
    );

    const norma = normalizeBcnNorma(result.body.kind === 'json' ? result.body.data : result.body.data);

    return NextResponse.json({
      idNorma,
      idParte: idParte || null,
      norma,
      raw: result.body.data,
      sourceUrl: result.url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || 'No se pudo consultar la norma',
        details: error?.cause?.body?.data || null,
      },
      { status: 502 },
    );
  }
}
