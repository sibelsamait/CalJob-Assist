"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Loader2, Search, Star } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useAuth } from '@/lib/AuthContext';

function buildFavoriteKey(item) {
  return `${item.idNorma || item.id || ''}:${item.idParte || ''}`;
}

export default function LibraryPage() {
  const permissions = usePermissions();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState('Código del Trabajo');
  const [submittedQuery, setSubmittedQuery] = useState('Código del Trabajo');
  const [results, setResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [error, setError] = useState('');

  const favoriteKeys = useMemo(() => new Set(favorites.map((item) => item.favorite_key)), [favorites]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingFavorites(false);
      return;
    }

    fetch('/api/legal/favorites')
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No se pudieron cargar los favoritos.');
        return payload.favorites || [];
      })
      .then(setFavorites)
      .catch((fetchError) => setError(fetchError.message || 'No se pudieron cargar los favoritos.'))
      .finally(() => setLoadingFavorites(false));
  }, [isAuthenticated]);

  const runSearch = async (event) => {
    event.preventDefault();
    const text = query.trim();
    if (!text) return;

    setError('');
    setLoadingSearch(true);
    setSubmittedQuery(text);

    try {
      const response = await fetch(`/api/legal/search?query=${encodeURIComponent(text)}&cantidad=12`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'No se pudo consultar BCN.');
      setResults(payload.items || []);
    } catch (fetchError) {
      setResults([]);
      setError(fetchError.message || 'No se pudo consultar BCN.');
    } finally {
      setLoadingSearch(false);
    }
  };

  const toggleFavorite = async (item) => {
    const articleId = item.idNorma || item.id;
    const partId = item.idParte || '';
    if (!articleId) return;

    const key = buildFavoriteKey(item);
    setSavingKey(key);
    setError('');

    try {
      if (favoriteKeys.has(key)) {
        const response = await fetch(`/api/legal/favorites?articleId=${encodeURIComponent(articleId)}&partId=${encodeURIComponent(partId)}`, { method: 'DELETE' });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No se pudo quitar de favoritos.');
        setFavorites((current) => current.filter((favorite) => favorite.favorite_key !== key));
      } else {
        const response = await fetch('/api/legal/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articleId,
            partId,
            title: item.title,
            lawTitle: item.title,
            category: item.category,
            summary: item.summary,
            content: item.summary,
            sourcePath: item.url || null,
            metadata: { source: 'bcn', raw: item.raw, query: submittedQuery },
          }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No se pudo guardar el favorito.');
        setFavorites((current) => [payload.favorite, ...current.filter((favorite) => favorite.favorite_key !== key)]);
      }
    } catch (favoriteError) {
      setError(favoriteError.message || 'No se pudo actualizar el favorito.');
    } finally {
      setSavingKey('');
    }
  };

  if (!permissions.canViewLibrary) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
        <h1 className="font-semibold">Biblioteca no disponible</h1>
        <p className="mt-2 text-sm">Tu cuenta no tiene acceso a la biblioteca legal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Biblioteca legal BCN" description="Busca normas oficiales, navega por artículos y guarda favoritos para usar luego como referencia en documentos." />

      <form onSubmit={runSearch} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por norma, artículo o tema"
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm shadow-sm"
          />
        </div>
        <Button type="submit" disabled={loadingSearch} className="w-full sm:w-auto">
          {loadingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loadingSearch ? 'Buscando...' : 'Buscar en BCN'}
        </Button>
      </form>

      {error ? <AlertBanner tone="error" title="No se pudo completar la operación" description={error} /> : null}

      {loadingFavorites ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando favoritos...
        </div>
      ) : null}

      {results.length === 0 ? (
        <EmptyState title="Sin resultados todavía" description="Busca una norma oficial de BCN para empezar." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((item) => {
            const articleId = item.idNorma || item.id;
            const key = buildFavoriteKey(item);
            const isFavorite = favoriteKeys.has(key);

            return (
              <article key={key} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => toggleFavorite(item)} disabled={savingKey === key}>
                      <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      {isFavorite ? 'Guardado' : 'Guardar'}
                    </Button>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>

                <Link href={`/biblioteca/${encodeURIComponent(articleId)}`} className="mt-5 block">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.category}</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary || 'Sin resumen disponible.'}</p>
                </Link>
              </article>
            );
          })}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Favoritos</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Artículos guardados para referencia</h2>
          </div>
          <p className="text-sm text-slate-500">Úsalos luego para redactar documentos con fundamento oficial.</p>
        </div>

        {favorites.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            Aún no guardaste favoritos. Usa el botón Guardar en cualquier resultado.
          </div>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {favorites.map((favorite) => (
              <Link key={favorite.id} href={`/biblioteca/${encodeURIComponent(favorite.article_id)}`} className="rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{favorite.category || 'BCN'}</p>
                <h3 className="mt-2 text-sm font-semibold text-slate-900">{favorite.title || favorite.law_title || favorite.article_id}</h3>
                <p className="mt-2 text-sm text-slate-600">{favorite.summary || 'Referencia guardada.'}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}