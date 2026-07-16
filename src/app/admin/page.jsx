"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, supabase } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Users, CreditCard, TicketCheck, FileText,
  LogOut, ChevronRight, Search, RefreshCw, CheckCircle2,
  XCircle, Clock, AlertTriangle, Download, Eye, Loader2,
  BarChart3, TrendingUp, DollarSign, HeadphonesIcon,
  ShieldCheck, Settings2, RotateCcw
} from "lucide-react";

// ─── PDF generator (sin dependencias externas pesadas) ───────────────────────
function generateTicketPDF(ticket, company) {
  const lines = [
    `TICKET DE SOPORTE - CalJob Assist`,
    `${"═".repeat(50)}`,
    ``,
    `ID Ticket:     #${ticket.id?.slice(0, 8).toUpperCase()}`,
    `Empresa:       ${company?.name ?? "—"}`,
    `Solicitante:   ${ticket.user_email ?? "—"}`,
    `Asunto:        ${ticket.subject}`,
    `Estado:        ${ticket.status}`,
    `Prioridad:     ${ticket.priority}`,
    `Creado:        ${new Date(ticket.created_at).toLocaleString("es-CL")}`,
    ``,
    `DESCRIPCIÓN:`,
    `${"─".repeat(50)}`,
    ticket.description,
    ``,
    `RESOLUCIÓN:`,
    `${"─".repeat(50)}`,
    ticket.resolution ?? "(sin resolución aún)",
    ``,
    `${"═".repeat(50)}`,
    `Generado por CalJob Assist — Controla tu vida legal y laboral informado`,
    `Fecha de generación: ${new Date().toLocaleString("es-CL")}`,
  ].join("\n");

  const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ticket-${ticket.id?.slice(0, 8)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-700",
  suspended: "bg-red-100 text-red-800",
  trial: "bg-blue-100 text-blue-800",
};
const TICKET_COLORS = {
  open: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-700",
};
const PRIORITY_COLORS = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

function StatCard({ icon: Icon, label, value, sub, color = "text-primary" }) {
  return (
    <div className="bg-white border border-border rounded-lg p-5 flex gap-4 items-start">
      <div className={`mt-1 ${color}`}><Icon className="w-5 h-5" /></div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── TABS ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "companies", label: "Empresas", icon: Building2 },
  { id: "subscriptions", label: "Suscripciones", icon: CreditCard },
  { id: "tickets", label: "Tickets", icon: TicketCheck },
  { id: "users", label: "Usuarios", icon: Users },
];

// ─── MOCK DATA (reemplazar con queries Supabase reales) ───────────────────────
const MOCK_COMPANIES = [
  { id: "1", name: "Constructora Silva SpA", rut: "76.123.456-7", plan: "enterprise", status: "active", users_count: 12, contact_email: "admin@silva.cl", created_at: "2024-03-15T10:00:00Z" },
  { id: "2", name: "Estudio Jurídico Morales", rut: "12.345.678-9", plan: "team", status: "active", users_count: 4, contact_email: "morales@estudio.cl", created_at: "2024-05-01T10:00:00Z" },
  { id: "3", name: "Transporte Andino Ltda.", rut: "77.654.321-0", plan: "personal", status: "trial", users_count: 1, contact_email: "rrhh@andino.cl", created_at: "2024-07-10T10:00:00Z" },
  { id: "4", name: "Clínica Santa Lucía", rut: "96.111.222-3", plan: "enterprise", status: "suspended", users_count: 0, contact_email: "sistemas@santalucia.cl", created_at: "2023-11-20T10:00:00Z" },
];

const MOCK_SUBS = [
  { id: "s1", company_id: "1", company_name: "Constructora Silva SpA", plan: "enterprise", amount: 149000, status: "paid", period: "Jul 2026", paid_at: "2026-07-01T12:00:00Z" },
  { id: "s2", company_id: "2", company_name: "Estudio Jurídico Morales", plan: "team", amount: 49000, status: "paid", period: "Jul 2026", paid_at: "2026-07-02T09:00:00Z" },
  { id: "s3", company_id: "3", company_name: "Transporte Andino Ltda.", plan: "personal", amount: 0, status: "trial", period: "Jul 2026", paid_at: null },
  { id: "s4", company_id: "4", company_name: "Clínica Santa Lucía", plan: "enterprise", amount: 149000, status: "refunded", period: "Jun 2026", paid_at: "2026-06-01T12:00:00Z" },
];

const MOCK_TICKETS = [
  { id: "t1a2b3c4-0000", company_id: "1", user_email: "admin@silva.cl", subject: "No puedo exportar PDF de finiquito", description: "Al intentar exportar el finiquito del trabajador RUT 12.111.222-3, el sistema muestra error 500.", status: "open", priority: "high", resolution: null, created_at: "2026-07-15T14:22:00Z" },
  { id: "t2b3c4d5-0000", company_id: "2", user_email: "morales@estudio.cl", subject: "Cálculo de feriado proporcional incorrecto", description: "El sistema calcula 7.5 días pero según nuestro abogado deberían ser 8.", status: "in_progress", priority: "medium", resolution: null, created_at: "2026-07-13T09:00:00Z" },
  { id: "t3c4d5e6-0000", company_id: "1", user_email: "contabilidad@silva.cl", subject: "Solicitud de factura julio", description: "Necesitamos la boleta electrónica por el pago de julio.", status: "resolved", priority: "low", resolution: "Factura enviada al correo registrado el 2 de julio.", created_at: "2026-07-03T11:00:00Z" },
];

const MOCK_USERS = [
  { id: "u1", full_name: "Carlos Silva", email: "admin@silva.cl", role: "user", plan: "enterprise", company: "Constructora Silva SpA", status: "active", created_at: "2024-03-15T10:00:00Z" },
  { id: "u2", full_name: "María Morales", email: "morales@estudio.cl", role: "user", plan: "team", company: "Estudio Jurídico Morales", status: "active", created_at: "2024-05-01T10:00:00Z" },
  { id: "u3", full_name: "Pedro Técnico", email: "pedro@caljob.cl", role: "tecnico", plan: "internal", company: "CalJob Assist", status: "active", created_at: "2024-01-01T10:00:00Z" },
  { id: "u4", full_name: "Ana Admin", email: "ana@caljob.cl", role: "admin", plan: "internal", company: "CalJob Assist", status: "active", created_at: "2024-01-01T10:00:00Z" },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminPanel() {
  const { user, profile, isStaff, isAdmin, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolution, setResolution] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isStaff) router.replace("/");
  }, [isLoading, isStaff, router]);

  const handleSignOut = async () => { await signOut(); router.replace("/login"); };

  const handleSaveResolution = async () => {
    if (!selectedTicket || !resolution) return;
    setSaving(true);
    // En producción: await supabase.from('tickets').update({resolution, status:'resolved'}).eq('id', selectedTicket.id)
    setTimeout(() => {
      setSaving(false);
      setSelectedTicket(null);
      setResolution("");
      alert("Resolución guardada (demo). En producción se actualiza en Supabase.");
    }, 800);
  };

  if (isLoading || !isStaff) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  const filteredCompanies = MOCK_COMPANIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.rut.includes(search)
  );
  const filteredTickets = MOCK_TICKETS.filter(t =>
    t.subject.toLowerCase().includes(search.toLowerCase()) || t.user_email.includes(search)
  );

  const stats = {
    companies: MOCK_COMPANIES.filter(c => c.status === "active").length,
    mrr: MOCK_SUBS.filter(s => s.status === "paid").reduce((a, b) => a + b.amount, 0),
    openTickets: MOCK_TICKETS.filter(t => t.status === "open").length,
    totalUsers: MOCK_USERS.filter(u => u.role === "user").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      {/* Header */}
      <div className="h-1.5 bg-accent w-full" />
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-white/10 border border-white/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-widest">Panel de</p>
            <p className="font-bold text-base leading-tight">Administración CalJob</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-white/20 text-white border-0 text-xs">
            {isAdmin ? "Administrador" : "Técnico"}
          </Badge>
          <span className="text-sm text-white/80 hidden sm:block">{profile?.full_name ?? user?.email}</span>
          <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-1" /> Salir
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-border rounded-lg p-1 mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSearch(""); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors
                ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Building2} label="Empresas activas" value={stats.companies} sub="de 4 registradas" />
              <StatCard icon={DollarSign} label="MRR estimado" value={`$${stats.mrr.toLocaleString("es-CL")}`} sub="pesos chilenos" color="text-green-600" />
              <StatCard icon={TicketCheck} label="Tickets abiertos" value={stats.openTickets} sub="requieren atención" color="text-amber-600" />
              <StatCard icon={Users} label="Usuarios activos" value={stats.totalUsers} sub="cuentas de cliente" />
            </div>

            <div className="bg-white border border-border rounded-lg p-5">
              <h3 className="font-semibold text-foreground mb-4">Actividad reciente</h3>
              <div className="space-y-3">
                {MOCK_TICKETS.slice(0, 3).map(t => (
                  <div key={t.id} className="flex items-start gap-3 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${TICKET_COLORS[t.status]}`}>{t.status}</span>
                    <span className="text-foreground">{t.subject}</span>
                    <span className="text-muted-foreground ml-auto whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString("es-CL")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-900">Nota de implementación</p>
                <p className="text-amber-700 mt-1">Este panel usa datos de demo. Conecta las tablas de Supabase (<code className="bg-amber-100 px-1 rounded">companies</code>, <code className="bg-amber-100 px-1 rounded">subscriptions</code>, <code className="bg-amber-100 px-1 rounded">tickets</code>) para mostrar datos reales. Ver <strong>supabase-schema.sql</strong> incluido.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── COMPANIES ── */}
        {tab === "companies" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar por nombre o RUT…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10" />
              </div>
            </div>
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {["Empresa", "RUT", "Plan", "Usuarios", "Estado", "Acciones"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCompanies.map(c => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.contact_email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.rut}</td>
                      <td className="px-4 py-3 capitalize">{c.plan}</td>
                      <td className="px-4 py-3 text-center">{c.users_count}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {c.status === "suspended" ? (
                            <Button size="sm" variant="outline" className="h-7 text-xs text-green-700 border-green-300 hover:bg-green-50">
                              <CheckCircle2 className="w-3 h-3 mr-1" />Reactivar
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="h-7 text-xs text-red-700 border-red-300 hover:bg-red-50">
                              <XCircle className="w-3 h-3 mr-1" />Suspender
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SUBSCRIPTIONS ── */}
        {tab === "subscriptions" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-2">
              <StatCard icon={CheckCircle2} label="Pagos recibidos" value={MOCK_SUBS.filter(s => s.status === "paid").length} color="text-green-600" />
              <StatCard icon={Clock} label="En trial" value={MOCK_SUBS.filter(s => s.status === "trial").length} color="text-blue-600" />
              <StatCard icon={RotateCcw} label="Devoluciones" value={MOCK_SUBS.filter(s => s.status === "refunded").length} color="text-red-600" />
            </div>
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {["Empresa", "Plan", "Período", "Monto", "Estado", "Fecha pago", "Acciones"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_SUBS.map(s => (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{s.company_name}</td>
                      <td className="px-4 py-3 capitalize">{s.plan}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.period}</td>
                      <td className="px-4 py-3 font-mono">{s.amount > 0 ? `$${s.amount.toLocaleString("es-CL")}` : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          s.status === "paid" ? "bg-green-100 text-green-800" :
                          s.status === "trial" ? "bg-blue-100 text-blue-800" :
                          "bg-red-100 text-red-800"
                        }`}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {s.paid_at ? new Date(s.paid_at).toLocaleDateString("es-CL") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {s.status === "paid" && isAdmin && (
                          <Button size="sm" variant="outline" className="h-7 text-xs text-orange-700 border-orange-300 hover:bg-orange-50">
                            <RotateCcw className="w-3 h-3 mr-1" />Devolver
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TICKETS ── */}
        {tab === "tickets" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar tickets…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10" />
            </div>

            {/* Detail modal */}
            {selectedTicket && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">#{selectedTicket.id.slice(0, 8).toUpperCase()}</p>
                      <h3 className="font-bold text-foreground text-lg mt-0.5">{selectedTicket.subject}</h3>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[selectedTicket.priority]}`}>{selectedTicket.priority}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${TICKET_COLORS[selectedTicket.status]}`}>{selectedTicket.status}</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">De: {selectedTicket.user_email}</div>
                  <div className="bg-muted/40 rounded-lg p-3 text-sm">{selectedTicket.description}</div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Resolución / Respuesta</label>
                    <textarea
                      className="w-full border border-border rounded-lg p-3 text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Escribe la resolución o respuesta al ticket…"
                      value={resolution}
                      onChange={e => setResolution(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => generateTicketPDF(selectedTicket, MOCK_COMPANIES.find(c => c.id === selectedTicket.company_id))}>
                      <Download className="w-4 h-4 mr-1" />PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedTicket(null); setResolution(""); }}>Cancelar</Button>
                    <Button size="sm" onClick={handleSaveResolution} disabled={saving || !resolution}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" />Guardar</>}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {["ID", "Asunto", "Usuario", "Prioridad", "Estado", "Fecha", "Acciones"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTickets.map(t => (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{t.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3 font-medium max-w-[200px] truncate">{t.subject}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{t.user_email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${TICKET_COLORS[t.status]}`}>{t.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(t.created_at).toLocaleDateString("es-CL")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Ver detalle" onClick={() => { setSelectedTicket(t); setResolution(t.resolution ?? ""); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Descargar PDF" onClick={() => generateTicketPDF(t, MOCK_COMPANIES.find(c => c.id === t.company_id))}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {["Nombre", "Email", "Rol", "Plan", "Empresa", "Estado"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_USERS.map(u => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.full_name}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          u.role === "admin" ? "bg-purple-100 text-purple-800" :
                          u.role === "tecnico" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-700"
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 capitalize text-xs">{u.plan}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{u.company}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">{u.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!isAdmin && (
              <p className="text-xs text-muted-foreground text-center">Solo los administradores pueden cambiar roles de usuario.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
