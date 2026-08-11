import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/jwt";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyAdminSessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
