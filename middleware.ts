import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { getCredentialsRatelimit, isCredentialsLoginPost } from "@/lib/auth-rate-limit";
import { getSafeCallbackPath } from "@/lib/safe-callback-url";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  if (isCredentialsLoginPost(req.nextUrl.pathname, req.method)) {
    const rl = getCredentialsRatelimit();
    if (rl) {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "anonymous";
      const { success } = await rl.limit(`credentials:${ip}`);
      if (!success) {
        const errorUrl = new URL("/sign-in?error=ratelimit", req.url);
        return NextResponse.json(
          { url: errorUrl.href },
          {
            status: 429,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }
  }

  if (req.nextUrl.pathname.startsWith("/admin")) {
    const user = req.auth?.user as { role?: string } | undefined;
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("callbackUrl", getSafeCallbackPath(req.nextUrl.pathname));
      return NextResponse.redirect(url);
    }
    if (user.role !== "staff") {
      const url = req.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("callbackUrl", getSafeCallbackPath(req.nextUrl.pathname));
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/auth/:path*"],
};
