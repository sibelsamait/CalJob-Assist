import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

function buildFavoriteKey(articleId, partId) {
  return `${String(articleId || '').trim()}:${String(partId || '').trim()}`;
}

async function getUserAndDb() {
  const authClient = createRouteHandlerClient({ cookies });
  const { data: { user }, error: authError } = await authClient.auth.getUser();

  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const db = getSupabaseServer();
  if (!db) {
    return { error: NextResponse.json({ error: 'Supabase server not ready' }, { status: 500 }) };
  }

  return { user, db };
}

export async function GET() {
  const context = await getUserAndDb();
  if (context.error) return context.error;

  const { user, db } = context;
  const { data, error } = await db
    .from('legal_favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ favorites: data || [] });
}

export async function POST(request) {
  const context = await getUserAndDb();
  if (context.error) return context.error;

  const { user, db } = context;
  const body = await request.json();
  const articleId = String(body.articleId || body.idNorma || '').trim();
  const partId = String(body.partId || body.idParte || '').trim();

  if (!articleId) {
    return NextResponse.json({ error: 'articleId es obligatorio' }, { status: 400 });
  }

  const favorite = {
    user_id: user.id,
    favorite_key: buildFavoriteKey(articleId, partId),
    article_id: articleId,
    part_id: partId || null,
    title: body.title || null,
    law_title: body.lawTitle || null,
    category: body.category || null,
    summary: body.summary || null,
    content: body.content || null,
    source_path: body.sourcePath || null,
    metadata: body.metadata || {},
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await db
    .from('legal_favorites')
    .upsert([favorite], { onConflict: 'user_id,favorite_key' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ favorite: data });
}

export async function DELETE(request) {
  const context = await getUserAndDb();
  if (context.error) return context.error;

  const { user, db } = context;
  const url = new URL(request.url);
  const articleId = url.searchParams.get('articleId') || '';
  const partId = url.searchParams.get('partId') || '';

  if (!articleId) {
    return NextResponse.json({ error: 'articleId es obligatorio' }, { status: 400 });
  }

  const favoriteKey = buildFavoriteKey(articleId, partId);
  const { error } = await db
    .from('legal_favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('favorite_key', favoriteKey);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'deleted' });
}
