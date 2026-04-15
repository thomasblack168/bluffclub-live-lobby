"use client";

import { AnimatePresence, motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { getSafeCallbackPath, getSafePostSignInLocation } from "@/lib/safe-callback-url";

export function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackPath(searchParams.get("callbackUrl"));
  const queryError = searchParams.get("error");
  const [error, setError] = useState<string | null>(
    queryError === "ratelimit" ? "Too many sign-in attempts. Try again in a minute." : null,
  );
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setPending(false);
    if (res?.status === 429 || res?.error === "ratelimit") {
      setError("Too many sign-in attempts. Try again in a minute.");
      return;
    }
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    window.location.href = getSafePostSignInLocation(res?.url ?? callbackUrl, origin, callbackUrl);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4 shadow-xl transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(2,132,199,0.15)]"
    >
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wide text-zinc-400" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-0 focus:border-sky-500"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wide text-zinc-400" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-sky-500"
        />
      </div>
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            key="sign-in-error"
            className="text-sm text-red-400"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-transform duration-200 hover:bg-sky-500 active:scale-[0.99] disabled:opacity-50"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={pending ? "signing" : "signin"}
            className="inline-flex items-center gap-2"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.18 }}
          >
            {pending ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </form>
  );
}
