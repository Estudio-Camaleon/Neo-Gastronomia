import Link from "next/link"; // Asegúrate de tener esta importación

export function Hero() {
  return (
    <section className="bg-bg-main dark:bg-bg-darker py-20 px-6 border-b border-border dark:border-border-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Texto */}
        <div className="space-y-6">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20">
            Nuevo · La gestión que tu negocio necesita
          </span>

          <h1 className="text-6xl font-black text-text-primary dark:text-text-inverse tracking-tight leading-[1.1]">
            Gestiona tu menú <br />
            <span className="text-primary">con NEO</span>
          </h1>

          <p className="text-text-secondary text-lg max-w-lg leading-relaxed">
            La forma más rápida y moderna de mostrar tus productos al mundo.
            Crea tu catálogo digital, gestiona precios y recibe pedidos en
            minutos.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/registro"
              className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
            >
              Empezar ahora
            </Link>

            <Link
              href="/login"
              className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark text-text-primary dark:text-text-inverse px-8 py-4 rounded-xl font-bold transition-all hover:border-primary hover:bg-surface-muted dark:hover:bg-bg-dark active:scale-95"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>

        {/* adminPanel Mockup */}
        <div className="relative group">
          {/* Brillo de fondo (solo en dark mode para efecto premium) */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

          <div className="relative bg-surface dark:bg-surface-dark p-3 rounded-2xl border border-border dark:border-border-dark shadow-2xl transition-colors duration-300">
            {/* Barra superior estilo ventana */}
            <div className="flex gap-1.5 mb-3 px-2">
              <div className="w-3 h-3 rounded-full bg-error/20 border border-error/40"></div>
              <div className="w-3 h-3 rounded-full bg-warning/20 border border-warning/40"></div>
              <div className="w-3 h-3 rounded-full bg-success/20 border border-success/40"></div>
            </div>

            <div className="bg-bg-main dark:bg-bg-darker h-72 rounded-xl border border-border dark:border-border-dark flex items-center justify-center text-text-muted font-medium overflow-hidden">
              <div className="flex flex-col items-center gap-2 opacity-50">
                <span className="text-4xl">📊</span>
                <p className="text-sm tracking-widest uppercase">
                  [ adminPanel Mockup ]
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
