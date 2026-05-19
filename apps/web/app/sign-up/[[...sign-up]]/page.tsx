import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!clerkEnabled) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center px-5 py-12 sm:px-8">
        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Auth setup
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
            Account creation is staged for Clerk.
          </h1>
          <p className="mt-4 leading-7 text-zinc-700">
            Add your Clerk publishable key to <code>apps/web/.env.local</code>, then restart the
            dev server. After that, fans and organizers can create real accounts here.
          </p>
          <div className="mt-5 rounded-md bg-zinc-950 p-4 text-sm font-semibold text-white">
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=&quot;pk_test_...&quot;
          </div>
          <Link className="mt-6 inline-flex font-bold text-teal-700" href="/">
            Back home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-5 py-12">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/onboarding"
      />
    </main>
  );
}
