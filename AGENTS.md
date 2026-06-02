# NEO - AGENTS.md

## Quick start

```bash
npm install              # install deps
npm run dev              # custom dev script (tsx scripts/dev.ts → next dev --turbo)
npm run build            # production build
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
| `npm run impecable` | `lint && typecheck && format` (pre-commit gate) |

## Architecture

- **Next.js 16** (App Router, Server Actions, React 19, Turbopack)
- **Supabase SSR** (`@supabase/ssr` ^0.10.3) for auth + realtime
- **shadcn/ui** (Radix Nova style, lucide-react icons)
- **Tailwind CSS v4** (PostCSS, CSS variables via `globals.css`)
- **Zustand** for client state (cart), **Zod** for validation
- **Sonner** for toasts

### Directory layout

```
src/
├── app/                    # Next.js App Router routes
│   ├── (adminPanel)/       # Protected dashboard (layout → auth guard + sidebar)
│   ├── (auth)/             # Login, register, onboarding, callback
│   ├── (menuPublic)/       # Public menu at /[slug]
│   └── api/admin/          # Route handlers (image upload)
├── components/ui/          # shadcn/ui atoms (button, input, badge, etc.)
├── core/
│   ├── config/env.ts       # Zod-validated env vars
│   ├── lib/supabase/       # 3 Supabase clients
│   ├── providers/          # ThemeProvider, LoadingProvider
│   ├── hooks/              # useActiveSection, useIsScrolled, useScrollReveal
│   └── types/              # Global TS types
├── features/
│   ├── admin/              # Dashboard, orders, catalog, branding, clients
│   ├── auth/               # Server actions + form components
│   ├── marketing/          # Landing page (Hero, Features, Pricing, Testimonials, SubscriptionPlans)
│   └── public-menu/        # Cart store, order form, floating button
├── proxy.ts                # Formerly middleware.ts (Next.js 16 deprecation)
└── lib/utils.ts            # shadcn cn() utility
```

### Supabase clients

| File | Client | Role | Usage |
|------|--------|------|-------|
| `client.ts` | `createBrowserClient` | Anon key | Browser components |
| `server.ts` | `createServerClient` | Anon key + cookie mgmt | Server Components, Server Actions |
| `admin.ts` | `createClient` (raw) | Service role key | Admin route handlers (image upload/delete) |

- `admin.ts` has `import "server-only"` — never import in client code
- Server actions use `createClient` from `server.ts`
- Storage (image upload/delete) must use `supabaseAdmin` for cross-RLS operations
- Auth callback at `/callback` handles both `code` (email) and `access_token`+`refresh_token` (OAuth)

### Env vars (see `process-env.d.ts`)

```
NEXT_PUBLIC_SUPABASE_URL       # required
NEXT_PUBLIC_SUPABASE_ANON_KEY  # required
SUPABASE_SERVICE_ROLE_KEY      # required (server-only)
NEXT_PUBLIC_SITE_URL           # optional, defaults to localhost:3000
```

All `.env*` files are gitignored. Keep secrets in `.env.local`.

### Proxy (formerly Middleware)

File: `src/proxy.ts`, exported function: `proxy(request: NextRequest)`.
- Protects `/pedidos`, `/productos`, `/configuracion`, `/admin`, `/dashboard`, `/clientes`
- Redirects unauthenticated to `/login`, authenticated away from `/login` and `/registro`
- Uses `createServerClient` from `@supabase/ssr` with cookie sync

## Conventions

- **Server Actions** in `features/*/actions.ts` with `"use server"`
- **Client components** use `"use client"` at the top
- **`createClient()`** is cached at module level (not per-render) in all client components
- **Storage paths** are extracted from public URLs using `extractStoragePath()` (strips query params, hash)
- **Multi-tenant** isolation: every DB query scoped by `negocio_id` + `user_id` (server) or RLS (client)
- **Auth routes** use CSS variables from `auth.css` (`--auth-*`), marketing uses `home.css` (`--theme-*`)
- **No tests exist** in the repo yet
- **Zod schemas** used for form validation client-side + `env.ts` for env validation
- **Rate limiting** is in-memory (`Map` in `auth/actions.ts`) — resets on server restart

## Path aliases

`@/*` → `./src/*` plus `@core/`, `@ui/`, `@auth/`, `@marketing/`, `@admin/`, `@public-menu/` each mapped to their `src/` subdirectory.

## Gotchas

- `middleware.ts` is deprecated in Next.js 16; the file is `src/proxy.ts` exporting `proxy`
- Supabase `safe-query.ts` was removed (dead code)
- `new-order.mp3` exists at `public/sounds/` (referenced by RealtimeOrders and PedidosRadar)
- `tsconfig.json` has an extra stray include entry for `src/components/ui/CoffieCoppe.tsx`
- `supabase/` dir at root is minimal (only `.temp/`) — no local migrations yet
