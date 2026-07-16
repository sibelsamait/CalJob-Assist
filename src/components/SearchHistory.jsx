"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock } from "lucide-react";

export default function SearchHistory() {
  const { user, isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("");

  const localStorageKey = "caljob_search_history";

  useEffect(() => {
    if (isAuthenticated) {
      loadServerHistory();
    } else {
      loadLocalHistory();
    }
  }, [isAuthenticated]);

  const loadLocalHistory = () => {
    try {
      const saved = window.localStorage.getItem(localStorageKey);
      setHistory(saved ? JSON.parse(saved) : []);
    } catch {
      setHistory([]);
    }
  };

  const loadServerHistory = async () => {
    setStatus("Cargando historial...");
    try {
      const response = await fetch("/api/search-history");
      if (!response.ok) throw new Error("No autorizado");
      const body = await response.json();
      setHistory(body.history || []);
    } catch (error) {
      loadLocalHistory();
    } finally {
      setStatus("");
    }
  };

  const saveLocalHistory = (entry) => {
    const next = [entry, ...history].slice(0, 12);
    setHistory(next);
    window.localStorage.setItem(localStorageKey, JSON.stringify(next));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = query.trim();
    if (!text) return;

    const newEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      query_type: "legal_search",
      query_text: text,
      metadata: {},
      created_at: new Date().toISOString(),
    };

    if (isAuthenticated) {
      try {
        setStatus("Guardando búsqueda...");
        const response = await fetch("/api/search-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queryText: text, queryType: "legal_search" }),
        });
        if (!response.ok) throw new Error("No se pudo guardar la búsqueda");
        await loadServerHistory();
      } catch (error) {
        setStatus(error.message || "Error al guardar la búsqueda");
      } finally {
        setStatus("");
      }
    } else {
      saveLocalHistory(newEntry);
      setStatus("Historial guardado localmente. Inicia sesión para sincronizarlo.");
    }

    setQuery("");
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Historial de búsquedas</p>
          <h3 className="text-xl font-semibold text-foreground">Accede rápido a tus consultas recientes</h3>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          {isAuthenticated ? "Historial guardado en tu cuenta" : "Se almacena localmente hasta que inicies sesión"}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar normativa, cálculo o documento..."
          className="h-12"
        />
        <Button type="submit" className="h-12 px-6">
          <Search className="w-4 h-4 mr-2" />Guardar
        </Button>
      </form>

      {status ? <p className="mt-3 text-sm text-foreground/80">{status}</p> : null}

      <div className="mt-6 space-y-3">
        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            No hay consultas guardadas aún. Haz una búsqueda para comenzar.
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="rounded-xl border border-border p-4 bg-slate-50 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-foreground font-medium">{item.query_text}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{new Date(item.created_at).toLocaleString('es-CL')}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                <Clock className="w-3.5 h-3.5" /> {item.query_type.replace('_', ' ')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
