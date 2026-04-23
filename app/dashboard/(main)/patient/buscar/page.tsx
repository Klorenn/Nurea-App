"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, MapPin, Star, Loader2 } from "lucide-react";
import { loadingDashboardInsetClassName } from "@/lib/loading-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

type ProfessionalItem = {
  id: string;
  name: string;
  specialty: string;
  city: string;
  photoUrl: string | null;
  priceRange: string | null;
  description: string | null;
  rating: number;
  reviewCount: number;
};

export default function PatientBuscarPage() {
  const { language } = useLanguage();
  const isSpanish = language === "es";
  const [q, setQ] = useState("");
  const [specialty] = useState("");
  const [city, setCity] = useState("");
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (specialty) params.set("specialty", specialty);
      if (city) params.set("city", city);
      const res = await fetch(`/api/profesionales?${params}`);
      const data = await res.json();
      setProfessionals(data.professionals ?? []);
    } catch {
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  }, [q, specialty, city]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {isSpanish ? "Buscar especialista" : "Find specialist"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isSpanish
            ? "Usa nuestro sistema de búsqueda con datos actualizados."
            : "Use our search system with up-to-date data."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isSpanish ? "Nombre o especialidad..." : "Name or specialty..."}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 bg-background border-border"
          />
        </div>
        <Input
          placeholder={isSpanish ? "Ciudad" : "City"}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="sm:w-40 bg-background border-border"
        />
        <Button onClick={fetchList} variant="default" className="bg-teal-600 hover:bg-teal-700">
          <Search className="h-4 w-4 mr-2" />
          {isSpanish ? "Buscar" : "Search"}
        </Button>
      </div>

      {loading ? (
        <div className={loadingDashboardInsetClassName("bg-transparent")}>
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <p className="text-sm text-muted-foreground">
              {isSpanish ? "Cargando..." : "Loading..."}
            </p>
          </div>
        </div>
      ) : professionals.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          {isSpanish ? "No se encontraron especialistas." : "No specialists found."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((p) => (
            <Link
              key={p.id}
              href={`/professionals/${p.id}`}
              className="block rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50"
            >
              <div className="flex gap-4">
                <div className="h-14 w-14 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {p.photoUrl ? (
                    <Image 
                      src={p.photoUrl} 
                      alt="" 
                      width={56} 
                      height={56} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-7 w-7 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{p.specialty}</p>
                  {p.city && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {p.city}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium">{p.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">
                      ({p.reviewCount} {isSpanish ? "reseñas" : "reviews"})
                    </span>
                  </div>
                  {p.priceRange && (
                    <p className="text-sm font-medium text-foreground mt-1">{p.priceRange}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
