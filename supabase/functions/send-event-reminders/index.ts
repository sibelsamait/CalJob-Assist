import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const REMINDER_WINDOWS = [
  { type: 'event_7d', offsetMs: 7 * 24 * 60 * 60 * 1000, channels: ['in_app', 'email'] },
  { type: 'event_3d', offsetMs: 3 * 24 * 60 * 60 * 1000, channels: ['in_app'] },
  { type: 'event_1d', offsetMs: 24 * 60 * 60 * 1000, channels: ['in_app', 'email'] },
  { type: 'event_1h', offsetMs: 60 * 60 * 1000, channels: ['in_app'] },
];

const WINDOW_MS = 5 * 60 * 1000;

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Santiago',
  }).format(new Date(value));
}

function getNotificationBody(title: string, startDate: string, type: string) {
  const labels: Record<string, string> = {
    event_7d: 'en 7 dias',
    event_3d: 'en 3 dias',
    event_1d: 'mañana',
    event_1h: 'en 1 hora',
  };

  return `${title} vence ${labels[type] ?? 'pronto'} (${formatEventDate(startDate)}).`;
}

async function getEventRecipients(supabase: ReturnType<typeof createClient>, event: { user_id: string | null; source: string }) {
  if (event.source === 'user' && event.user_id) {
    return [event.user_id];
  }

  const { data, error } = await supabase.from('profiles').select('id');
  if (error) {
    throw new Error(`No se pudieron obtener los destinatarios: ${error.message}`);
  }

  return (data ?? []).map((profile) => profile.id);
}

async function getUserEmail(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error) {
    console.error(`No se pudo obtener el email del usuario ${userId}: ${error.message}`);
    return null;
  }

  return data.user?.email ?? null;
}

async function sendEmail(to: string, title: string, startDate: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('REMINDER_EMAIL_FROM');
  if (!resendApiKey || !from) {
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Recordatorio: ${title}`,
      text: `${title}\nFecha: ${formatEventDate(startDate)}\n\nRevisa el detalle dentro de CalJob Assist.`,
    }),
  });

  if (!response.ok) {
    console.error(`Resend rechazo el correo: ${await response.text()}`);
    return false;
  }

  return true;
}

async function createReminder(
  supabase: ReturnType<typeof createClient>,
  event: { id: string; user_id: string | null; source: string; title: string; start_date: string },
  recipientId: string,
  reminder: (typeof REMINDER_WINDOWS)[number],
) {
  const { data: existing, error: existingError } = await supabase
    .from('notifications')
    .select('id')
    .eq('event_id', event.id)
    .eq('user_id', recipientId)
    .eq('type', reminder.type)
    .maybeSingle();

  if (existingError) {
    throw new Error(`No se pudo verificar el recordatorio: ${existingError.message}`);
  }
  if (existing) {
    return { created: false, emailed: false };
  }

  const { data: notification, error: insertError } = await supabase
    .from('notifications')
    .insert({
      user_id: recipientId,
      event_id: event.id,
      title: `Recordatorio: ${event.title}`,
      body: getNotificationBody(event.title, event.start_date, reminder.type),
      type: reminder.type,
      channel: reminder.channels,
      scheduled_for: new Date().toISOString(),
      metadata: { event_start_date: event.start_date, reminder_type: reminder.type },
    })
    .select('id')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      return { created: false, emailed: false };
    }
    throw new Error(`No se pudo crear el recordatorio: ${insertError.message}`);
  }

  let emailed = false;
  if (reminder.channels.includes('email')) {
    const email = await getUserEmail(supabase, recipientId);
    if (email) {
      emailed = await sendEmail(email, event.title, event.start_date);
    }
  }

  const { error: updateError } = await supabase
    .from('notifications')
    .update({ sent_at: new Date().toISOString() })
    .eq('id', notification.id);

  if (updateError) {
    throw new Error(`No se pudo marcar el recordatorio como enviado: ${updateError.message}`);
  }

  return { created: true, emailed };
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      getRequiredEnv('SUPABASE_URL'),
      getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const now = Date.now();
    const latestWindow = Math.max(...REMINDER_WINDOWS.map((reminder) => reminder.offsetMs));
    const earliest = new Date(now + 60 * 1000);
    const latest = new Date(now + latestWindow + WINDOW_MS);

    const { data: events, error: eventsError } = await supabase
      .from('calendar_events')
      .select('id, user_id, source, title, start_date')
      .eq('is_active', true)
      .gte('start_date', earliest.toISOString())
      .lte('start_date', latest.toISOString());

    if (eventsError) {
      throw new Error(`No se pudieron obtener los eventos: ${eventsError.message}`);
    }

    let created = 0;
    let emailed = 0;
    for (const event of events ?? []) {
      const eventTime = new Date(event.start_date).getTime();
      const recipients = await getEventRecipients(supabase, event);
      for (const recipientId of recipients) {
        for (const reminder of REMINDER_WINDOWS) {
          const target = eventTime - reminder.offsetMs;
          if (Math.abs(target - now) > WINDOW_MS) {
            continue;
          }

          const result = await createReminder(supabase, event, recipientId, reminder);
          if (result.created) created += 1;
          if (result.emailed) emailed += 1;
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, events: events?.length ?? 0, created, emailed }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'Error desconocido' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
