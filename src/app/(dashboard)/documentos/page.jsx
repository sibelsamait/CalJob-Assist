"use client";

import Link from 'next/link';
import { Download, FileText, Loader2, BookMarked } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { supabase, useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

export default function DocumentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [links, setLinks] = useState({});

  useEffect(() => {
    if (authLoading || !user) return;

    if (!supabase) {
      setError('No se pudo conectar con Supabase.');
      setLoading(false);
      return;
    }

    Promise.all([
      supabase.from('documents').select('id, title, type, storage_path, created_at, metadata').eq('user_id', user.id).order('created_at', { ascending: false }),
      fetch('/api/legal/favorites').then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'No se pudieron cargar los favoritos.');
        return payload.favorites || [];
      }),
    ])
      .then(([documentsResult, favoritesResult]) => {
        const { data, error: queryError } = documentsResult;
        if (queryError) {
          setError(queryError.message);
        } else {
          setDocuments(data || []);
        }
        setFavorites(favoritesResult || []);
      })
      .catch((fetchError) => setError(fetchError.message || 'No se pudo cargar la información.'))
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  const download = async (document) => { if (!supabase || !document.storage_path) return; const { data, error: linkError } = await supabase.storage.from('documents').createSignedUrl(document.storage_path, 300); if (linkError) { setError(linkError.message); return; } setLinks((current) => ({ ...current, [document.id]: data.signedUrl })); };

  if (authLoading || loading) return <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-700" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Mis documentos" description="Consulta tus PDFs y usa los artículos guardados como referencia para redactar nuevos documentos." />
      {error ? <AlertBanner tone="error" title="No se pudieron cargar los documentos" description={error} /> : null}

      {!error && documents.length === 0 ? (
        <EmptyState title="Aún no tienes documentos" description="Los PDFs que generes desde tus trámites aparecerán aquí." />
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <article key={document.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-800"><FileText className="h-5 w-5" /></span>
                <div>
                  <h2 className="font-semibold text-slate-900">{document.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">{document.type} · {new Date(document.created_at).toLocaleDateString('es-CL')}</p>
                </div>
              </div>
              {links[document.id] ? <a href={links[document.id]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"><Download className="h-4 w-4" />Descargar</a> : <button type="button" onClick={() => download(document)} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"><Download className="h-4 w-4" />Generar enlace</button>}
            </article>
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <BookMarked className="h-5 w-5 text-blue-800" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Referencias legales guardadas</h2>
            <p className="text-sm text-slate-600">Usa estos artículos BCN como apoyo al redactar nuevos documentos.</p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            Todavía no guardaste normas como referencia. Ve a la biblioteca para marcar favoritos.
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