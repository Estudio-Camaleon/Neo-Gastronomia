"use client";

export function BackgroundShapes() {
  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* 2. TOP RIGHT: Mancha suave (Oculto en móvil para no tapar, visible en desktop) */}
      <div className="hidden md:block absolute top-0 right-0 w-[40%] h-[40%] bg-[var(--theme-accent)] opacity-60 rounded-bl-full" />

      {/* Contenedor Bolsa de compras (Solo Desktop) */}
      <div className="hidden lg:flex absolute top-0 right-0 w-40 h-48 bg-[var(--theme-primary-soft)] rounded-bl-[60px] items-end justify-center pb-10">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--theme-text)"
          strokeWidth="1.5"
          className="opacity-90"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>

      {/* Taza de café flotante (Solo Desktop Grande) */}
      <div
        className="hidden xl:block absolute top-[20%] right-[22%] opacity-60 animate-float-shape"
        style={{ animationDelay: "1.5s" }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--theme-primary)"
          strokeWidth="1.5"
        >
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="14" y1="2" x2="14" y2="4" />
        </svg>
      </div>

      {/* 3. CENTER TOP: Grilla de puntos (Solo Desktop) */}
      <div className="hidden md:block absolute top-[15%] left-[35%] opacity-50 animate-float-shape">
        <svg
          width="60"
          height="60"
          viewBox="0 0 60 60"
          fill="var(--theme-accent)"
        >
          <circle cx="10" cy="10" r="4.5" />
          <circle cx="30" cy="10" r="4.5" />
          <circle cx="50" cy="10" r="4.5" />
          <circle cx="10" cy="30" r="4.5" />
          <circle cx="30" cy="30" r="4.5" />
          <circle cx="50" cy="30" r="4.5" />
          <circle cx="10" cy="50" r="4.5" />
          <circle cx="30" cy="50" r="4.5" />
          <circle cx="50" cy="50" r="4.5" />
        </svg>
      </div>

      {/* Símbolo de Código QR (Solo Desktop) */}
      <div
        className="hidden lg:block absolute top-[25%] left-[55%] opacity-40 animate-float-shape"
        style={{ animationDelay: "0.8s" }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--theme-primary)"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>

      {/* 4. RIGHT EDGE: Contenedor del Carrito y Solapa (Solo Desktop) */}
      <div className="hidden lg:flex absolute top-[35%] right-0 w-28 h-80 bg-[var(--theme-primary)] rounded-l-[40px] flex-col items-center pt-12">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--theme-text)"
          strokeWidth="2"
          className="opacity-70"
        >
          <circle cx="9" cy="21" r="1.5" />
          <circle cx="20" cy="21" r="1.5" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </div>

      <div className="hidden lg:flex absolute top-[50%] right-[5.5rem] w-32 h-40 bg-[var(--theme-accent)] rounded-l-[30px] rounded-tr-[10px] items-center justify-center opacity-90 shadow-sm">
        <div className="w-10 h-10 bg-[var(--theme-primary-soft)] rounded-full" />
      </div>

      {/* LEFT EDGE - Ticket / Recibo de compra (Solo Desktop) */}
      <div className="hidden lg:flex absolute top-[40%] left-0 w-20 h-48 bg-[var(--theme-primary-soft-2)] rounded-r-[30px] items-center justify-center opacity-80">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--theme-text)"
          strokeWidth="1.5"
          className="animate-float-shape"
        >
          <path d="M4 2v20l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2V2l-2 2-2-2-2 2-2-2-2 2-2-2-2 2Z" />
          <line x1="8" y1="10" x2="16" y2="10" />
          <line x1="8" y1="14" x2="16" y2="14" />
        </svg>
      </div>

      {/* CENTER LEFT - Campana de restaurante (Solo Desktop) */}
      <div
        className="hidden lg:flex absolute top-[60%] left-[15%] w-32 h-32 bg-[var(--theme-primary-soft)] rounded-full items-center justify-center opacity-70 animate-float-shape"
        style={{ animationDelay: "2s" }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--theme-primary)"
          strokeWidth="1.5"
        >
          <path d="M5 18v-2a7 7 0 0 1 14 0v2" />
          <path d="M2 18h20" />
          <circle cx="12" cy="7" r="2" />
        </svg>
      </div>

      {/* 5. BOTTOM RIGHT: Círculos concéntricos y bloques */}
      <div className="absolute bottom-0 right-[5%] md:right-[20%] w-16 md:w-48 h-3 md:h-14 bg-[var(--theme-text)] rounded-tl-[20px]" />
      <div className="absolute bottom-[0.75rem] md:bottom-[3.5rem] right-[12%] md:right-[30%] w-10 md:w-28 h-3 md:h-14 bg-[var(--theme-accent)] opacity-80 rounded-tl-[15px]" />
      <div className="absolute -bottom-6 -right-6 md:-bottom-24 md:-right-24 w-16 h-16 md:w-80 md:h-80 bg-[var(--theme-text)] rounded-full flex items-center justify-center opacity-15 md:opacity-100">
        <div className="w-10 h-10 md:w-56 md:h-56 bg-[var(--theme-background)] rounded-full flex items-center justify-center">
          <div className="w-5 h-5 md:w-28 md:h-28 bg-[var(--theme-primary-soft)] rounded-full" />
        </div>
      </div>

      {/* 6. BOTTOM CENTER: Colina y Hojas (Solo Desktop) */}
      <div className="hidden lg:block absolute -bottom-16 left-[35%] w-80 h-48 bg-[var(--theme-primary-soft)] opacity-80 rounded-t-full" />
      <div
        className="hidden lg:flex absolute bottom-[3rem] left-[42%] gap-0 animate-float-shape"
        style={{ animationDelay: "1s" }}
      >
        <div className="w-8 h-14 bg-[var(--theme-primary)] rounded-tl-full rounded-br-full rounded-bl-sm rounded-tr-sm rotate-[-25deg] shadow-sm" />
        <div className="w-8 h-14 bg-[var(--theme-accent)] rounded-tr-full rounded-bl-full rounded-br-sm rounded-tl-sm rotate-[25deg] shadow-sm -ml-2" />
      </div>

      {/* 7. BOTTOM LEFT: Arcos concéntricos */}
      <div className="absolute bottom-0 left-0 w-12 h-12 md:w-80 md:h-80 bg-[var(--theme-text)] rounded-tr-full flex items-end justify-start opacity-15 md:opacity-100 -left-2 md:left-0">
        <div className="w-8 h-8 md:w-48 md:h-48 bg-[var(--theme-primary)] rounded-tr-full" />
      </div>

      {/* Contenedor verde medio con tenedor (Solo Desktop) */}
      <div className="hidden lg:flex absolute bottom-0 left-[15%] w-64 h-56 bg-[var(--theme-accent)] opacity-85 rounded-tr-[60px] rounded-tl-[30px] items-center justify-center pb-12">
        <svg
          width="40"
          height="50"
          viewBox="0 0 24 24"
          fill="var(--theme-background)"
          className="animate-float-shape"
        >
          {/* Dientes del tenedor */}
          <rect x="7" y="2" width="2" height="7" rx="1" />
          <rect x="11" y="2" width="2" height="7" rx="1" />
          <rect x="15" y="2" width="2" height="7" rx="1" />
          {/* Base U */}
          <path d="M7 8h8v2a4 4 0 0 1-8 0V8z" />
          {/* Mango */}
          <rect x="11" y="10" width="2" height="12" rx="1" />
        </svg>
      </div>
    </div>
  );
}
