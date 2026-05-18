/**
 * NEO SYSTEM v3.0 - Guardián de Frontera Multi-tenant & Persistencia Infinita
 * Middleware atómico optimizado para Next.js App Router y Supabase SSR.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Inicialización de respuesta base con propagación de cabeceras de red
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // VICTORIA ESTRUCTURAL: Doble pasada sin pisar memoria
          // 1. Sincronizar primero el request para lecturas en cascada en el mismo ciclo
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          // 2. Instanciar una única respuesta limpia con el canal de request actualizado
          response = NextResponse.next({
            request,
          });

          // 3. Volcar en bloque todas las cookies reteniendo maxAge/expires nativos de Supabase Auth
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() refresca el token activamente contra GoTrue extendiendo su vida útil
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // --- REVISIÓN DE RUTAS (Auditoría de Acceso Multi-tenant) ---

  // 1. Rutas estáticas públicas
  const publicStaticRoutes = ["/", "/login", "/registro", "/onboarding"];
  const isStaticPublic = publicStaticRoutes.includes(pathname);

  // 2. Rutas de API y archivos (Ignorados por performance)
  const isApiOrAsset = pathname.startsWith("/api/") || pathname.includes(".");

  // 3. Scope de rutas reservadas del SaaS interno
  const isReservedRoute =
    pathname.startsWith("/pedidos") ||
    pathname.startsWith("/productos") ||
    pathname.startsWith("/configuracion") ||
    pathname.startsWith("/admin");

  // Definición rigurosa de perímetros seguros
  const requiresAuth = !isStaticPublic && !isApiOrAsset && isReservedRoute;

  // --- CONTROLADORES DE REDIRECCIÓN EN SERVIDOR ---

  // A. Intrusión detectada -> Redirección inmediata al login
  if (requiresAuth && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // B. Sesión activa en compu de admin -> Forzar entrada al centro operativo
  if (user && (pathname === "/login" || pathname === "/registro")) {
    return NextResponse.redirect(new URL("/pedidos", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Excluir archivos estáticos internos de Next.js por hardware
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
