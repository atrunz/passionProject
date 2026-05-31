import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrganizerEvent, listOrganizerVenues } from "@/features/dashboard/api";
import { getServerAuthToken } from "@/lib/server-auth-token";
import { EditEventForm } from "./edit-event-form";

export const dynamic = "force-dynamic";

type EditEventPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { eventId } = await params;
  const authToken = await getServerAuthToken();

  try {
    const [event, venues] = await Promise.all([
      getOrganizerEvent(eventId, authToken),
      listOrganizerVenues(authToken)
    ]);

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
          <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">Edit event</h1>
        </div>
        <EditEventForm event={event} venues={venues} />
      </main>
    );
  } catch {
    notFound();
  }
}
