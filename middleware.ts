import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, isAuthenticatedCookie } from "@/lib/auth";

const protectedPaths = [
  "/dashboard",
  "/crypto",
  // "/idx",
  "/us-stocks",
  "/portfolio",
  "/watchlist",
  "/bookkeeping",
  "/alerts",
  "/journal",
  "/risk-management",
  "/capital-planning",
  "/rankings",
  "/settings",
];

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = isAuthenticatedCookie(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
