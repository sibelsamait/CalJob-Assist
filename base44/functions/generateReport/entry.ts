import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { jsPDF } from 'npm:jspdf@4.0.0';

/**
 * CalJob Assist — Generador de Informe PDF Firmado
 * Genera un documento PDF con los cálculos, acuerdos o consultas,
 * firmado con el nombre de la app y fecha de última actualización,
 * para que las personas sepan si la información está al día.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json();
    const {
      document_type = 'calculo',
      title,
      case_number,
      worker_name,
      company_name,
      content,
      calculation_result,
      legal_basis = []
    } = body;

    const doc = new jsPDF();
    const fechaGeneracion = new Date();
    const fechaStr = fechaGeneracion.toLocaleDateString('es-CL') + ' ' + fechaGeneracion.toLocaleTimeString('es-CL');
    const appVersion = 'CalJob Assist v1.0';

    // Encabezado
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CalJob Assist', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Controla tu vida legal y laboral informado', 105, 27, { align: 'center' });
    doc.setDrawColor(200);
    doc.line(14, 32, 196, 32);

    // Metadata del documento
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title || 'Informe Laboral', 14, 42);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tipo de documento: ${document_type}`, 14, 49);
    if (case_number) doc.text(`Caso N°: ${case_number}`, 14, 54);
    if (worker_name) doc.text(`Trabajador: ${worker_name}`, 14, 59);
    if (company_name) doc.text(`Empleador: ${company_name}`, 14, 64);
    doc.text(`Generado por: ${user.email}`, 14, 69);
    doc.text(`Fecha de generación: ${fechaStr}`, 14, 74);

    // Separador
    doc.setDrawColor(220);
    doc.line(14, 78, 196, 78);

    let y = 86;

    // Contenido principal
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle del Informe', 14, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    if (calculation_result) {
      const cr = typeof calculation_result === 'string' ? JSON.parse(calculation_result) : calculation_result;
      if (cr.resumen) {
        doc.setFont('helvetica', 'bold');
        doc.text(`Total liquidación: $${cr.resumen.total_liquidacion?.toLocaleString('es-CL')} ${cr.resumen.moneda || 'CLP'}`, 14, y);
        y += 7;
      }
      doc.setFont('helvetica', 'normal');
      const secciones = ['indemnizacion_servicio', 'aviso_previo', 'feriado_proporcional'];
      for (const sec of secciones) {
        if (cr[sec] && cr[sec].aplica) {
          const texto = `${sec}: $${cr[sec].monto?.toLocaleString('es-CL')} (${cr[sec].articulo || ''})`;
          const lineas = doc.splitTextToSize(texto, 180);
          doc.text(lineas, 14, y);
          y += lineas.length * 5 + 2;
        }
      }
    }

    if (content) {
      const lineas = doc.splitTextToSize(content, 180);
      doc.text(lineas, 14, y);
      y += lineas.length * 5 + 4;
    }

    // Base legal
    if (legal_basis.length > 0) {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.text('Base Legal Aplicada', 14, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      for (const base of legal_basis) {
        const lineas = doc.splitTextToSize(`• ${base}`, 180);
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(lineas, 14, y);
        y += lineas.length * 5;
      }
    }

    // Pie de página con firma de la app (en cada página)
    const numPaginas = doc.getNumberOfPages();
    for (let i = 1; i <= numPaginas; i++) {
      doc.setPage(i);
      doc.setDrawColor(200);
      doc.line(14, 285, 196, 285);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`${appVersion} | Generado el ${fechaStr}`, 14, 290);
      doc.text(`Información vigente a la fecha de generación`, 196, 290, { align: 'right' });
      doc.text(`Página ${i} de ${numPaginas}`, 105, 294, { align: 'center' });
    }

    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="caljob_${document_type}_${Date.now()}.pdf"`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});