"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-200 hover:bg-zinc-800"
    >
      Sign out
    </button>
  );
}
