"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SearchHistory from "@/components/SearchHistory";
import {
  Scale, Calculator, CalendarClock, BookOpen, FileText,
  Shield, TrendingUp, Lock, CheckCircle2, Loader2,
  Building2, Users, UserCircle, ChevronRight, Sparkles,
  Headphones
} from "lucide-react";

const INDICADOR_LABELS = {
  uf: "UF", utm: "UTM", ipc: "IPC", sueldo_minimo: "Sueldo Mín.", dolar: "Dólar", euro: "Euro"
};

export default function Home() {
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [entityType, setEntityType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState('');

  const ENTITY_TYPES = [
    { value: "natural_person", label: "Persona natural" },
    { value: "private_company", label: "Empresa privada" },
    { value: "public_entity", label: "Organismo público" },
  ];

  const PAYMENT_METHOD_OPTIONS = {
    natural_person: [
      { value: "webpay_plus", label: "Webpay Plus" },
      { value: "mercado_pago", label: "Mercado Pago" },
      { value: "flow", label: "Flow" },
      { value: "khipu", label: "Khipu" },
      { value: "paypal", label: "PayPal" },
    ],
    private_company: [
      { value: "transferencia", label: "Transferencia bancaria" },
      { value: "factura_dte", label: "Factura Electrónica (DTE)" },
      { value: "orden_compra", label: "Orden de Compra" },
      { value: "webpay", label: "Webpay (opcional)" },
    ],
    public_entity: [
      { value: "factura_dte", label: "Factura Electrónica (DTE)" },
      { value: "orden_compra", label: "Orden de Compra" },
      { value: "transferencia", label: "Transferencia bancaria" },
      { value: "tgr_sigfe_dipres", label: "TGR / SIGFE / DIPRES" },
    ],
  };

  useEffect(() => {
    setLoading(false);
    if (!entityType) {
      setPaymentMethod("");
      return;
    }
    const methods = PAYMENT_METHOD_OPTIONS[entityType] || [];
    setPaymentMethod(methods[0]?.value || "");
  }, [entityType]);

  const handleCheckout = async (planKey) => {
    if (typeof window !== 'undefined' && window.self !== window.top) {
      alert('El pago solo está disponible desde la aplicación publicada. Por favor, abre la app en una pestaña completa.');
      return;
    }

    if (!entityType) {
      setCheckoutMessage('Seleccione el tipo de entidad antes de continuar.');
      return;
    }

    if (!paymentMethod) {
      setCheckoutMessage('Seleccione un método de pago válido.');
      return;
    }

    setCheckoutMessage("");
    setCheckoutLoading(planKey);

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey, entityType, paymentMethod }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || 'Error al iniciar el pago.');
      }

      if (result.checkoutUrl) {
        if (typeof window !== 'undefined') {
          window.location.href = result.checkoutUrl;
        }
        return;
      }

      setCheckoutMessage(result.message || 'Tu solicitud se ha registrado correctamente.');
    } catch (error) {
      setCheckoutMessage(error?.message || 'Error en la solicitud de pago.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const servicios = [
    { icon: Calculator, titulo: "Cálculos y asesoría operativa", desc: "Automatiza estimaciones y pasos de gestión para que tus equipos trabajen con mayor rapidez y consistencia." },
    { icon: CalendarClock, titulo: "Seguimiento de pagos y renovaciones", desc: "Mantén el control de suscripciones, recordatorios y estados de cobro sin depender de procesos manuales." },
    { icon: TrendingUp, titulo: "Reportes y métricas", desc: "Visualiza el estado de tus clientes, ingresos y salud del negocio desde un panel claro y accionable." },
    { icon: BookOpen, titulo: "Biblioteca de recursos", desc: "Centraliza guías, políticas y contenidos de ayuda para tus usuarios y equipo interno." },
    { icon: FileText, titulo: "Documentación y tickets", desc: "Genera documentos y gestiona solicitudes de soporte desde un mismo entorno organizado." },
    { icon: Shield, titulo: "Seguridad y respaldo", desc: "Protege información sensible con roles, control de acceso y trazabilidad para el equipo." },
  ];

  const planes = [
    {
      icon: UserCircle,
      nombre: "Personal",
      subtitulo: "Ideal para emprendedores y equipos pequeños",
      precio: "$15.000",
      key: "personal",
      imageUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
      features: ["Acceso inmediato tras el pago", "Prueba gratuita de 1 día disponible", "Gestión simple de usuarios y documentos", "Soporte básico"],
      destacado: false,
    },
    {
      icon: Users,
      nombre: "Equipo",
      subtitulo: "Para equipos que necesitan más colaboración",
      precio: "$49.000",
      key: "team",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
      features: ["Todo lo del plan Personal", "Colaboración entre usuarios", "Automatizaciones y seguimiento", "Soporte prioritario"],
      destacado: true,
    },
    {
      icon: Building2,
      nombre: "Empresarial",
      subtitulo: "Para compañías con procesos más complejos",
      precio: "$149.000",
      key: "enterprise",
      imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
      features: ["Todo lo del plan Equipo", "Integraciones y administración avanzada", "Escalabilidad para múltiples áreas", "Atención dedicada"],
      destacado: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white font-body text-foreground">

      {/* Franja superior institucional */}
      <div className="h-1.5 bg-accent w-full" />

      {/* Header institucional */}
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded bg-white/10 flex items-center justify-center border border-white/20">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-white leading-none tracking-wide">CalJob Assist</h1>
              <p className="text-xs text-blue-200 leading-none mt-1 tracking-wider uppercase">Plataforma para operar con orden y crecimiento</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#servicios" className="text-sm text-blue-100 hover:text-white transition-colors">Servicios</a>
            <a href="#planes" className="text-sm text-blue-100 hover:text-white transition-colors">Planes</a>
            <a href="#contacto" className="text-sm text-blue-100 hover:text-white transition-colors">Contacto</a>
            <Link href="/login">
              <Button size="sm" className="bg-accent hover:bg-red-700 text-white border-0 rounded-sm">
                Ingresar
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="bg-primary/90 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2">
          <span className="text-[11px] text-blue-200 tracking-widest uppercase">Servicio particular</span>
          <span className="text-blue-400">·</span>
          <span className="text-[11px] text-blue-200 tracking-widest uppercase">Diseñado para crecer</span>
          <span className="text-blue-400">·</span>
          <span className="text-[11px] text-blue-200 tracking-widest uppercase">Soporte y pagos claros</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-secondary to-white py-16 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-accent rounded-full" />
              <span className="text-xs font-semibold text-accent tracking-widest uppercase">Servicio profesional y escalable</span>
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-primary leading-tight mb-5">
              Tu operación más ordenada, sin perder agilidad
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-8">
              CalJob Assist reúne pagos, suscripciones, soporte y documentación en una experiencia clara para equipos que quieren crecer con control.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-sm px-6">
                Solicitar demostración <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5 rounded-sm px-6"
                onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}>
                Ver planes
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-primary rounded-sm p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-blue-200" />
                <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold">Producto en una sola vista</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
                alt="Equipo trabajando en una plataforma de gestión"
                className="w-full h-64 object-cover rounded-lg border border-white/20"
              />
              <div className="mt-4 rounded-lg border border-white/10 bg-white/10 p-4 text-sm text-blue-100">
                <p className="font-semibold text-white">Pensado para ofrecer servicio con claridad.</p>
                <p className="mt-2">Tus clientes pueden contratar, pagar y recibir soporte desde una experiencia simple y profesional.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.36em] text-muted-foreground">Paso 1</p>
                    <h3 className="text-xl font-semibold text-foreground">Selecciona el tipo de entidad</h3>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {ENTITY_TYPES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setEntityType(option.value)}
                      className={`rounded-2xl border p-4 text-left transition ${entityType === option.value ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-white hover:border-primary'}`}>
                      <p className="text-sm font-semibold text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">Ajustaremos el método de pago al flujo correspondiente.</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.36em] text-muted-foreground">Paso 2</p>
                    <h3 className="text-xl font-semibold text-foreground">Método de pago recomendado</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Los métodos se adaptan según tu tipo de entidad. Elige uno para activar el plan con el flujo correspondiente.</p>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Método de pago</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={!entityType}
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                    >
                      <option value="">{entityType ? 'Selecciona un método de pago' : 'Selecciona el tipo de entidad primero'}</option>
                      {(PAYMENT_METHOD_OPTIONS[entityType] || []).map((method) => (
                        <option key={method.value} value={method.value}>{method.label}</option>
                      ))}
                    </select>
                  </div>
                  {checkoutMessage ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{checkoutMessage}</div>
                  ) : null}
                </div>
              </div>
            </div>
            <div>
              <SearchHistory />
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-10 border-l-4 border-primary pl-4">
            <h3 className="font-heading text-2xl font-bold text-primary">Qué puedes ofrecer con CalJob Assist</h3>
            <p className="text-muted-foreground text-sm mt-1">Una propuesta de servicio más simple, moderna y escalable</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {servicios.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white p-6 hover:bg-secondary/40 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="font-semibold text-foreground text-sm">{s.titulo}</h4>
                        <span className="text-[9px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-sm font-medium uppercase tracking-wide">Activo</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-14 bg-secondary border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="font-heading text-xl font-bold text-primary">Confianza, orden y soporte continuo</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { titulo: "Seguridad", desc: "Roles y permisos para cada perfil" },
              { titulo: "Trazabilidad", desc: "Historial claro de acciones y cambios" },
              { titulo: "Gestión simple", desc: "Todo centralizado para tus equipos" },
              { titulo: "Soporte", desc: "Tickets y respuestas organizadas" },
              { titulo: "Pagos", desc: "Cobros automáticos y suscripciones controladas" },
              { titulo: "Escalabilidad", desc: "Se adapta a más usuarios y nuevas áreas" },
              { titulo: "Profesionalismo", desc: "Experiencia de marca moderna y consistente" },
              { titulo: "Disponibilidad", desc: "Atención más rápida para tus clientes" },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-border p-4 rounded-sm">
                <p className="text-xs font-bold text-primary uppercase tracking-wide">{item.titulo}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-10 border-l-4 border-accent pl-4">
            <h3 className="font-heading text-2xl font-bold text-primary">Planes de suscripción</h3>
            <p className="text-muted-foreground text-sm mt-1">Planes pensados para tus distintos niveles de crecimiento</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planes.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <div key={i} className={`border rounded-sm flex flex-col ${plan.destacado ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
                  {plan.destacado && (
                    <div className="bg-primary text-white text-center text-[11px] font-semibold py-1.5 tracking-widest uppercase rounded-t-sm">
                      Plan más solicitado
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-foreground leading-none">{plan.nombre}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{plan.subtitulo}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <img src={plan.imageUrl} alt={`${plan.nombre} de CalJob Assist`} className="h-36 w-full rounded-xl object-cover border border-border" />
                    </div>
                    <div className="mb-5 pb-5 border-b border-border">
                      <span className="text-3xl font-bold text-primary font-mono">{plan.precio}</span>
                      <span className="text-muted-foreground text-sm"> / mes + IVA</span>
                    </div>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full rounded-sm ${plan.destacado ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-white border-primary text-primary hover:bg-primary/5'}`}
                      variant={plan.destacado ? "default" : "outline"}
                      disabled={checkoutLoading === plan.key}
                      onClick={() => handleCheckout(plan.key)}
                    >
                      {checkoutLoading === plan.key
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
                        : "Suscribirse"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Todos los planes incluyen período de prueba gratis de 1 día · Facturación en CLP · Pago con Webpay Plus, Mercado Pago, Flow, Khipu o PayPal
          </p>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-14 bg-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
            <div>
              <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold mb-3">Contacto</p>
              <h3 className="font-heading text-2xl font-bold text-white mb-3">¿Quieres hablar con nosotros?</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Envíanos tu consulta y el equipo responderá por correo. También puedes usar esta misma vía para abrir un ticket de soporte o solicitar información comercial.
              </p>
              <div className="mt-6 rounded-xl border border-white/15 bg-white/10 p-4 text-sm text-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Headphones className="w-4 h-4 text-blue-200" />
                  <span className="font-semibold text-white">Atención por ticket</span>
                </div>
                <p>Las solicitudes se registran automáticamente y pueden ser contestadas desde el panel de administración.</p>
              </div>
            </div>
            <form
              className="rounded-2xl bg-white p-6 shadow-xl text-foreground space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setContactStatus('');
                try {
                  const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(contactForm),
                  });
                  const result = await response.json();
                  if (!response.ok) throw new Error(result?.error || 'No se pudo enviar tu mensaje');
                  setContactStatus('Tu mensaje fue recibido. Pronto nos pondremos en contacto.');
                  setContactForm({ name: '', email: '', message: '' });
                } catch (error) {
                  setContactStatus(error?.message || 'Ocurrió un error al enviar el formulario');
                }
              }}
            >
              <div>
                <label className="text-sm font-medium text-foreground">Nombre</label>
                <input
                  required
                  value={contactForm.name}
                  onChange={(event) => setContactForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Correo</label>
                <input
                  required
                  type="email"
                  value={contactForm.email}
                  onChange={(event) => setContactForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Mensaje</label>
                <textarea
                  required
                  rows="5"
                  value={contactForm.message}
                  onChange={(event) => setContactForm((prev) => ({ ...prev, message: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              {contactStatus ? <p className="text-sm text-primary">{contactStatus}</p> : null}
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-sm">
                Enviar mensaje <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary/95 border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-blue-300" />
              <div>
                <p className="text-sm font-heading font-bold text-white">CalJob Assist</p>
                <p className="text-[10px] text-blue-400">Plataforma para operar con orden y crecimiento</p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-[11px] text-blue-300">Servicio particular orientado a claridad, soporte y pagos</p>
              <p className="text-[10px] text-blue-500 mt-0.5">
                Suscripciones · Tickets · Cobros · Atención
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-[10px] text-blue-500">
              © {new Date().getFullYear()} CalJob Assist · Información vigente a la fecha de generación · Versión 1.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}