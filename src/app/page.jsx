"use client";

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { HeroSection } from '@/components/landing/HeroSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleSelectPlan = useCallback((plan) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/billing/checkout?plan=${plan}`);
      return;
    }
    router.push(`/billing/checkout?plan=${plan}`);
  }, [isAuthenticated, router]);

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
