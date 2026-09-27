import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE =
  process.env.BINIX_SESSION_COOKIE_NAME || "binix_session";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (
    (pathname.startsWith("/app") ||
      pathname.startsWith("/admin")) &&
    !session
  ) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  /*
   * Important:
   * Presence of the opaque cookie does NOT prove that the session exists
   * in the repository. A stale cookie can survive a dev-server restart.
   * Therefore /login and /otp are not redirected here based only on
   * cookie presence. The backend `/auth/me` remains the source of truth.
   */

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/login", "/otp"],
};
