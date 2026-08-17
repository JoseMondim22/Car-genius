import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "acg_session";

async function getRole(token: string | undefined) {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.role as "ADMIN" | "EMPLOYEE";
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const role = await getRole(token);

  const isAuthRoute = pathname === "/login";
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute = pathname.startsWith("/dashboard") || isAdminRoute;

  if (isAuthRoute && role) {
    return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : "/dashboard", request.url));
  }

  if (isProtectedRoute && !role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/admin/:path*"],
};
