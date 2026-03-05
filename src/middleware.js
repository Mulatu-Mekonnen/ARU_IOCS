// src/middleware.js

import { NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/signup"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public & system paths
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // ✅ FIX: use request, not req
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};