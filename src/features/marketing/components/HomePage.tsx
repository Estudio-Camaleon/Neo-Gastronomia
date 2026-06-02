"use client";

import { Navbar } from "./shared/Navbar";
import { Footer } from "./shared/Footer";
import { BackgroundShapes } from "./shared/BackgroundShapes"; // <-- Importamos el fondo
import { Hero } from "./Hero";
import { Features } from "./Features";
import { Pricing } from "./Pricing";
import { SubscriptionPlans } from "./SubscriptionPlans";
import { Testimonials } from "./Testimonials";
import "../style/home.css";
import "../style/shapes.css";

export function HomePage() {
  return (
    <div className="neo-home font-sans selection:bg-[var(--theme-primary-soft)] selection:text-[var(--theme-text)] min-h-screen w-full">
      <div className="neo-home-shell relative mx-auto flex min-h-screen w-full flex-col bg-[linear-gradient(180deg,rgba(250,248,242,0.9),rgba(247,244,236,0.96))]">
        {/* Componente Modular de Formas y Fondos Animados */}
        <BackgroundShapes />

        <div className="relative z-10 flex min-h-screen flex-col w-full overflow-hidden">
          <div
            id="top-pixel"
            className="absolute top-0 left-0 h-1 w-full pointer-events-none opacity-0"
          />

          <Navbar />

          <main className="flex-grow w-full">
            <Hero />
            <Features />
            <Pricing />
            <SubscriptionPlans />
            <Testimonials />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}
