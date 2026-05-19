"use client";

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function AuthNav() {
  if (!clerkEnabled) {
    return (
      <div className="flex items-center gap-2">
        <Link className="rounded-md px-2.5 py-2 transition hover:bg-zinc-100" href="/sign-in">
          Sign in
        </Link>
        <Link
          className="rounded-md border border-zinc-300 px-2.5 py-2 transition hover:bg-zinc-100"
          href="/sign-up"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="rounded-md px-2.5 py-2 font-bold transition hover:bg-zinc-100">
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="rounded-md border border-zinc-300 px-2.5 py-2 font-bold transition hover:bg-zinc-100">
            Sign up
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
