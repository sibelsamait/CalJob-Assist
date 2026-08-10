"use client";

<<<<<<< HEAD
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { HeroSection } from '@/components/landing/HeroSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
=======
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SearchHistory from "@/components/SearchHistory";
import { useAuth } from "@/lib/AuthContext";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
  Scale, Calculator, CalendarClock, BookOpen, FileText,
  Shield, TrendingUp, Lock, CheckCircle2, Loader2,
  Building2, Users, UserCircle, ChevronRight, Phone, Mail
} from "lucide-react";

const INDICADOR_LABELS = { uf: "UF", utm: "UTM", ipc: "IPC", sueldo_minimo: "Sueldo Mín.", dolar: "Dólar", euro: "Euro" };
const PREFERRED_INDICATORS = ["uf", "utm", "ipc", "dolar", "euro"];

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

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityType, setEntityType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const handleSelectPlan = useCallback((plan) => {
    if (!isAuthenticated) {
      const checkoutPath = `/billing/checkout?plan=${encodeURIComponent(plan)}`;
      router.push(`/login?redirect=${encodeURIComponent(checkoutPath)}`);
      return;
    }
    router.push(`/billing/checkout?plan=${encodeURIComponent(plan)}`);
  }, [isAuthenticated, router]);

  useEffect(() => {
    let mounted = true;
    const fetchIndicators = async () => {
      try {
        const response = await fetch('https://mindicador.cl/api');
        if (!response.ok) {
          throw new Error('No se pudieron cargar los indicadores');
        }

        const data = await response.json();
        const parsedIndicators = PREFERRED_INDICATORS
          .filter((key) => data?.[key])
          .map((key) => ({
            id: key,
            indicator_type: key,
            value: data[key].valor,
            date: data[key].fecha,
          }));

        if (mounted) setIndicators(parsedIndicators);
      } catch (error) {
        console.error('Error loading indicators:', error);
        if (mounted) setIndicators([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchIndicators();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <HeroSection isAuthenticated={isAuthenticated} onSelectPlan={handleSelectPlan} />
      <ServicesSection />
      <PricingSection onSelectPlan={handleSelectPlan} />
      <ContactSection />
      <LandingFooter />
    </div>
  );
}
