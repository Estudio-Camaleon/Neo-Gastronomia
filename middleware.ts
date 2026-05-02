// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // IMPORTANTE: getUser() es el que refresca el token automáticamente
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rutas públicas (Incluimos el slug dinámico si lo tenés)
  // Ajusté esto para que no bloquee las páginas de los locales
  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/registro" ||
    pathname === "/" ||
    pathname.startsWith("/api/"); // Opcional: permitir APIs

  // 1. Si no hay usuario y no es ruta pública -> al login
  if (!isPublicRoute && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Si ya hay usuario y va a login/registro -> a pedidos
  if ((pathname === "/login" || pathname === "/registro") && user) {
    return NextResponse.redirect(new URL("/pedidos", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
