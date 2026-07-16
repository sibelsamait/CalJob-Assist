import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * CalJob Assist — Motor de Cálculo Laboral
 * Calcula indemnizaciones por años de servicio, aviso previo y feriado proporcional
 * según el Código del Trabajo de Chile (Arts. 159, 160, 161, 67, 73).
 * Topes legales: 11 años de servicio, 90 UF de remuneración.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json();
    const {
      contract_start_date,
      contract_end_date,
      dismissal_article,
      last_monthly_remuneration,
      variable_remunerations = [],
      vacation_days_taken = 0,
      uf_value,
      notice_given = false
    } = body;

    // Validaciones
    if (!contract_start_date || !contract_end_date || !last_monthly_remuneration) {
      return Response.json({ error: 'Faltan campos obligatorios: contract_start_date, contract_end_date, last_monthly_remuneration' }, { status: 400 });
    }
    if (!uf_value || uf_value <= 0) {
      return Response.json({ error: 'Se requiere uf_value vigente para aplicar topes legales' }, { status: 400 });
    }

    const startDate = new Date(contract_start_date);
    const endDate = new Date(contract_end_date);
    const topeRemuneracionUF = 90;
    const topeRemuneracionPesos = topeRemuneracionUF * uf_value;
    const topeAniosServicio = 11;

    // --- Cálculo de años de servicio ---
    let aniosCompletos = endDate.getFullYear() - startDate.getFullYear();
    const mesDiff = endDate.getMonth() - startDate.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && endDate.getDate() < startDate.getDate())) {
      aniosCompletos--;
    }
    // Fracción superior a 6 meses suma 1 año (Art. 163 CT)
    const fraccionMeses = (endDate.getFullYear() * 12 + endDate.getMonth()) - (startDate.getFullYear() * 12 + startDate.getMonth());
    const diasRestantes = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate() - startDate.getDate();
    let aniosParaIndemnizacion = Math.max(0, Math.floor(fraccionMeses / 12));
    const fraccionMes = fraccionMeses % 12;
    if (fraccionMes > 6 || (fraccionMes === 6 && endDate.getDate() >= startDate.getDate())) {
      aniosParaIndemnizacion++;
    }
    aniosParaIndemnizacion = Math.min(aniosParaIndemnizacion, topeAniosServicio);

    // Remuneración con tope de 90 UF
    const remuneracionTope = Math.min(last_monthly_remuneration, topeRemuneracionPesos);

    // --- Indemnización por años de servicio (Art. 163 CT, solo Art. 161) ---
    let indemnizacionServicio = 0;
    let aplicaIndemnizacionServicio = false;
    if (dismissal_article === '161') {
      indemnizacionServicio = aniosParaIndemnizacion * remuneracionTope;
      aplicaIndemnizacionServicio = true;
    }

    // --- Indemnización sustitutiva de aviso previo (Art. 162 CT) ---
    let indemnizacionAvisoPrevio = 0;
    let aplicaAvisoPrevio = false;
    if (!notice_given) {
      indemnizacionAvisoPrevio = remuneracionTope;
      aplicaAvisoPrevio = true;
    }

    // --- Feriado proporcional (Art. 73 CT) ---
    // 1.25 días hábiles por cada mes trabajado (15 días al año / 12 meses)
    const diasFeriadoProporcional = (fraccionMeses * 1.25) / 1;
    const diasFeriadoNeto = Math.max(0, diasFeriadoProporcional - vacation_days_taken);
    // Valor del día: remuneración mensual / 30 (días corridos para pago de feriado)
    // Se cuentan días inhábiles posteriores al término
    const valorDiaFeriado = last_monthly_remuneration / 30;
    const feriadoProporcional = diasFeriadoNeto * valorDiaFeriado;

    // --- Remuneración variable promedio (si aplica) ---
    const promedioVariable = variable_remunerations.length > 0
      ? variable_remunerations.reduce((a, b) => a + b, 0) / variable_remunerations.length
      : 0;

    // --- Total liquidación ---
    const totalLiquidacion = indemnizacionServicio + indemnizacionAvisoPrevio + feriadoProporcional;

    const result = {
      resumen: {
        total_liquidacion: Math.round(totalLiquidacion),
        moneda: 'CLP'
      },
      anos_servicio: {
        anos_completos: aniosCompletos,
        anos_para_indemnizacion: aniosParaIndemnizacion,
        tope_aplicado: topeAniosServicio,
        fraccion_meses: fraccionMeses
      },
      indemnizacion_servicio: {
        aplica: aplicaIndemnizacionServicio,
        monto: Math.round(indemnizacionServicio),
        articulo: 'Art. 163 Código del Trabajo',
        remuneracion_usada: Math.round(remuneracionTope),
        tope_uf_aplicado: `${topeRemuneracionUF} UF`,
        uf_valor: uf_value
      },
      aviso_previo: {
        aplica: aplicaAvisoPrevio,
        monto: Math.round(indemnizacionAvisoPrevio),
        articulo: 'Art. 162 Código del Trabajo',
        aviso_previo_dado: notice_given
      },
      feriado_proporcional: {
        dias_ganados: Math.round(diasFeriadoProporcional * 100) / 100,
        dias_tomados: vacation_days_taken,
        dias_a_compensar: Math.round(diasFeriadoNeto * 100) / 100,
        valor_dia: Math.round(valorDiaFeriado),
        monto: Math.round(feriadoProporcional),
        articulo: 'Art. 73 Código del Trabajo'
      },
      remuneracion_variable: {
        promedio_mensual: Math.round(promedioVariable),
        meses_considerados: variable_remunerations.length
      },
      base_legal: [
        'Art. 159 CT — Causales de término de contrato',
        'Art. 160 CT — Causales de caducidad',
        'Art. 161 CT — Necesidades de la empresa',
        'Art. 162 CT — Aviso previo',
        'Art. 163 CT — Indemnización por años de servicio',
        'Art. 67 CT — Feriado anual',
        'Art. 73 CT — Feriado proporcional',
        'Tope 90 UF remuneración (Art. 172 CT)',
        'Tope 11 años de servicio (Art. 163 CT)'
      ],
      generado_por: 'CalJob Assist',
      fecha_calculo: new Date().toISOString(),
      uf_aplicada: uf_value
    };

    return Response.json({ status: 'ok', result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});