export const BCN_BASE_URL = 'https://www.bcn.cl/leychile/api/v1';

export function getBcnAuthHeaders() {
  const apiKey = process.env.BCN_LEYCHILE_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  const headers = {
    Accept: 'application/json, text/plain, */*',
    Authorization: `Bearer ${apiKey}`,
    'X-API-Key': apiKey,
    'X-BCN-API-Key': apiKey,
  };

  const customHeaderName = process.env.BCN_LEYCHILE_AUTH_HEADER_NAME?.trim();
  if (customHeaderName) {
    const customScheme = process.env.BCN_LEYCHILE_AUTH_SCHEME?.trim();
    headers[customHeaderName] = customScheme ? `${customScheme} ${apiKey}` : apiKey;
  }

  return headers;
}

function appendParams(target, source) {
  if (!source) return;

  const params = source instanceof URLSearchParams ? source : new URLSearchParams(source);
  for (const [key, value] of params.entries()) {
    if (value !== undefined && value !== null && value !== '') {
      target.set(key, value);
    }
  }
}

export function buildBcnUrl(pathSegments, searchParams) {
  const safeSegments = Array.isArray(pathSegments) ? pathSegments.filter(Boolean) : [pathSegments].filter(Boolean);
  const url = new URL(`${BCN_BASE_URL}/${safeSegments.join('/')}`);
  appendParams(url.searchParams, searchParams);
  return url;
}

export async function readBcnResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return { kind: 'json', data: await response.json() };
    } catch {
      return { kind: 'text', data: await response.text() };
    }
  }

  const text = await response.text();
  try {
    return { kind: 'json', data: JSON.parse(text) };
  } catch {
    const trimmed = text.trim();
    if (trimmed.startsWith('<')) {
      return { kind: 'xml', data: trimmed };
    }
    return { kind: 'text', data: text };
  }
}

function parseXmlString(xmlString) {
  if (typeof xmlString !== 'string' || !xmlString.trim()) return null;
  if (typeof globalThis.DOMParser === 'undefined') return null;

  const parser = new DOMParser();
  const document = parser.parseFromString(xmlString, 'application/xml');
  if (document.querySelector('parsererror')) return null;
  return document;
}

function xmlText(node, names) {
  if (!node || !Array.isArray(names)) return '';
  for (const name of names) {
    const el = node.querySelector(name);
    if (el?.textContent?.trim()) return el.textContent.trim();
  }
  return '';
}

function extractBcnMessage(body) {
  if (!body) return null;
  if (body.kind === 'json' && body.data) {
    if (typeof body.data === 'string') return body.data;
    if (Array.isArray(body.data)) return JSON.stringify(body.data);
    if (typeof body.data === 'object' && body.data !== null) {
      return body.data.message || body.data.error || body.data.descripcion || JSON.stringify(body.data);
    }
  }
  if (body.kind === 'xml' || body.kind === 'text') {
    return String(body.data).trim();
  }
  return null;
}

function formatBcnErrorMessage(response, body) {
  if (response.status === 401 || response.status === 403) {
    return 'Acceso denegado a BCN. Revisa BCN_LEYCHILE_API_KEY y permisos.';
  }
  if (response.status === 404) {
    return 'No se encontró la norma en BCN.';
  }
  if (response.status === 429) {
    return 'Límite de consultas BCN excedido. Intenta otra vez más tarde.';
  }
  if (response.status >= 500) {
    return 'Error en el servicio BCN. Intenta de nuevo más tarde.';
  }

  const detail = extractBcnMessage(body);
  if (detail) {
    return `No se pudo consultar BCN (${response.status}). ${detail}`;
  }

  return `No se pudo consultar BCN (${response.status}).`;
}

export async function fetchBcnEndpoint(pathSegments, searchParams = {}, { fallbackPaths = [] } = {}) {
  const headers = getBcnAuthHeaders();
  if (!headers) {
    throw new Error('BCN_LEYCHILE_API_KEY no está configurada');
  }

  const attempts = [pathSegments, ...fallbackPaths];
  let lastError = null;

  for (const attempt of attempts) {
    const url = buildBcnUrl(attempt, searchParams);
    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    });

    const body = await readBcnResponseBody(response);
    if (response.ok) {
      return {
        ok: true,
        status: response.status,
        url: url.toString(),
        path: Array.isArray(attempt) ? attempt.join('/') : String(attempt),
        body,
        contentType: response.headers.get('content-type') || 'application/json',
      };
    }

    lastError = {
      status: response.status,
      url: url.toString(),
      body,
      message: formatBcnErrorMessage(response, body),
    };
  }

  const error = new Error(lastError?.message || 'No se pudo consultar BCN');
  error.cause = lastError;
  throw error;
}

function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
}

function pickArray(payload, keys) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  return [];
}

function normalizeNode(node) {
  if (!node || typeof node !== 'object') return null;

  const children = pickArray(node, ['children', 'hijos', 'nodos', 'partes', 'articulos', 'items']).map(normalizeNode).filter(Boolean);

  return {
    id: firstText(node.idParte, node.id_parte, node.idArticulo, node.id_articulo, node.idNorma, node.id_norma, node.id, node.codigo),
    title: firstText(node.titulo, node.title, node.nombre, node.descripcion, node.texto) || 'Nodo de norma',
    text: firstText(node.texto, node.contenido, node.resumen, node.descripcion, node.html),
    number: firstText(node.numero, node.nro, node.articleNumber),
    children,
    raw: node,
  };
}

export function normalizeBcnSearchResults(payload) {
  const list = pickArray(payload, ['items', 'resultados', 'normas', 'data', 'results', 'rows', 'registros']);

  return list.map((item) => {
    const idNorma = firstText(item?.idNorma, item?.id_norma, item?.normaId, item?.id, item?.codigo, item?.codigoNorma);
    const idParte = firstText(item?.idParte, item?.id_parte, item?.parteId, item?.id_articulo);

    return {
      idNorma,
      idParte: idParte || null,
      title: firstText(item?.titulo, item?.title, item?.denominacion, item?.nombre, item?.descripcion) || `Norma ${idNorma || ''}`.trim(),
      category: firstText(item?.categoria, item?.category, item?.tipo, item?.clase) || 'Norma',
      summary: firstText(item?.resumen, item?.summary, item?.descripcion, item?.glosa, item?.texto),
      updatedAt: firstText(item?.fechaActualizacion, item?.updated_at, item?.fecha_publicacion, item?.fechaPublicacion, item?.fecha),
      url: firstText(item?.url, item?.link),
      raw: item,
    };
  });
}

export function normalizeBcnNorma(payload) {
  let root = payload?.data ?? payload?.norma ?? payload?.resultado ?? payload;

  if (typeof root === 'string') {
    const xmlDocument = parseXmlString(root);
    if (xmlDocument) {
      const xmlRoot = xmlDocument.documentElement;
      root = {
        idNorma: xmlText(xmlRoot, ['idNorma', 'id_norma', 'id']),
        titulo: xmlText(xmlRoot, ['titulo', 'title', 'nombre', 'denominacion', 'descripcion']),
        categoria: xmlText(xmlRoot, ['categoria', 'category', 'tipo']),
        resumen: xmlText(xmlRoot, ['resumen', 'summary', 'descripcion', 'glosa']),
        texto: xmlText(xmlRoot, ['texto', 'contenido', 'html', 'body', 'textoPlano']),
        fechaActualizacion: xmlText(xmlRoot, ['fechaActualizacion', 'fecha_publicacion', 'fechaPublicacion', 'fecha']),
        tree: [],
        raw: root,
      };
    }
  }

  const treeNodes = pickArray(root, ['articulos', 'children', 'hijos', 'nodos', 'partes', 'estructura']);

  return {
    idNorma: firstText(root?.idNorma, root?.id_norma, root?.id, payload?.idNorma, payload?.id_norma),
    idParte: firstText(root?.idParte, root?.id_parte, root?.idParte, root?.id_parte, root?.idParte, payload?.idParte, payload?.id_parte) || null,
    title: firstText(root?.titulo, root?.title, root?.nombre, root?.denominacion, root?.descripcion) || 'Norma BCN',
    category: firstText(root?.categoria, root?.category, root?.tipo) || 'Norma',
    summary: firstText(root?.resumen, root?.summary, root?.descripcion, root?.glosa),
    content: firstText(root?.texto, root?.contenido, root?.html, root?.body, root?.textoPlano) || (typeof root === 'string' ? root : ''),
    updatedAt: firstText(root?.fechaActualizacion, root?.updated_at, root?.fechaPublicacion, root?.fecha),
    tree: treeNodes.map(normalizeNode).filter(Boolean),
    raw: payload,
  };
}
