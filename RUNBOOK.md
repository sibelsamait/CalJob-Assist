# Runbook (mínimo)

Este documento contiene las acciones operativas rápidas para CalJob Assist en producción.

1) Despliegue
- Configurar secrets en GitHub/Vercel según `PRODUCTION-SECRETS.md`.
- Ejecutar despliegue en Vercel/Host. Verificar `https://<tu-dominio>/api/health` responde `status: ok`.

2) Webhooks
- Registrar en PayPal la URL `https://<dominio>/api/payments/webhook/paypal` y copiar `PAYPAL_WEBHOOK_ID`.
- Registrar en Transbank la URL `https://<dominio>/api/payments/webhook/webpay`.
- Registrar en MercadoPago la URL `https://<dominio>/api/payments/webhook/mercadopago`.

3) Reintentos automáticos
- GitHub workflow `webhook-retry.yml` ejecuta `/api/webhooks/drive` cada 15 minutos.
- Añadir secrets `WEBHOOK_RETRY_BASE_URL` y `WEBHOOK_RETRY_TOKEN`.

4) Cron de suscripciones
- Workflow `cron-subscriptions.yml` llama a `/api/payments/cron/subscriptions` diariamente.
- Añadir secrets `CRON_BASE_URL` y `CRON_TOKEN`.

5) Emergencias
- Para invalidar claves: rotar las variables `PAYPAL_CLIENT_SECRET`, `WEBPAY_API_KEY`, `MERCADO_PAGO_ACCESS_TOKEN` y desplegar.
- Para forzar re-delivery de webhooks: llamar manualmente a `/api/webhooks/drive` con `Authorization: Bearer <token>`.

6) Backups y migraciones
- Ejecutar `prisma migrate deploy` en despliegues controlados. Mantener backups regulares del `DATABASE_URL`.

---
Mantener este runbook actualizado con los procedimientos de tu equipo.
