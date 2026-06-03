# NEO — Plataforma Gastronómica SaaS Multi-Tenant

NEO es un SaaS para la industria gastronómica. Permite a cada comercio gestionar su menú digital, catálogo de productos, pedidos en tiempo real e identidad de marca desde un panel unificado, con un menú público accesible por QR.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, Turbopack) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS v4 + CSS variables dinámicas |
| UI | shadcn/ui (Radix), lucide-react, framer-motion |
| Backend/DB | Supabase (PostgreSQL, Auth SSR, Storage, RLS) |
| Estado cliente | Zustand (carrito) |
| Validación | Zod |
| Notificaciones | Sonner |
| Testing | Vitest + Testing Library + jsdom |

---

## Empezar

```bash
npm install              # instalar dependencias
npm run dev              # entorno desarrollo (Turbopack)
npm run build            # build producción
npm run test             # tests (CI)
npm run impecable        # lint → typecheck → format (pre-commit)
```

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | `tsx scripts/dev.ts` (banner personalizado + `next dev --turbo`) |
| `npm run dev:next` | `next dev --turbo` (sin script personalizado) |
| `npm run build` | Producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier (`src/**/*.{ts,tsx,css}`) |
| `npm run test` | Vitest (CI) |
| `npm run test:watch` | Vitest (watch) |
| `npm run impecable` | `lint && typecheck && format` |
| `npm run db:pull` | Pull schema remoto Supabase |
| `npm run db:types` | Generar tipos TS desde Supabase |
| `npm run clean` | Limpiar `.next` |

---

## Variables de entorno (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=<required>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<required>
SUPABASE_SERVICE_ROLE_KEY=<required>
NEXT_PUBLIC_SITE_URL=<opcional, default localhost:3000>
```

Validadas con Zod en `src/core/config/env.ts`.

---

## Arquitectura

```
src/
├── app/                        # Next.js App Router
│   ├── (adminPanel)/           # Dashboard protegido (pedidos, productos, config, clientes)
│   │   ├── layout.tsx          # Auth guard + sidebar + ThemeProvider
│   │   ├── dashboard/          # KPIs: pedidos hoy, ventas, clientes, productos
│   │   ├── pedidos/            # Pedidos en tiempo real con PedidosRadar
│   │   ├── productos/          # Gestión de catálogo (AddProductSection)
│   │   ├── configuracion/      # Configuración del negocio (branding)
│   │   └── clientes/           # Radar de clientes
│   ├── (auth)/                 # Login, registro, onboarding, callback OAuth
│   ├── (menuPublic)/           # Menú público por slug /[slug]
│   └── api/admin/              # Route handlers (imágenes)
│
├── components/
│   └── ui/                     # Átomos shadcn/ui (button, input, badge, switch, modals, etc.)
│
├── core/
│   ├── config/env.ts           # Validación Zod de entorno
│   ├── lib/
│   │   ├── supabase/           # 3 clientes: client.ts / server.ts / admin.ts
│   │   ├── utils.ts            # cn() utility
│   │   ├── schemas.ts          # Esquemas Zod (login, register, productos, pedidos)
│   │   ├── tenant.ts           # Helpers multi-tenant
│   │   └── utils/              # color.ts, horarios.ts, whatsappActions.ts
│   ├── hooks/                  # useActiveSection, useIsScrolled, useScrollReveal
│   ├── providers/              # ThemeProvider, LoadingProvider
│   └── types/                  # database.types.ts, domain.ts
│
├── features/
│   ├── auth/                   # Server actions + formularios (login, registro, Google OAuth)
│   ├── admin/                  # Panel: órdenes, catálogo, branding, clientes
│   │   ├── orders/             # PedidosRadar, PedidoCard, actions
│   │   ├── catalog/            # AddProductSection, ProductTable, ProductoForm, modals
│   │   ├── branding/           # ConfigForm, actions
│   │   ├── clients/            # ClientRadar, actions
│   │   └── shared/             # Sidebar, MobileSidebar, FirstTimeTutorial
│   ├── marketing/              # Landing page (Hero, Features, Pricing, Testimonials, etc.)
│   └── public-menu/            # Catálogo público, carrito Zustand, order form
│
├── proxy.ts                    # Reemplaza middleware.ts (Next.js 16)
└── __tests__/                  # setup.ts, test-utils.tsx
```

## Clientes Supabase

| Archivo | Cliente | Rol | Uso |
|---|---|---|---|
| `client.ts` | `createBrowserClient` | Anon key | Componentes browser |
| `server.ts` | `createServerClient` | Anon key + cookies | Server Components, Server Actions |
| `admin.ts` | `createClient` (raw) | Service role key | Route handlers admin (imágenes) |

- `admin.ts` tiene `import "server-only"` — no importar en cliente
- Server actions usan `createClient` de `server.ts`
- Storage (upload/delete imágenes) usa `supabaseAdmin` para operaciones cross-RLS

## Proxy (antes Middleware)

`src/proxy.ts` exporta `proxy(request: NextRequest)`.
- Protege `/pedidos`, `/productos`, `/configuracion`, `/admin`, `/dashboard`, `/clientes`
- Redirige no-autenticados a `/login`
- Redirige autenticados fuera de `/login` y `/registro` hacia `/pedidos`
- Usa `createServerClient` de `@supabase/ssr` con doble pasada de cookies

## Convenciones

- **Server Actions** en `features/*/actions.ts` con `"use server"`
- **Componentes cliente** usan `"use client"` al inicio
- **createClient()** se cachea a nivel de módulo (no por render)
- **Multi-tenant**: toda query scoped por `negocio_id` + `user_id` (server) o RLS (cliente)
- **Tests** colocalizados: `*.test.ts` / `*.test.tsx` al lado del source
- **Zod** para validación client-side + `env.ts` para entorno
- **Rate limiting** es in-memory (`Map`), se reinicia al reiniciar el servidor

## DB local (Supabase CLI)

```bash
npm run db:start        # requiere Docker
npm run db:pull         # pull schema remoto
npm run db:types        # regenerar tipos TS
```

Migraciones en `supabase/migrations/`.
