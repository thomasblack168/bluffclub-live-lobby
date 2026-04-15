import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold tracking-tight uppercase">Staff sign in</h1>
          <p className="text-sm text-zinc-400">Bluffclub Live admin</p>
        </div>
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-zinc-900" />}>
          <SignInForm />
        </Suspense>
        <p className="text-center text-xs text-zinc-500">
          <Link href="/" className="underline underline-offset-2 hover:text-zinc-300">
            Back to lobby
          </Link>
        </p>
      </div>
    </div>
  );
}
