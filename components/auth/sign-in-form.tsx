"use client";

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
      className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4 shadow-xl"
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
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-sky-600 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-sky-500 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
