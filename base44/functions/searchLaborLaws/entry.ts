import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * CalJob Assist — Buscador de Biblioteca Legal
 * Búsqueda por nombre, código, tema, número, fecha, categoría o contenido.
 * Permite respaldar decisiones con base legal (Código del Trabajo y leyes asociadas).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json();
    const {
      query = '',
      category = null,
      topic = null,
      status = 'vigente',
      limit = 20,
      offset = 0
    } = body;

    // Construir filtro base
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (topic) filter.topic = topic;

    // Obtener todas las leyes que coincidan con filtros estructurales
    const leyes = await base44.entities.LaborLaw.filter(filter, '-last_update_date', 500);

    // Búsqueda textual en memoria (sin $regex disponible en RLS)
    let resultados = leyes || [];
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      resultados = resultados.filter(ley => {
        const campos = [
          ley.title, ley.law_code, ley.law_number, ley.topic,
          ley.content, ley.summary, ley.article_number,
          (ley.keywords || []).join(' ')
        ].filter(Boolean).join(' ').toLowerCase();
        return campos.includes(q);
      });
    }

    // Aplicar paginación
    const total = resultados.length;
    const paginados = resultados.slice(offset, offset + limit);

    return Response.json({
      status: 'ok',
      total,
      offset,
      limit,
      resultados: paginados.map(ley => ({
        id: ley.id,
        law_code: ley.law_code,
        law_number: ley.law_number,
        title: ley.title,
        category: ley.category,
        topic: ley.topic,
        article_number: ley.article_number,
        summary: ley.summary,
        content: ley.content,
        keywords: ley.keywords,
        publication_date: ley.publication_date,
        last_update_date: ley.last_update_date,
        status: ley.status,
        source_url: ley.source_url,
        applicable_to: ley.applicable_to
      }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});