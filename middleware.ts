import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Platform routes require NextAuth JWT with platform role
  if (pathname.startsWith("/platform")) {
    const token = await getToken({
      req: request,
      secret: env.NEXTAUTH_SECRET,
    });

    // No token = not authenticated
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role in token
    const role = token.role as string | undefined;
    if (
      !role ||
      (role !== "PLATFORM_OWNER" && role !== "PLATFORM_ADMIN")
    ) {
      // Authenticated but not authorized - return 403
      return new NextResponse("Forbidden: Platform role required", {
        status: 403,
      });
    }

    // Authorized - allow request
    return NextResponse.next();
  }

  // Other protected paths (admin, driver) - use existing Firebase cookie check
  const protectedPaths = ["/admin", "/driver"];

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // Verificar presencia de cookie (la verificación real se hace server-side)
    const sessionCookie = request.cookies.get(env.AUTH_COOKIE_NAME);

    if (!sessionCookie) {
      // Redirigir a login si no hay cookie
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (login routes)
     * - files with extensions (static assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth|.*\\..*).*)",
  ],
};

