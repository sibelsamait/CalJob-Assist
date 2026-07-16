# Production secrets and where to obtain them

Este documento resume dónde obtener las credenciales necesarias para poner CalJob Assist en producción.

## Supabase
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Crear proyecto en https://app.supabase.com → Project Settings → API → copiar URL y keys.

## PayPal
- Crear app en https://developer.paypal.com > My Apps & Credentials
  - Copiar `Client ID` → `PAYPAL_CLIENT_ID` y `Secret` → `PAYPAL_CLIENT_SECRET`.
  - Configurar `PAYPAL_MODE=live` para producción.
  - Crear Webhook en la app con la URL `https://<tu-dominio>/api/payments/webhook/paypal` y copiar el `Webhook ID` → `PAYPAL_WEBHOOK_ID`.
  - Para suscripciones: crear un `Plan` por categoría en Billing > Plans y copiar cada `Plan ID` en los secretos de entorno:
    - `PAYPAL_PERSONAL_PLAN_ID` (o `PERSONAL_PLAN_ID`)
    - `PAYPAL_TEAM_PLAN_ID` (o `TEAM_PLAN_ID`)
    - `PAYPAL_ENTERPRISE_PLAN_ID` (o `ENTERPRISE_PLAN_ID`)
  - Importante: la app manejará la suscripción real desde la base de datos; PayPal solo será usado para cobros y, si así lo deseas, para reembolsos/cancelaciones automatizadas.

## Transbank / Webpay
- Contactar a Transbank/Transacciones Comerciales en https://www.transbankdevelopers.cl
  - Solicita credenciales Webpay Plus (commerce code, API key) para producción.
  - En desarrollo usa modos de prueba y certificados sandbox.
  - Añadir las URLs de notificación en el panel de Transbank; en producción debes validar con el SDK.
  - Variables de entorno sugeridas: `WEBPAY_MALL_ID`, `WEBPAY_API_KEY` (ya en `.env.example`).
    - Variables de entorno recomendadas para este proyecto:
      - `WEBPAY_COMMERCE_CODE` — código de comercio (production)
      - `WEBPAY_API_KEY` — clave privada/API Key
      - `WEBPAY_ENV` — `INTEGRATION` o `PRODUCTION`

    - Para la tarea de reintentos automáticos que ejecuta el workflow del repo:
      - `WEBHOOK_RETRY_BASE_URL` — URL base del sitio (ej: https://mi-dominio.com)
      - `WEBHOOK_RETRY_TOKEN` — token secreto usado por el workflow para autenticar la petición a `/api/webhooks/retry`

## Mercado Pago
- Crear cuenta en https://www.mercadopago.com
  - Ir a Developers → Credenciales → copiar `ACCESS_TOKEN` → `MERCADO_PAGO_ACCESS_TOKEN`.
  - Configurar webhooks apuntando a `/api/payments/webhook/mercadopago`.

## Flow, Fintoc, Khipu
- Flow: https://developers.flow.cl → pedir credenciales → `FLOW_API_KEY`.
- Fintoc: https://fintoc.com/docs → `FINTOC_API_KEY`.
- Khipu: https://khipu.com/developers → `KHIPU_API_KEY`.

## Email / SMTP
- Proveedor SMTP (MailerSend, SendGrid, Mailgun, SES, etc.)
  - `EMAIL_FROM` → remitente visible en los correos salientes.
  - `CONTACT_ADMIN_EMAIL` → correo del equipo que recibe nuevos contactos/tickets.
  - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_PORT`, `SMTP_SECURE`.
  - Ejemplo MailerSend:
    - `SMTP_HOST=smtp.mailersend.net`
    - `SMTP_PORT=587`
    - `SMTP_USER=MS_xxx@...mlsender.net`
    - `SMTP_PASSWORD=mssp.xxxxxxx...`
    - `EMAIL_FROM=onboarding@tudominio.com`

## Database
- `DATABASE_URL` (Postgres) — configurar una base de datos gestionada (Supabase, Postgres en cloud).

## Recomendaciones de seguridad
- Usar un gestor de secretos (Vercel Environment, AWS Secrets Manager, GCP Secret Manager) — no subir `.env.local` al repositorio.
- Usar `SUPABASE_SERVICE_ROLE_KEY` solo en server-side y nunca en el cliente.
- Limitar accesos con roles/permissions y activar RLS en Supabase.

## Notas de despliegue
- Programar job diario (Vercel Cron / GitHub Actions) que llame a:
  `POST https://<tu-dominio>/api/payments/cron/subscriptions`
- Activar HTTPS y dominios válidos para que PayPal/Transbank acepten las notificaciones.

## Webhook retry / monitorización
- Para los reintentos automáticos necesitas dos secrets:
  - `WEBHOOK_RETRY_BASE_URL` → URL pública del sitio, por ejemplo `https://mi-dominio.com`
  - `WEBHOOK_RETRY_TOKEN` → token secreto compartido con el endpoint `/api/webhooks/retry`
- El workflow de GitHub Actions usa esas variables para llamar al endpoint con `Authorization: Bearer <token>`.

## Variables por entorno
### Vercel (runtime + app)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_MODE`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_PERSONAL_PLAN_ID` o `PERSONAL_PLAN_ID`
- `PAYPAL_TEAM_PLAN_ID` o `TEAM_PLAN_ID`
- `PAYPAL_ENTERPRISE_PLAN_ID` o `ENTERPRISE_PLAN_ID`
- `EMAIL_FROM`
- `CONTACT_ADMIN_EMAIL`
- `SMTP_HOST`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_PORT`
- `SMTP_SECURE`
- `WEBHOOK_RETRY_BASE_URL` (opcional si el endpoint de reintentos se usa desde la app)
- `WEBHOOK_RETRY_TOKEN` (opcional si el endpoint de reintentos se usa desde la app)

### GitHub Actions / Secrets
- `WEBHOOK_RETRY_BASE_URL`
- `WEBHOOK_RETRY_TOKEN`
- `CRON_BASE_URL`
- `CRON_TOKEN`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_MODE`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_PERSONAL_PLAN_ID` o `PERSONAL_PLAN_ID`
- `PAYPAL_TEAM_PLAN_ID` o `TEAM_PLAN_ID`
- `PAYPAL_ENTERPRISE_PLAN_ID` o `ENTERPRISE_PLAN_ID`
- `SMTP_HOST`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `EMAIL_FROM`
- `CONTACT_ADMIN_EMAIL`

---

Mantén este archivo actualizado con las credenciales reales y con quien contactó en cada proveedor para auditoría.