# CalJob Assist
**"Controla tu vida legal y laboral informado"**

Plataforma SaaS de cálculo laboral chileno para trabajadores, empleadores, mediadores y entidades públicas.

---

## Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend/Auth/DB**: Supabase (PostgreSQL + RLS + Storage)
- **Pagos**: Stripe
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
