import { Sparkles } from "lucide-react";

interface UpgradePromptProps {
  feature: string;
}

export function UpgradePrompt({ feature }: UpgradePromptProps) {
  return (
    <div className="admin-card p-10 md:p-14 text-center max-w-xl mx-auto mt-10">
      <div className="p-4 rounded-2xl bg-[var(--admin-accent)]/5 text-[var(--admin-accent)] mb-6 inline-flex">
        <Sparkles size={48} strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-black tracking-tight text-[var(--admin-text)] mb-2">
        {feature === "estadísticas" ? "Estadísticas" : "Funcionalidad"} PRO
      </h2>
      <p className="text-sm font-medium text-[var(--admin-text-muted)] mb-8 max-w-sm mx-auto">
        {feature === "estadísticas"
          ? "Las estadísticas detalladas de ventas y rendimiento están disponibles exclusivamente en el plan PRO."
          : `Esta funcionalidad está disponible exclusivamente en el plan PRO.`}
      </p>
      <a
        href="/configuracion?upgrade=true"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--admin-accent)] text-white rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all"
      >
        <Sparkles size={16} />
        Actualizar a PRO
      </a>
    </div>
  );
}
