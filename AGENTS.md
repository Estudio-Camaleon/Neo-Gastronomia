# NEO - AGENTS.md

## Quick start

```bash
npm install              # install deps
npm run dev              # custom dev script (tsx scripts/dev.ts → next dev --turbo)
npm run build            # production build
npm run test             # vitest run (CI)
npm run impecable        # lint → typecheck → format (run before committing)
```

## Key commands

| Command | What it runs |
|---------|-------------|
| `npm run dev` | `tsx scripts/dev.ts` (custom banner + next dev --turbo) |
| `npm run dev:next` | `next dev --turbo` (bypasses custom script) |
| `npm run lint` | `eslint . --cache` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | `prettier --write "src/**/*.{ts,tsx,css}"` |
| `npm run test` | `vitest run` (CI) |
| `npm run test:watch` | `vitest` (watch mode) |
| `npm run impecable` | `lint && typecheck && format` (pre-commit gate) |
| `npm run clean` | `npx rimraf .next` |
| `npm run free-port` | `npx kill-port 3000` |
| `npm run db:link` | `supabase link --project-ref hokibyfaompjhdhnhtru` |
| `npm run db:pull` | `supabase db pull --project-id hokibyfaompjhdhnhtru` |
| `npm run db:push` | `supabase db push --project-id hokibyfaompjhdhnhtru` |
| `npm run db:types` | `supabase gen types typescript --project-id hokibyfaompjhdhnhtru > src/core/types/database.types.ts` |
| `npm run db:start` | `supabase start` |
| `npm run db:stop` | `supabase stop` |

## Architecture

- **Next.js 16** (App Router, Server Actions, React 19.2.4, Turbopack)
- **Supabase SSR** (`@supabase/ssr` ^0.10.3) for auth + realtime
- **shadcn/ui** (Radix Nova style, lucide-react icons)
- **Tailwind CSS v4** (PostCSS, CSS-based `@theme` in `globals.css`, no tailwind.config.*)
- **Zustand** for client state (cart), **Zod v4** for validation
- **Sonner** for toasts, **framer-motion** for animations
- **date-fns** + **date-fns-tz** for date handling

### Directory layout

```
src/
├── app/                    # Next.js App Router routes
│   ├── (adminPanel)/       # Protected dashboard (layout → auth guard + sidebar)
│   │   ├── page.tsx        # redirect /pedidos
│   │   ├── layout.tsx      # Auth guard (getUser), sidebar, ThemeProvider, Suspense (uses supabaseAdmin for RLS bypass)
│   │   ├── dashboard/      # KPIs del día (pedidos, ventas, clientes, productos)
│   │   ├── pedidos/        # PedidosRadar en tiempo real (Realtime)
│   │   ├── productos/      # AddProductSection (CRUD catálogo)
│   │   ├── configuracion/  # ConfigForm + FirstTimeTutorial (dynamic, no cache)
│   │   └── clientes/       # ClientRadar con métricas
│   ├── (auth)/             # Login, Register, Onboarding, Auth callback
│   │   ├── login/          # LoginForm + GoogleSignInButton
│   │   ├── registro/       # RegisterForm
│   │   ├── onboarding/     # Guía de 3 pasos post-registro
│   │   └── callback/       # Route handler: code exchange + OAuth, crea negocio en DB
│   ├── (menuPublic)/       # Public menu at /[slug]
│   │   └── [slug]/
│   │       ├── layout.tsx  # Dynamic brand colors (buildBrandPalette dynamic CSS vars)
│   │       ├── error.tsx   # Client error boundary
│   │       └── loading.tsx
│   ├── api/admin/          # Route handlers (image upload/delete)
│   │   ├── branding-images/route.ts
│   │   └── product-images/route.ts
│   ├── layout.tsx          # Root: Geist font, LoadingProvider
│   ├── page.tsx            # Landing → HomePage (marketing)
│   └── loading.tsx         # Root LoadingScreen variant="root"
├── components/ui/          # 10 shadcn/ui atoms
│   ├── badge.tsx, confirm-modal.tsx, image-upload.tsx, input.tsx
│   ├── label.tsx, loading-overlay.tsx, loading-screen.tsx
│   ├── notes-modal.tsx, switch.tsx, transition-link.tsx
├── core/
│   ├── config/env.ts       # Zod-validated env vars (client + server schemas)
│   ├── lib/
│   │   ├── supabase/       # 3 clients: client.ts, server.ts, admin.ts (admin has "server-only")
│   │   ├── utils/          # color.ts (buildBrandPalette), horarios.ts (estaAbierto), whatsappActions.ts
│   │   ├── schemas.ts      # Zod schemas: loginSchema, registerSchema, upsertProductSchema, submitOrderSchema, updateOrderStatusSchema
│   │   ├── tenant.ts       # getAuthenticatedTenant, extractStoragePath
│   │   └── utils.ts        # cn()
│   ├── providers/          # ThemeProvider, LoadingProvider
│   ├── hooks/              # useActiveSection, useIsScrolled, useScrollReveal
│   └── types/
│       ├── database.types.ts    # Auto-generated from Supabase (Tables, TablesInsert)
│       └── domain.ts           # NegocioRow, CategoriaConProductos, ProductoConConfig, PedidoData, ClienteResumen, etc.
├── features/
│   ├── admin/
│   │   ├── shared/         # Sidebar, MobileSidebar, FirstTimeTutorial, admin-panel.css
│   │   ├── orders/         # actions.ts (updateOrderStatus, markPedidoCompleto), PedidoCard, PedidosRadar
│   │   ├── catalog/        # actions.ts (createProduct, updateProduct), AddProductSection, ProductTable, ProductModal, ProductoForm, CategoriaManager, CategorySelect, IngredientBadge
│   │   ├── branding/       # actions.ts (updateTenantBranding), ConfigForm
│   │   └── clients/        # actions.ts, ClientRadar
│   ├── auth/               # actions.ts (loginAction, registerAction, signOutAction) + auth.css + LoginForm, RegisterForm, GoogleSignInButton, StepIndicator
│   ├── marketing/          # HomePage, Hero, Features, Pricing, Testimonials, SubscriptionPlans + shared/ Navbar, Footer, LegalModal, BackgroundShapes + style/ home.css, shapes.css
│   └── public-menu/        # types.ts (re-exports), utils.ts + cart/ (useCartStore, PublicCart, OrderForm, CartFloatingButton) + components/ (CatalogClient, ExtrasSelector, FloatingFood)
├── proxy.ts                # Replaces middleware.ts (Next.js 16): exports `proxy(request)` + config matcher
├── __tests__/
│   ├── setup.ts            # @testing-library/jest-dom/vitest + afterEach(cleanup)
│   └── test-utils.tsx      # customRender with ThemeProvider + LoadingProvider
└── app/globals.css         # Tailwind v4 @import "tailwindcss" + @theme + CSS variables + component styles
```

### Supabase clients

| File | Client | Role | Usage |
|------|--------|------|-------|
| `client.ts` | `createBrowserClient` | Anon key | Browser components |
| `server.ts` | `createServerClient` | Anon key + cookie mgmt | Server Components, Server Actions |
| `admin.ts` | `createClient` (raw) | Service role key | Admin route handlers, RLS bypass queries |

- `admin.ts` has `import "server-only"` — never import in client code
- Server actions use `createClient` from `server.ts`
- Storage (image upload/delete) must use `supabaseAdmin` for cross-RLS operations
- Auth callback at `/callback` handles both `code` (email) and `access_token`+`refresh_token` (OAuth)
- Admin layout uses `supabaseAdmin` to query `negocios` bypassing RLS (fix for tenant isolation)

### Env vars (see `process-env.d.ts`)

```
NEXT_PUBLIC_SUPABASE_URL       # required (Zod-validated URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY  # required
SUPABASE_SERVICE_ROLE_KEY      # required (server-only)
NEXT_PUBLIC_SITE_URL           # optional, defaults to http://localhost:3000
WHATSAPP_API_URL                # optional - WhatsApp notifications
WHATSAPP_TOKEN                  # optional - WhatsApp token
SENDGRID_API_KEY                # optional - SMTP (config.toml commented out)
```

All `.env*` files are gitignored. Keep secrets in `.env.local`.

### Proxy (formerly Middleware)

File: `src/proxy.ts`, exported function: `proxy(request: NextRequest)`.
- Protects `/pedidos`, `/productos`, `/configuracion`, `/admin`, `/dashboard`, `/clientes`
- Redirects unauthenticated to `/login`, authenticated away from `/login` and `/registro`
- Uses `createServerClient` from `@supabase/ssr` with double-pass cookie sync
- Static public routes: `/`, `/login`, `/registro`, `/onboarding`
- Skips `/api/` and file paths with dots
- Export config.matcher excludes `_next/static`, `_next/image`, `favicon.ico`, images

## Existing test files

| File | Type |
|------|------|
| `src/core/lib/utils.test.ts` | Pure logic (cn) |
| `src/core/lib/slug.test.ts` | Pure logic |
| `src/core/types/domain.test.ts` | Pure logic |
| `src/features/auth/components/StepIndicator.test.tsx` | Component |

## Conventions

- **Server Actions** in `features/*/actions.ts` with `"use server"`
- **Client components** use `"use client"` at the top
- **`createClient()`** for browser client returns a new client instance per call; `createBrowserClient` internally deduplicates by URL+key
- **Storage paths** are extracted from public URLs using `extractStoragePath()` (strips query params, hash)
- **Multi-tenant** isolation: every DB query scoped by `negocio_id` + `user_id` (server) or RLS (client)
- **Auth routes** use CSS variables from `auth.css` (`--auth-*`), marketing uses `home.css` (`--theme-*`)
- **Admin routes** use `admin-panel.css` (`--admin-*` variables driven by ThemeProvider)
- **Public menu** uses dynamic CSS variables via `buildBrandPalette()` (inlines `style` block with `--color-custom-*`)
- **Tests** use `vitest` + `@testing-library/react` + `jsdom`; run `npm run test`
- **`src/__tests__/setup.ts`** loads `@testing-library/jest-dom/vitest` matchers + auto-cleanup
- **`src/__tests__/test-utils.tsx`** wraps render with `ThemeProvider` + `LoadingProvider`
- **Test convention**: `*.test.ts` for pure logic, `*.test.tsx` for components, colocated next to source
- **Zod schemas** used for form validation client-side + `env.ts` for env validation
- **Rate limiting** is in-memory (`Map` in `auth/actions.ts`) — resets on server restart
- **ESLint** flat config (`eslint.config.mjs`): `no-explicit-any: error`, `no-unused-vars: error` with `^_` ignore, `no-undef: off` (tsc handles it)
- **`next.config.ts`**: `reactStrictMode: true`, `images.remotePatterns` for `**.supabase.co` and `images.unsplash.com`, `compiler.removeConsole` in production

## DB migrations (Supabase)

### `20260603_neo_db_cleanup.sql`
- Creates `estado_pedido` enum (`pendiente`, `en_preparacion`, `entregado`, `cancelado`)
- Drops unused tables `producto_opciones_grupos` and `producto_opciones_items`
- Adds performance indexes: `idx_pedidos_negocio_id`, `idx_pedidos_created_at`, `idx_pedidos_estado`, `idx_negocios_user_id`, `idx_negocios_slug` (unique), `idx_productos_negocio_id`, `idx_clientes_negocio_id`, `idx_categorias_negocio_id`
- Enables RLS on all tables with multi-tenant policies via `negocios.user_id` JOIN
- Public policies: SELECT on `negocios`, INSERT on `pedidos` and `pedido_items`

### `20260604_neo_cascade_cleanup.sql`
- FK ON DELETE CASCADE for all child tables → `negocios`
- `eliminar_negocio_completo(p_negocio_id)` — purges storage + DB
- `eliminar_usuario_completo(p_user_id)` — purges negocio + auth user
- `listar_negocios_usuario(p_email)` — lists negocio-user mapping

## Path aliases

`@/*` → `./src/*` plus `@core/`, `@ui/`, `@auth/`, `@marketing/`, `@admin/`, `@public-menu/` each mapped to their `src/` subdirectory. All replicated in `vitest.config.ts` `resolve.alias`.

## Gotchas

- `middleware.ts` is deprecated in Next.js 16; the file is `src/proxy.ts` exporting `proxy`
- `tailwind.config.ts` referenced in `components.json` does NOT exist — Tailwind v4 uses CSS `@theme` directive in `globals.css`
- `new-order.mp3` exists at `public/sounds/` (referenced by RealtimeOrders and PedidosRadar)
- `tsconfig.json` has NO stray includes anymore (was cleaned up)
- `supabase/` dir has `config.toml` + `seed.sql` + `migrations/` for local Supabase
- Migration workflow: edit schema in Supabase dashboard → `npm run db:pull` → `npm run db:types`
- Local dev: `npm run db:start` (requires Docker) → migrate → `npm run dev`
- `supabase/.temp/` exists — gitignored
- `eslint.config.mjs` is flat config format (NOT `.eslintrc.*`)
- No Prettier config file exists — uses defaults (no semi, single quotes for .ts/.tsx?)
- `scripts/dev.ts` is a custom startup script that spawns `next dev --turbo` with filtered stderr (suppresses workspace & middleware deprecation warnings)
- Admin panel layout uses `supabaseAdmin` (service role) to query negocios bypassing RLS — intentional fix
- Admin cart flows: `submitOrderSchema` validates items array with min 1, supports `efectivo`/`transferencia` payment methods
- Public menu `/callback` route handler creates default `negocios` row using `supabaseAdmin`
- CSS: `admin-panel.css` defines `--admin-*` vars, `auth.css` defines `--auth-*` vars, `home.css` defines `--theme-*` vars
