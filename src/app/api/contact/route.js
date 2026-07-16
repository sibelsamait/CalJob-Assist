import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: { user, pass },
  });
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const name = String(payload?.name || '').trim();
    const email = String(payload?.email || '').trim();
    const message = String(payload?.message || '').trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Nombre, correo y mensaje son obligatorios.' }, { status: 400 });
    }

    const transporter = getTransporter();
    const adminEmail = process.env.CONTACT_ADMIN_EMAIL || process.env.EMAIL_FROM || 'contacto@caljobassist.cl';
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'contacto@caljobassist.cl';

    const subject = `Nuevo contacto desde CalJob Assist: ${name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h2 style="color: #1d4ed8;">Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Correo:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message.replace(/\n/g, '<br />')}</p>
      </div>
    `;

    const supabase = getSupabaseServer();
    if (supabase) {
      await supabase.from('tickets').insert([{
        user_email: email,
        subject,
        description: message,
        status: 'open',
        priority: 'medium',
      }]);
    }

    if (!transporter) {
      return NextResponse.json({
        message: 'Tu mensaje fue recibido, pero el correo no está configurado aún. Completa SMTP para enviar notificaciones.',
      });
    }

    await transporter.sendMail({
      from: fromEmail,
      to: adminEmail,
      replyTo: email,
      subject,
      html,
    });

    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: 'Hemos recibido tu mensaje en CalJob Assist',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
          <h2 style="color: #1d4ed8;">Gracias por contactarnos</h2>
          <p>Hola ${name},</p>
          <p>Hemos recibido tu mensaje y lo registramos como un nuevo ticket de soporte.</p>
          <p>Pronto nos pondremos en contacto contigo.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: 'Tu mensaje fue enviado correctamente.' });
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'No se pudo procesar el formulario.' }, { status: 500 });
  }
}
