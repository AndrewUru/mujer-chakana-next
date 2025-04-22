import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("sb-access-token")?.value;

  // Protege rutas privadas
  const protectedRoutes = ["/dashboard", "/ciclo", "/configurar"];
  const pathname = request.nextUrl.pathname;

  if (protectedRoutes.includes(pathname) && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/ciclo", "/configurar"],
};
