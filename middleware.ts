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
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  // 1. Protección automática para todo lo que empiece por / (adminPanel)
  // Nota: Como tus rutas son /pedidos, /productos, etc.,
  // simplemente comprobamos si NO es una ruta pública.
  const isPublicRoute =
    pathname === "/login" || pathname === "/registro" || pathname === "/";

  // Si no es pública y no hay sesión, al login
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Si ya está logueado y va a login/registro, enviarlo al adminPanel (root)
  if ((pathname === "/login" || pathname === "/registro") && session) {
    return NextResponse.redirect(new URL("/pedidos", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
