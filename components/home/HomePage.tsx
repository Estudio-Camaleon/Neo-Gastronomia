import { Navbar } from "./shared/Navbar";
import { Footer } from "./shared/Footer";
import { Hero } from "./sections/Hero";
import { Features } from "./sections/Features";
import { Pricing } from "./sections/Pricing";
import { Testimonials } from "./sections/Testimonials";
import "./style/home.css";

export function HomePage() {
  return (
    <div className="neo-home w-full flex flex-col min-h-screen bg-[var(--theme-background)]">
      <Navbar />
      {/* Cada componente interno debe manejar su propio ID interno para el scroll */}
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <Footer />
    </div>
  );
}
