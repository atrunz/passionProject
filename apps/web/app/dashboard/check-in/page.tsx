import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CheckInForm } from "./check-in-form";

export default function CheckInPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 transition hover:text-zinc-950"
      >
        <ArrowLeft className="size-4" />
        Dashboard
      </Link>
      <div className="mb-8 mt-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
          Door operations
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">Check in tickets</h1>
      </div>
      <CheckInForm />
    </main>
  );
}
