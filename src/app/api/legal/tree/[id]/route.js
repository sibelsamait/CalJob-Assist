import { NextResponse } from 'next/server';
import { fetchBcnEndpoint, normalizeBcnNorma } from '@/lib/leychile';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const idNorma = params?.id;

  if (!idNorma) {
    return NextResponse.json({ error: 'id es obligatorio' }, { status: 400 });
  }

  try {
    const result = await fetchBcnEndpoint(['servicio', '9'], { idNorma });
    const norma = normalizeBcnNorma(result.body.kind === 'json' ? result.body.data : result.body.data);

    return NextResponse.json({
      idNorma,
      tree: norma.tree,
      raw: result.body.data,
      sourceUrl: result.url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || 'No se pudo consultar el árbol de la norma',
        details: error?.cause?.body?.data || null,
      },
      { status: 502 },
    );
  }
}
