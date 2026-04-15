import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
import type { Session } from "next-auth";

function secureSessionCookieFromEnv() {
  const url = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "";
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Public pages only need "is staff logged in?". Using `getToken` avoids the
 * Auth.js session handler path that logs {@link https://errors.authjs.dev#jwtsessionerror JWTSessionError}
 * for broken or stale cookies (wrong AUTH_SECRET, etc.). Invalid tokens return null quietly.
 */
export async function getSessionSafe(): Promise<Session | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  try {
    const h = await headers();
    const headerBag = new Headers();
    h.forEach((value, key) => headerBag.set(key, value));

    const token = await getToken({
      req: { headers: headerBag },
      secret,
      secureCookie: secureSessionCookieFromEnv(),
    });

    if (!token?.sub) return null;

    const expMs = typeof token.exp === "number" ? token.exp * 1000 : Date.now() + 86_400_000;

    return {
      expires: new Date(expMs).toISOString(),
      user: {
        id: token.sub,
        email: typeof token.email === "string" ? token.email : null,
        name: typeof token.name === "string" ? token.name : null,
        role: typeof token.role === "string" ? token.role : "staff",
      },
    };
  } catch {
    return null;
  }
}
