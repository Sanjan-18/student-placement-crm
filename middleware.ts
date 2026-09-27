import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

const { auth } = NextAuth({
  ...authConfig,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const pathname = nextUrl.pathname;
      const publicPaths = ["/", "/login", "/api/auth", "/api/health"];

      const isPublic = publicPaths.some(
        (path) =>
          pathname === path ||
          pathname.startsWith(`${path}/`)
      );

      if (isPublic) return true;

      return !!auth?.user;
    },
  },
});

export default auth((request) => {
  const headers = new Headers(request.headers);
  headers.set("x-placement-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers,
    },
  });
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
