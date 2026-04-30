import { Navbar } from "@/components/shared/Navbar";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Pricing } from "@/components/home/Pricing";
import { Testimonials } from "@/components/home/Testimonials";
import { Footer } from "@/components/shared/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-main dark:bg-bg-darker antialiased">
      <Navbar showLinks={false} showActions={true} />
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <Footer />
    </main>
  );
}
