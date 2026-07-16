# CalJob Assist
**"Controla tu vida legal y laboral informado"**

Plataforma SaaS de cálculo laboral chileno para trabajadores, empleadores, mediadores y entidades públicas.

---

## Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend/Auth/DB**: Supabase (PostgreSQL + RLS + Storage)
- **Pagos**: Webpay Plus, Mercado Pago, Flow, Khipu, PayPal
- **Deploy**: Vercel (conectar repo GitHub)

---

## Quickstart

```bash
npm install
cp .env.example .env.local   # llenar con tus credenciales
npm run dev
```

---

## Supabase setup

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar `supabase-schema.sql`
3. Crear bucket **documents** en Storage (privado)
4. Activar proveedor **Google** en Authentication > Providers
5. Agregar `https://tu-dominio.vercel.app/auth/callback` en Authentication > URL Configuration

---

## Secrets y configuración de pasarelas (producción)

PayPal:
- Crear una aplicación en PayPal Developer → Apps & Credentials (live o sandbox).
- Copiar `Client ID` y `Secret` en `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET`.
- Configurar `PAYPAL_MODE` a `live` en producción.
- Crear un webhook en tu app de PayPal y añadir la URL `https://<tu-dominio>/api/payments/webhook/paypal` y copiar el `Webhook ID` en `PAYPAL_WEBHOOK_ID`.
 - Para suscripciones recurrentes: crea un `Plan` en PayPal (Billing Plans) y copia su `Plan ID` en `PAYPAL_PLAN_ID`. Usa el endpoint `/api/payments/paypal/subscriptions/:requestId` para crear la suscripción y obtener el enlace de aprobación.

Mercado Pago:
- Para recibir notificaciones, agrega la URL `https://<tu-dominio>/api/payments/webhook/mercadopago` en tu panel de Mercado Pago (Webhooks) y usa `MERCADO_PAGO_ACCESS_TOKEN`.

Webpay / Transbank:
- Transbank entrega notificaciones según su integración (IPN/postback). Implementa y verifica usando el SDK oficial de Transbank. Añade la URL `https://<tu-dominio>/api/payments/webhook/webpay` como receptor; en producción preferible usar la librería oficial y validar firma.

Webpay Plus / Transbank:
- Solicita credenciales a Transbank y coloca `WEBPAY_MALL_ID` y `WEBPAY_API_KEY` en las variables de entorno.

Mercado Pago:
- Crear una cuenta de empresa en Mercado Pago y obtener `ACCESS_TOKEN`, colócalo en `MERCADO_PAGO_ACCESS_TOKEN`.

Flow, Fintoc, Khipu:
- Solicita API keys según documentación oficial y colócalas en `FLOW_API_KEY`, `FINTOC_API_KEY`, `KHIPU_API_KEY`.

Recomendación de despliegue:
- Añade un job programado (Vercel Cron, GitHub Actions, o un cron en tu servidor) que llame al endpoint `/api/payments/cron/subscriptions` cada día para expirar suscripciones vencidas.

Ejemplo (curl) para programar/ejecutar manualmente:
```bash
curl -X POST https://<tu-dominio>/api/payments/cron/subscriptions
```

Webhook y automatización:
- El endpoint `/api/payments/webhook/paypal` valida la firma contra la API de PayPal y actualiza `payment_requests` y `licenses`.
- Para otros proveedores, crea endpoints equivalentes o envía un payload al endpoint genérico `/api/payments/webhook` con `{ requestId, provider, status, externalId }`.


## Roles de usuario

| Rol | Acceso |
|-----|--------|
| `user` | Dashboard de cálculos, historial, documentos propios |
| `tecnico` | + Panel admin (tickets, empresas, suscripciones) |
| `admin` | + Cambiar roles, gestionar devoluciones, acceso total |

El panel admin se accede en `/admin`. El login detecta el rol y redirige automáticamente.

Para asignar rol admin manualmente (primer admin):
```sql
update public.profiles set role = 'admin' where id = 'uuid-del-usuario';
```

---

## Deploy en Vercel

1. Push a GitHub
2. Importar en Vercel > agregar variables de entorno de `.env.example`
3. Deploy automático en cada push a `main`

---

## Estructura del proyecto

```
src/
├── app/
│   ├── admin/          ← Panel admin (roles: admin, tecnico)
│   ├── auth/callback/  ← OAuth callback de Supabase
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/
│   └── page.jsx        ← Landing + cálculos
├── components/
│   ├── ui/             ← shadcn/ui components
│   ├── AuthLayout.jsx
│   ├── ProtectedRoute.jsx
│   └── ...
└── lib/
    ├── AuthContext.jsx  ← Supabase auth + roles
    └── utils.js
```

---

## Créditos
Desarrollado por **Sibel Sama** · CalJob Assist © 2026
