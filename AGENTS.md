# NEO — AGENTS.md

## Regla fundamental

**No ejecutes acciones que consuman muchos tokens sin antes avisarme y pedir confirmación.** Esto incluye, pero no se limita a:
- Escanear archivos grandes o muchos archivos a la vez
- Buscar texto en todo el proyecto (`grep`/`ripgrep` sin filtro)
- Refactors masivos que toquen muchos archivos
- Renombrados que afecten imports en cascada
- Leer archivos extensos (>300 líneas) sin necesidad

Preguntame primero: "Voy a hacer X, consume aprox Y tokens. ¿Procedo?"

---

## Quick start

```bash
npm install           # instalar dependencias
npm run dev           # desarrollo (tsx scripts/dev.ts → next dev --turbo)
npm run build         # build producción
npm run test          # tests (vitest)
npm run impecable     # lint + typecheck + format (antes de commitear)
```

## Comandos clave

| Comando | Qué hace |
|---------|----------|
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier `src/**/*.{ts,tsx,css}` |
| `npm run db:link` | `supabase link --project-ref hokibyfaompjhdhnhtru` |
| `npm run db:push` | `supabase db push --linked` |
| `npm run db:types` | Regenera `src/core/types/database.types.ts` |
| `npm run free-port` | `npx kill-port 3000` |

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **Supabase SSR** (`@supabase/ssr`) — auth + realtime + RLS
- **Tailwind CSS v4** (postcss, `@theme` en globals.css, sin tailwind.config.\*)
- **shadcn/ui** (Radix, lucide-react)
- **Zustand** (cart), **Zod v4** (validación)
- **framer-motion**, **date-fns**, **Sonner** (toasts)

## Arquitectura clave

- `src/proxy.ts` reemplaza `middleware.ts` — exporta `proxy(request)`
- 3 clientes Supabase: `client.ts` (browser anon), `server.ts` (server + cookies), `admin.ts` (service role, `"server-only"`)
- Server Actions en `features/*/actions.ts` con `"use server"`
- Aislamiento multi-tenant: todo query scoped por `negocio_id`
- Tema: class-based (`.admin-theme-wrapper.dark`), `@custom-variant dark (&:is(.dark *))`
- `middleware.ts` es obsoleto en Next 16 — usar `proxy.ts`

## Convenciones importantes

- Preferir `Intl.NumberFormat("es-AR")` sobre `.toFixed(2)` para moneda
- CSS sobre JS branching para responsive (evita hydration mismatch)
- Componentes < 200 líneas idealmente
- Refactors deben preservar comportamiento exacto — cero regresiones
- Los iconos se importan de `lucide-react`
- Atajos de teclado deben verificar `document.querySelector('[role="dialog"]')` para evitar activarse con modals abiertos
- Acciones destructivas van en menú overflow (⋮), no junto a acción principal
- Modo oscuro requiere fondo visible en botones: `bg-black/85 dark:bg-white/85`

## Path aliases

`@/*` → `./src/*`, también `@core/`, `@ui/`, `@auth/`, `@marketing/`, `@admin/`, `@public-menu/`

## Gotchas

- `tailwind.config.ts` referenciado en `components.json` NO existe — Tailwind v4 usa CSS `@theme`
- `supabase/` tiene `config.toml` + `seed.sql` + `migrations/` para Supabase local (Docker)
- CSS separado por contexto: `home.css` (`--theme-*`), `admin-panel.css` (`--admin-*`), `auth.css` (`--auth-*`)
- `buildBrandPalette()` en `color.ts` inyecta `--color-custom-*` dinámicos para menú público
- `supabaseAdmin` se usa en admin layout para bypass RLS (fix intencional)
- `.env*` gitignored — secrets van en `.env.local`
- ESLint flat config (`eslint.config.mjs`) — no `.eslintrc.*`
