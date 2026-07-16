import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * CalJob Assist — Sincronizador de Indicadores Económicos
 * Consume la API pública mindicador.cl (Banco Central de Chile) sin API key.
 * Actualiza UF, UTM, IPC, sueldo mínimo, dólar y euro.
 * Función admin-only: puede ejecutarse manualmente o como tarea programada diaria.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Requiere rol administrador' }, { status: 403 });

    const indicadores = ['uf', 'utm', 'ipc', 'dolar', 'euro'];
    const hoy = new Date().toISOString().split('T')[0];
    const resultados = [];

    for (const tipo of indicadores) {
      try {
        const res = await fetch(`https://mindicador.cl/api/${tipo}`);
        if (!res.ok) {
          resultados.push({ tipo, estado: 'error_api', detalle: `HTTP ${res.status}` });
          continue;
        }
        const data = await res.json();
        const serie = data.serie && data.serie[0];
        if (serie) {
          const valor = serie.valor;
          const fecha = serie.fecha ? serie.fecha.split('T')[0] : hoy;

          // Verificar si ya existe para hoy
          const existentes = await base44.asServiceRole.entities.EconomicIndicator.filter({
            indicator_type: tipo,
            date: fecha
          });
          if (existentes && existentes.length === 0) {
            await base44.asServiceRole.entities.EconomicIndicator.create({
              indicator_type: tipo,
              value: valor,
              date: fecha,
              unit: data.unidad_medida || 'pesos',
              variation: serie.valor_anterior ? ((valor - serie.valor_anterior) / serie.valor_anterior * 100) : null,
              source: 'mindicador.cl / Banco Central de Chile'
            });
            resultados.push({ tipo, valor, fecha, estado: 'creado' });
          } else {
            resultados.push({ tipo, valor, fecha, estado: 'ya_existente' });
          }
        }
      } catch (e) {
        resultados.push({ tipo, estado: 'error', detalle: e.message });
      }
    }

    // Sueldo mínimo (valor fijo legal 2025: $500.000, se actualiza por ley)
    const sueldoMinimoExistente = await base44.asServiceRole.entities.EconomicIndicator.filter({
      indicator_type: 'sueldo_minimo',
      date: hoy
    });
    if (!sueldoMinimoExistente || sueldoMinimoExistente.length === 0) {
      await base44.asServiceRole.entities.EconomicIndicator.create({
        indicator_type: 'sueldo_minimo',
        value: 500000,
        date: hoy,
        unit: 'pesos',
        variation: null,
        source: 'Ley 21.758 / Decreto Ministerio del Trabajo'
      });
      resultados.push({ tipo: 'sueldo_minimo', valor: 500000, fecha: hoy, estado: 'creado' });
    } else {
      resultados.push({ tipo: 'sueldo_minimo', estado: 'ya_existente' });
    }

    // Registrar en audit log
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'sync_economic_indicators',
      entity_type: 'EconomicIndicator',
      user_email: user.email,
      user_id: user.id,
      details: { indicadores_actualizados: resultados.length, fecha: hoy },
      timestamp: new Date().toISOString()
    });

    return Response.json({ status: 'ok', fecha: hoy, resultados });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});