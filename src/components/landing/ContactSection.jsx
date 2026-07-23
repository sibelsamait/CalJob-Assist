"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/theme';

export function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'No se pudo enviar el mensaje');
      setStatus('Tu mensaje fue recibido. Pronto nos pondremos en contacto.');
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus(error?.message || 'Ocurrió un error al enviar el mensaje');
    }
  };

  return (
    <section id="contacto" className="bg-slate-900 py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Contacto</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">¿Quieres hablar con nosotros?</h2>
          <p className="mt-3 max-w-xl text-lg text-slate-300">Escríbenos para conocer más sobre el producto, solicitar una demostración o abrir un ticket de soporte.</p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-5 text-sm text-slate-300">
            <p className="font-semibold text-white">Respuesta rápida</p>
            <p className="mt-2">Las consultas se registran con el mismo canal de soporte para mantener el seguimiento claro.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 text-slate-900 shadow-xl">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <input required value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900" />
            </div>
            <div>
              <label className="text-sm font-medium">Correo</label>
              <input required type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900" />
            </div>
            <div>
              <label className="text-sm font-medium">Mensaje</label>
              <textarea required rows="5" value={form.message} onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900" />
            </div>
          </div>
          {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}
          <Button type="submit" className="mt-6 w-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            Enviar mensaje
          </Button>
        </form>
      </div>
    </section>
  );
}

export default ContactSection;
