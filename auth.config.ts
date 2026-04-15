import { JWTSessionError } from "@auth/core/errors";
import type { NextAuthConfig } from "next-auth";

const red = "\x1b[31m";
const reset = "\x1b[0m";

function logAuthError(error: unknown) {
  const err = error as Error & { type?: string };
  const name = typeof err.type === "string" ? err.type : err.name;
  console.error(`${red}[auth][error]${reset} ${name}: ${err.message}`);
  if (err.stack) {
    console.error(err.stack.replace(/^[^\n]+\n/, "").trim());
  }
}

export default {
  trustHost: true,
  providers: [],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/sign-in" },
  logger: {
    error(error) {
      // Broken session cookies are common in dev; logging them hides real errors.
      if (error instanceof JWTSessionError) return;
      logAuthError(error);
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role ?? "staff";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as string) ?? "staff";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
