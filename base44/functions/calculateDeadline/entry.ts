import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * CalJob Assist — Calculadora de Plazos Hábiles
 * Computa plazos legales en días hábiles (Lun-Vie) excluyendo feriados chilenos.
 * Usado para: citación a audiencia de conciliación (15 días hábiles),
 * mediación de negociación colectiva (5 días hábiles prorrogables),
 * plazos de fiscalización (24h riesgo vital).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json();
    const {
      start_date,
      business_days,
      deadline_type = 'generico',
      calendar = 'chile'
    } = body;

    if (!start_date || !business_days) {
      return Response.json({ error: 'Se requieren start_date y business_days' }, { status: 400 });
    }

    // Feriados chilenos 2025-2027 (fijos y variables relevantes)
    const feriadosChile = [
      '2025-01-01', '2025-05-01', '2025-05-21', '2025-06-29', '2025-06-29',
      '2025-07-16', '2025-08-15', '2025-09-18', '2025-09-19', '2025-10-12',
      '2025-10-31', '2025-11-01', '2025-12-08', '2025-12-25', '2025-04-18', '2025-04-19', '2025-04-20',
      '2026-01-01', '2026-04-03', '2026-04-04', '2026-04-05', '2026-05-01', '2026-05-21',
      '2026-06-29', '2026-07-16', '2026-08-15', '2026-09-18', '2026-09-19',
      '2026-10-12', '2026-10-31', '2026-11-01', '2026-12-08', '2026-12-25',
      '2027-01-01', '2027-03-26', '2027-03-27', '2027-03-28', '2027-05-01', '2027-05-21',
      '2027-06-21', '2027-07-16', '2027-08-15', '2027-09-18', '2027-09-19',
      '2027-10-11', '2027-10-31', '2027-11-01', '2027-12-08', '2027-12-25'
    ];

    const esFeriado = (fecha) => feriadosChile.includes(fecha.toISOString().split('T')[0]);
    const esFinDeSemana = (fecha) => {
      const dia = fecha.getDay();
      return dia === 0 || dia === 6; // domingo o sábado
    };

    const fechaInicio = new Date(start_date + 'T12:00:00');
    let diasHabilesContados = 0;
    let fechaActual = new Date(fechaInicio);
    let alerta = null;

    // Tipos de plazo con reglas específicas
    const reglasPorTipo = {
      'citacion_conciliacion': { dias: 15, descripcion: 'Citación a audiencia de conciliación (15 días hábiles desde ingreso)' },
      'mediacion_colectiva': { dias: 5, descripcion: 'Mediación negociación colectiva (5 días hábiles, prorrogable +5)' },
      'mediacion_colectiva_prorroga': { dias: 10, descripcion: 'Mediación prorrogada (10 días hábiles total)' },
      'fiscalizacion_riesgo_vital': { dias: 1, descripcion: 'Fiscalización riesgo vital (24 horas / 1 día hábil)' },
      'fiscalizacion_alta_prioridad': { dias: 3, descripcion: 'Fiscalización alta prioridad (3 días hábiles)' },
      'fiscalizacion_media': { dias: 10, descripcion: 'Fiscalización prioridad media (10 días hábiles)' },
      'generico': { dias: business_days, descripcion: 'Plazo genérico' }
    };

    const regla = reglasPorTipo[deadline_type] || reglasPorTipo['generico'];
    const diasAComputar = regla.dias;

    // Avanzar día por día contando hábiles
    while (diasHabilesContados < diasAComputar) {
      fechaActual.setDate(fechaActual.getDate() + 1);
      if (!esFinDeSemana(fechaActual) && !esFeriado(fechaActual)) {
        diasHabilesContados++;
      }
    }

    // Alerta: si faltan 24 horas o menos (para mediación colectiva)
    const ahora = new Date();
    const horasRestantes = (fechaActual - ahora) / (1000 * 60 * 60);
    if (deadline_type === 'mediacion_colectiva' && horasRestantes <= 24 && horasRestantes > 0) {
      alerta = { nivel: 'rojo', mensaje: 'Faltan 24 horas o menos para el vencimiento del plazo de mediación sin acuerdo registrado' };
    }

    // Generar lista de días hábiles incluidos
    const diasHabilesLista = [];
    let fechaIter = new Date(fechaInicio);
    let contador = 0;
    while (contador < diasAComputar) {
      fechaIter.setDate(fechaIter.getDate() + 1);
      if (!esFinDeSemana(fechaIter) && !esFeriado(fechaIter)) {
        contador++;
        diasHabilesLista.push({
          dia: contador,
          fecha: fechaIter.toISOString().split('T')[0],
          dia_semana: ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][fechaIter.getDay()]
        });
      }
    }

    const result = {
      tipo_plazo: deadline_type,
      descripcion: regla.descripcion,
      fecha_inicio: start_date,
      dias_habiles_computados: diasAComputar,
      fecha_vencimiento: fechaActual.toISOString().split('T')[0],
      dias_habiles_detalle: diasHabilesLista,
      feriados_excluidos: feriadosChile.filter(f => {
        const ff = new Date(f + 'T12:00:00');
        return ff >= fechaInicio && ff <= fechaActual;
      }),
      alerta,
      generado_por: 'CalJob Assist',
      fecha_calculo: new Date().toISOString()
    };

    return Response.json({ status: 'ok', result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});