const { NextResponse } = require("next/server");

export function middleware(request) {
  const token = request.cookies.get("token");
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");

  // Ana sayfa artık public değil, token gerektirir
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    // Korunması gereken diğer sayfaları buraya ekleyin
  ],
};
