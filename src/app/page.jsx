"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
// import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Scale, Calculator, CalendarClock, BookOpen, FileText,
  Shield, TrendingUp, Lock, CheckCircle2, Loader2,
  Building2, Users, UserCircle, ChevronRight, Phone, Mail
} from "lucide-react";

const INDICADOR_LABELS = {
  uf: "UF", utm: "UTM", ipc: "IPC", sueldo_minimo: "Sueldo Mín.", dolar: "Dólar", euro: "Euro"
};

export default function Home() {
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  const handleCheckout = async (planKey) => {
    if (window.self !== window.top) {
      alert('El pago solo está disponible desde la aplicación publicada. Por favor, abre la app en una pestaña completa.');
      return;
    }
    setCheckoutLoading(planKey);
    // try {
    //   const response = await base44.functions.invoke('createCheckout', {
    //     plan: planKey,
    //     success_url: window.location.origin + '/?success=1',
    //     cancel_url: window.location.origin + '/',
    //   });
    //   if (response.data?.url) window.location.href = response.data.url;
    // } catch (e) {
    //   alert('Error al iniciar el pago: ' + e.message);
    // } finally {
    //   setCheckoutLoading(null);
    // }
  };

  useEffect(() => {
    setLoading(false)
    // base44.entities.EconomicIndicator.list('-date', 6)
    //   .then(d => setIndicators(d || []))
    //   .catch(() => {})
    //   .finally(() => setLoading(false));
  }, []);

  const servicios = [
    { icon: Calculator, titulo: "Motor de Cálculo Laboral", desc: "Indemnización por años de servicio, aviso previo y feriado proporcional con topes legales de 90 UF y 11 años (Arts. 162, 163, 73 CT)." },
    { icon: CalendarClock, titulo: "Gestor de Plazos Hábiles", desc: "Cómputo de plazos legales en días hábiles excluyendo feriados chilenos. Citaciones, mediación colectiva y órdenes de fiscalización." },
    { icon: TrendingUp, titulo: "Indicadores Económicos", desc: "Sincronización diaria de UF, UTM, IPC y sueldo mínimo desde el Banco Central de Chile vía mindicador.cl." },
    { icon: BookOpen, titulo: "Biblioteca Normativa", desc: "Búsqueda por nombre, código, tema, número, fecha, categoría o contenido. Código del Trabajo, Ley Karin, Ley 16.744 y más." },
    { icon: FileText, titulo: "Informes PDF Certificados", desc: "Documentos con firma digital de la plataforma, fecha de vigencia y base legal aplicada para respaldar acuerdos oficialmente." },
    { icon: Shield, titulo: "Privacidad y Cumplimiento", desc: "Aislamiento multi-tenant por empresa. Cumplimiento Ley 19.628. Trazabilidad completa mediante audit log inmutable." },
  ];

  const planes = [
    {
      icon: UserCircle,
      nombre: "Personal",
      subtitulo: "Para trabajadores y empleadores",
      precio: "$15.000",
      key: "personal",
      features: ["Cálculos laborales ilimitados", "Biblioteca legal completa", "Informes PDF firmados", "1 usuario"],
      destacado: false,
    },
    {
      icon: Users,
      nombre: "Equipo",
      subtitulo: "Para mediadores y estudios jurídicos",
      precio: "$49.000",
      key: "team",
      features: ["Todo lo del plan Personal", "Gestión de casos y mediaciones", "Hasta 10 usuarios", "Auditoría y trazabilidad", "Soporte prioritario"],
      destacado: true,
    },
    {
      icon: Building2,
      nombre: "Empresarial",
      subtitulo: "Para entidades públicas y grandes empresas",
      precio: "$149.000",
      key: "enterprise",
      features: ["Todo lo del plan Equipo", "Multi-tenant aislado por empresa", "Usuarios ilimitados", "API e integraciones", "Cumplimiento normativo certificado", "Onboarding y capacitación dedicada"],
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
              <p className="text-xs text-blue-200 leading-none mt-1 tracking-wider uppercase">Controla tu vida legal y laboral informado</p>
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

      {/* Franja de identidad secundaria */}
      <div className="bg-primary/90 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2">
          <span className="text-[11px] text-blue-200 tracking-widest uppercase">República de Chile</span>
          <span className="text-blue-400">·</span>
          <span className="text-[11px] text-blue-200 tracking-widest uppercase">Ministerio del Trabajo y Previsión Social</span>
          <span className="text-blue-400">·</span>
          <span className="text-[11px] text-blue-200 tracking-widest uppercase">Dirección del Trabajo</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-secondary to-white py-16 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-accent rounded-full" />
              <span className="text-xs font-semibold text-accent tracking-widest uppercase">Plataforma Oficial de Gestión Laboral</span>
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-primary leading-tight mb-5">
              Acuerdos laborales mejor calculados y respaldados
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-8">
              Software profesional de gestión de trámites, mediaciones, cálculos legales y biblioteca normativa
              para la Dirección del Trabajo, mediadores, empleadores y trabajadores de Chile.
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
            <div className="bg-primary rounded-sm p-6 text-white">
              <p className="text-xs text-blue-300 uppercase tracking-widest mb-4 font-semibold">Indicadores económicos vigentes</p>
              {loading ? (
                <div className="flex items-center gap-2 text-blue-200 text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cargando indicadores...
                </div>
              ) : indicators.length === 0 ? (
                <p className="text-blue-200 text-sm py-2">Sincronización pendiente — ejecutar como administrador</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {indicators.map(ind => (
                    <div key={ind.id} className="bg-white/10 rounded-sm p-3 text-center">
                      <p className="text-[10px] text-blue-300 uppercase tracking-wide">{INDICADOR_LABELS[ind.indicator_type] || ind.indicator_type}</p>
                      <p className="font-mono font-bold text-white text-sm mt-1">${ind.value?.toLocaleString('es-CL')}</p>
                      <p className="text-[9px] text-blue-400 mt-0.5">{ind.date}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[10px] text-blue-400">Fuente: Banco Central de Chile · mindicador.cl · Actualización diaria automática</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-10 border-l-4 border-primary pl-4">
            <h3 className="font-heading text-2xl font-bold text-primary">Módulos del sistema</h3>
            <p className="text-muted-foreground text-sm mt-1">Microservicios especializados en legislación laboral chilena</p>
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

      {/* Cumplimiento normativo */}
      <section className="py-14 bg-secondary border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="font-heading text-xl font-bold text-primary">Seguridad, privacidad y cumplimiento normativo</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { titulo: "Ley 19.628", desc: "Protección de datos personales" },
              { titulo: "Aislamiento RUT", desc: "Multi-tenant por empresa" },
              { titulo: "CORS + TLS", desc: "Cifrado en tránsito" },
              { titulo: "Audit Log", desc: "Trazabilidad inmutable" },
              { titulo: "Roles y permisos", desc: "Acceso por nivel jerárquico" },
              { titulo: "Datos segregados", desc: "Sin acceso cruzado entre empresas" },
              { titulo: "PDFs certificados", desc: "Firmados con fecha de vigencia" },
              { titulo: "Plazos hábiles", desc: "Calendario feriados chilenos" },
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
            <p className="text-muted-foreground text-sm mt-1">Para trabajadores, mediadores, empleadores y entidades públicas</p>
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
            Todos los planes incluyen período de prueba de 14 días sin cargo · Facturación en CLP · Pago con tarjeta de crédito o débito
          </p>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-14 bg-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold mb-3">Propuesta institucional</p>
              <h3 className="font-heading text-2xl font-bold text-white mb-3">¿Es usted autoridad o entidad pública?</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Ofrecemos planes especiales para la Dirección del Trabajo, Inspectorías del Trabajo y entidades del Estado.
                Contáctenos para coordinar una demostración técnica y propuesta a medida.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 bg-white/10 rounded-sm px-4 py-3">
                <Mail className="w-4 h-4 text-blue-200 flex-shrink-0" />
                <span className="text-blue-100 text-sm">contacto@caljobassist.cl</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-sm px-4 py-3">
                <Phone className="w-4 h-4 text-blue-200 flex-shrink-0" />
                <span className="text-blue-100 text-sm">+56 2 2000 0000</span>
              </div>
              <Button className="bg-accent hover:bg-red-700 text-white rounded-sm w-full mt-1">
                Solicitar propuesta institucional <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
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
                <p className="text-[10px] text-blue-400">Controla tu vida legal y laboral informado</p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-[11px] text-blue-300">Conforme a la legislación laboral de la República de Chile</p>
              <p className="text-[10px] text-blue-500 mt-0.5">
                Código del Trabajo · Ley 19.628 · Ley 21.643 (Karin) · Ley 16.744
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