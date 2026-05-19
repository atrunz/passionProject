import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listOrganizerVenues } from "@/features/dashboard/api";
import { getServerAuthToken } from "@/lib/server-auth-token";
import { NewEventForm } from "./new-event-form";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const authToken = await getServerAuthToken();
  const venues = await listOrganizerVenues(authToken);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <Link
        href="/dashboard/events"
        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 transition hover:text-zinc-950"
      >
        <ArrowLeft className="size-4" />
        Events
      </Link>
      <div className="mb-8 mt-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
          Organizer
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">Create event</h1>
      </div>
      <NewEventForm initialVenues={venues} />
    </main>
  );
}
