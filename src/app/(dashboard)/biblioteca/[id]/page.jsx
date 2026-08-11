"use client";

import Link from 'next/link';
import { ArrowLeft, BookOpen, Loader2, Star } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { LEGAL_LIBRARY } from '@/lib/constants/legalLibrary';
import { useAuth } from '@/lib/AuthContext';

function TreeNode({ node, level = 0 }) {
  if (!node) return null;

  return (
    <div className={level === 0 ? 'space-y-3' : 'pl-4 border-l border-slate-200 space-y-3'}>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">{node.title}</p>
        {node.number ? <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{node.number}</p> : null}
        {node.text ? <p className="mt-2 text-sm leading-6 text-slate-600">{node.text}</p> : null}
      </div>
      {Array.isArray(node.children) ? node.children.map((child) => <TreeNode key={child.id || child.title} node={child} level={level + 1} />) : null}
    </div>
  );
}

export default function LegalDetailPage() {
  const { id } = useParams();
  const permissions = usePermissions();
  const { isAuthenticated } = useAuth();
  const localFallback = LEGAL_LIBRARY.find((entry) => entry.id === id);
  const [detail, setDetail] = useState(null);
  const [tree, setTree] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const articleId = detail?.idNorma || id;
  const favoriteKey = `${articleId || ''}:`;
  const isFavorite = useMemo(() => favorites.some((favorite) => favorite.favorite_key === favoriteKey), [favorites, favoriteKey]);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetch('/api/legal/favorites')
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No se pudieron cargar los favoritos.');
        return payload.favorites || [];
      })
      .then(setFavorites)
      .catch(() => undefined);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!permissions.canViewLibrary) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    Promise.all([
      fetch(`/api/legal/norma/${encodeURIComponent(id)}`).then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No se pudo cargar la norma.');
        return payload;
      }),
      fetch(`/api/legal/tree/${encodeURIComponent(id)}`).then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No se pudo cargar el árbol.');
        return payload;
      }),
    ])
      .then(([normaPayload, treePayload]) => {
        if (cancelled) return;
        setDetail(normaPayload.norma || null);
        setTree(treePayload.tree || []);
      })
      .catch((fetchError) => {
        if (cancelled) return;
        if (localFallback) {
          setDetail({
            idNorma: localFallback.id,
            title: localFallback.title,
            category: localFallback.category,
            summary: localFallback.summary,
            content: localFallback.content,
            updatedAt: localFallback.updatedAt,
            tree: [],
            raw: localFallback,
          });
          setTree([]);
        } else {
          setError(fetchError.message || 'No se pudo cargar la norma.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, localFallback, permissions.canViewLibrary]);

  const toggleFavorite = async () => {
    if (!detail) return;

    setSaving(true);
    try {
      if (isFavorite) {
        const response = await fetch(`/api/legal/favorites?articleId=${encodeURIComponent(articleId)}&partId=`, { method: 'DELETE' });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No se pudo quitar de favoritos.');
        setFavorites((current) => current.filter((favorite) => favorite.favorite_key !== favoriteKey));
      } else {
        const response = await fetch('/api/legal/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articleId,
            title: detail.title,
            lawTitle: detail.title,
            category: detail.category,
            summary: detail.summary,
            content: detail.content,
            sourcePath: `/biblioteca/${encodeURIComponent(articleId)}`,
            metadata: { source: 'bcn', raw: detail.raw },
          }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No se pudo guardar el favorito.');
        setFavorites((current) => [payload.favorite, ...current.filter((favorite) => favorite.favorite_key !== favoriteKey)]);
      }
    } catch (favoriteError) {
      setError(favoriteError.message || 'No se pudo actualizar el favorito.');
    } finally {
      setSaving(false);
    }
  };

  if (!permissions.canViewLibrary) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900"><h1 className="font-semibold">Sin acceso</h1><p className="mt-2 text-sm">Tu cuenta no tiene habilitada la biblioteca legal.</p></div>;
  }

  if (loading) {
    return <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-700" /></div>;
  }

  if (error && !detail) {
    return <AlertBanner tone="error" title="No se pudo cargar la norma" description={error} />;
  }

  if (!detail && !localFallback) {
    return <EmptyState title="Norma no encontrada" description="La referencia solicitada no existe en la biblioteca oficial." actionLabel="Volver a biblioteca" href="/biblioteca" />;
  }

  return (
    <div className="space-y-6">
      <Link href="/biblioteca" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <ArrowLeft className="h-4 w-4" />Volver a biblioteca
      </Link>

      <PageHeader
        title={detail?.title || localFallback?.title || 'Norma oficial'}
        description={`${detail?.category || localFallback?.category || 'Norma'}${detail?.updatedAt ? ` · Actualizada el ${detail.updatedAt}` : ''}`}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-800" />
              <p className="text-sm font-semibold text-slate-700">Referencia oficial BCN</p>
            </div>
            <Button type="button" variant={isFavorite ? 'secondary' : 'outline'} onClick={toggleFavorite} disabled={saving}>
              <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              {saving ? 'Guardando...' : isFavorite ? 'Quitar favorito' : 'Guardar favorito'}
            </Button>
          </div>

          {detail?.summary || localFallback?.summary ? <p className="mt-6 text-sm leading-6 text-slate-600">{detail?.summary || localFallback?.summary}</p> : null}

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contenido</p>
            <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-slate-700">{detail?.content || localFallback?.content || 'No hay contenido disponible.'}</p>
          </div>

          <p className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">Esta ficha se obtiene desde BCN y se puede guardar como referencia para redactar documentos dentro de la app.</p>
        </article>

        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Navegación por artículos</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Estructura de la norma</h2>
          </div>

          {Array.isArray(tree) && tree.length > 0 ? (
            <div className="space-y-3">
              {tree.map((node) => <TreeNode key={node.id || node.title} node={node} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              No fue posible obtener el árbol jerárquico desde BCN.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}