import { NextResponse } from 'next/server';
import { buildBcnUrl, getBcnAuthHeaders } from '@/lib/leychile';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const headers = getBcnAuthHeaders();
  if (!headers) {
    return NextResponse.json({ error: 'BCN_LEYCHILE_API_KEY no está configurada' }, { status: 500 });
  }

  const path = Array.isArray(params?.path) ? params.path : [params?.path].filter(Boolean);
  const upstream = await fetch(buildBcnUrl(path, request.nextUrl.searchParams), {
    headers,
    cache: 'no-store',
  });

  const body = await upstream.arrayBuffer();
  const responseHeaders = new Headers();
  const contentType = upstream.headers.get('content-type');
  if (contentType) responseHeaders.set('content-type', contentType);

  return new Response(body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
