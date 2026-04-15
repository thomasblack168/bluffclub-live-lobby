import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!req.auth?.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
