import { NextResponse } from 'next/server';
import { fetchBcnEndpoint, normalizeBcnSearchResults } from '@/lib/leychile';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('query') || url.searchParams.get('q') || url.searchParams.get('texto') || '';
  const cantidad = url.searchParams.get('cantidad') || '10';

  if (!query.trim()) {
    return NextResponse.json({ error: 'query es obligatorio' }, { status: 400 });
  }

  try {
    const result = await fetchBcnEndpoint(['servicio', '61'], {
      query,
      q: query,
      texto: query,
      cantidad,
    });

    const items = result.body.kind === 'json' ? normalizeBcnSearchResults(result.body.data) : [];

    return NextResponse.json({
      query,
      cantidad: Number(cantidad) || 10,
      items,
      raw: result.body.kind === 'json' ? result.body.data : result.body.data,
      sourceUrl: result.url,
    });
  } catch (error) {
    const cause = error?.cause?.body?.data;
    return NextResponse.json(
      {
        error: error.message || 'No se pudo consultar BCN',
        details: cause || null,
      },
      { status: 502 },
    );
  }
}
