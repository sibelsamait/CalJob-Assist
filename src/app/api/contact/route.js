import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

async function sendWithResend({ to, subject, html, text, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'CalJob Assist <noreply@caljob-assist.cl>';

  if (!apiKey) {
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      reply_to: replyTo,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend rechazó el correo: ${errorText}`);
  }

  return true;
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

    const adminEmail = process.env.CONTACT_ADMIN_EMAIL || process.env.EMAIL_FROM?.match(/<([^>]+)>/)?.[1] || 'noreply@caljob-assist.cl';
    const fromEmail = process.env.EMAIL_FROM || 'CalJob Assist <noreply@caljob-assist.cl>';

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

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        message: 'Tu mensaje fue recibido, pero el correo no está configurado aún. Completa RESEND_API_KEY y EMAIL_FROM para enviar notificaciones.',
      });
    }

    await sendWithResend({
      to: adminEmail,
      subject,
      html,
      text: `${name} (${email}) envió un mensaje: ${message}`,
      replyTo: email,
    });

    await sendWithResend({
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
      text: `Hola ${name}, hemos recibido tu mensaje y lo registramos como un nuevo ticket de soporte.`,
      replyTo: adminEmail,
    });

    return NextResponse.json({ message: 'Tu mensaje fue enviado correctamente.' });
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'No se pudo procesar el formulario.' }, { status: 500 });
  }
}
