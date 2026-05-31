import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listOrganizerEvents } from "@/features/dashboard/api";
import { getServerAuthToken } from "@/lib/server-auth-token";
import { CheckInForm } from "./check-in-form";

export const dynamic = "force-dynamic";

export default async function CheckInPage() {
  const authToken = await getServerAuthToken();
  const now = Date.now();
  const events = (await listOrganizerEvents(authToken))
    .filter((event) => event.status === "PUBLISHED")
    .sort((first, second) => {
      const firstTime = new Date(first.startsAt).getTime();
      const secondTime = new Date(second.startsAt).getTime();
      const firstIsPast = firstTime < now;
      const secondIsPast = secondTime < now;

      if (firstIsPast !== secondIsPast) {
        return firstIsPast ? 1 : -1;
      }

      return firstTime - secondTime;
    });

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
      <CheckInForm events={events} />
    </main>
  );
}
