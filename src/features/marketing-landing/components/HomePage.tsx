// src/features/marketing-landing/components/HomePage.tsx
"use client";

import { Navbar } from "@/features/marketing-landing/components/shared/Navbar";
import { Footer } from "@/features/marketing-landing/components/shared/Footer";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { Pricing } from "./Pricing";
import { Testimonials } from "./Testimonials";
import "../style/home.css";

export function HomePage() {
  return (
    <div className="neo-home font-sans selection:bg-[var(--theme-primary-soft)] selection:text-[var(--theme-text)] min-h-screen flex flex-col justify-between">
      {/* Capa estructural superior */}
      <Navbar />

      {/* Orquestación de secciones modulares */}
      <main className="flex-grow">
        <Hero />
        <Features />
        <Pricing />
        <Testimonials />
      </main>

      {/* Cierre global */}
      <Footer />
    </div>
  );
}
