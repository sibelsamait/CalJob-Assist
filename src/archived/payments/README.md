# Pagos archivados

Este directorio conserva la referencia de lo que se retiró del árbol activo para que el flujo de pagos pueda reintroducirse más adelante sin confusión.

Rutas y módulos retirados:
- `src/app/(billing)/checkout/page.jsx`
- `src/app/(billing)/pago/page.jsx`
- `src/app/(billing)/planes/page.jsx`
- `src/app/(billing)/portal/page.jsx`
- `src/app/(billing)/success/page.jsx`
- `src/app/api/payments/**`
- `src/app/payment-links/paypal/[id]/route.js`
- `src/components/billing/**`
- `src/components/dashboards/PlanOwnerDashboard.jsx`
- `src/components/dashboards/TeamMemberDashboard.jsx`
- `src/components/dashboards/TecnicoDashboard.jsx`
- `src/app/(dashboard)/configuracion/equipo/page.jsx`
- `src/app/api/team/route.js`

Estado actual:
- La app funciona sin planes, checkout ni webhooks de pago.
- Los usuarios registrados entran con acceso completo.
- Solo quedan roles funcionales `admin` y `user`.
