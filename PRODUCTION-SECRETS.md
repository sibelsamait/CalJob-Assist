# Production secrets and where to obtain them

Este documento resume dónde obtener las credenciales necesarias para poner CalJob Assist en producción.

## Supabase
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- Crear proyecto en https://app.supabase.com → Project Settings → API → copiar URL y keys.

## PayPal
- Crear app en https://developer.paypal.com > My Apps & Credentials
  - Copiar `Client ID` → `PAYPAL_CLIENT_ID` y `Secret` → `PAYPAL_CLIENT_SECRET`.
  - Configurar `PAYPAL_MODE=live` para producción.
  - Crear Webhook en la app con la URL `https://<tu-dominio>/api/payments/webhook/paypal` y copiar el `Webhook ID` → `PAYPAL_WEBHOOK_ID`.
  - Para suscripciones: crear un `Plan` en Billing > Plans y copiar `Plan ID` → `PAYPAL_PLAN_ID`.

## Transbank / Webpay
- Contactar a Transbank/Transacciones Comerciales en https://www.transbankdevelopers.cl
  - Solicita credenciales Webpay Plus (commerce code, API key) para producción.
  - En desarrollo usa modos de prueba y certificados sandbox.
  - Añadir las URLs de notificación en el panel de Transbank; en producción debes validar con el SDK.
  - Variables de entorno sugeridas: `WEBPAY_MALL_ID`, `WEBPAY_API_KEY` (ya en `.env.example`).

## Mercado Pago
- Crear cuenta en https://www.mercadopago.com
  - Ir a Developers → Credenciales → copiar `ACCESS_TOKEN` → `MERCADO_PAGO_ACCESS_TOKEN`.
  - Configurar webhooks apuntando a `/api/payments/webhook/mercadopago`.

## Flow, Fintoc, Khipu
- Flow: https://developers.flow.cl → pedir credenciales → `FLOW_API_KEY`.
- Fintoc: https://fintoc.com/docs → `FINTOC_API_KEY`.
- Khipu: https://khipu.com/developers → `KHIPU_API_KEY`.

## Email / SMTP
- Proveedor SMTP (SendGrid, Mailgun, SES, etc.)
  - `EMAIL_FROM`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`.

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

---

Mantén este archivo actualizado con las credenciales reales y con quien contactó en cada proveedor para auditoría.