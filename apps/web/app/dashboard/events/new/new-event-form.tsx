"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { EVENT_GENRES, type EventGenre } from "@localshow/shared";
import {
  createOrganizerEvent,
  createOrganizerVenue,
  type CreateEventInput,
  type Venue
} from "@/features/dashboard/api";

type NewEventFormProps = {
  initialVenues: Venue[];
};

type TicketTypeForm = {
  name: string;
  priceDollars: string;
  quantityTotal: string;
};

export function NewEventForm({ initialVenues }: NewEventFormProps) {
  const router = useRouter();
  const [venues, setVenues] = useState(initialVenues);
  const [venueMode, setVenueMode] = useState<"existing" | "new">(
    initialVenues.length > 0 ? "existing" : "new"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    {
      name: "General Admission",
      priceDollars: "12",
      quantityTotal: "100"
    }
  ]);

  const defaultVenueId = useMemo(() => venues[0]?.id ?? "", [venues]);

  useEffect(() => {
    setIsReady(true);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);

    try {
      let venueId = String(form.get("venueId") ?? defaultVenueId);

      if (venueMode === "new") {
        const venue = await createOrganizerVenue({
          name: String(form.get("venueName") ?? ""),
          address: String(form.get("venueAddress") ?? ""),
          city: String(form.get("venueCity") ?? ""),
          state: String(form.get("venueState") ?? ""),
          capacity: Number(form.get("venueCapacity") ?? 0)
        });

        venueId = venue.id;
        setVenues((current) => [...current, venue]);
      }

      const payload: CreateEventInput = {
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        genre: String(form.get("genre") ?? "OTHER") as EventGenre,
        venueId,
        startsAt: new Date(String(form.get("startsAt"))).toISOString(),
        endsAt: form.get("endsAt") ? new Date(String(form.get("endsAt"))).toISOString() : undefined,
        status: String(form.get("status") ?? "PUBLISHED") as "DRAFT" | "PUBLISHED",
        ticketTypes: ticketTypes.map((ticketType) => ({
          name: ticketType.name,
          priceCents: Math.round(Number(ticketType.priceDollars) * 100),
          quantityTotal: Number(ticketType.quantityTotal)
        }))
      };

      const created = await createOrganizerEvent(payload);
      router.push(`/events/${created.slug}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black tracking-tight">Event details</h2>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-zinc-800">
              Title
              <input
                name="title"
                required
                placeholder="Friday Night Local Showcase"
                className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-800">
              Description
              <textarea
                name="description"
                required
                rows={5}
                placeholder="Tell fans what makes this show worth leaving the house for."
                className="resize-y rounded-md border border-zinc-300 px-3 py-2 font-normal leading-6 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                Genre
                <select
                  name="genre"
                  defaultValue="INDIE"
                  className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                >
                  {EVENT_GENRES.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                Status
                <select
                  name="status"
                  defaultValue="PUBLISHED"
                  className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                Starts at
                <input
                  name="startsAt"
                  required
                  type="datetime-local"
                  className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                Ends at
                <input
                  name="endsAt"
                  type="datetime-local"
                  className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black tracking-tight">Tickets</h2>
            <button
              type="button"
              onClick={() =>
                setTicketTypes((current) => [
                  ...current,
                  { name: "General Admission", priceDollars: "15", quantityTotal: "50" }
                ])
              }
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm font-bold transition hover:bg-zinc-50"
            >
              <Plus className="size-4" />
              Add type
            </button>
          </div>
          <div className="mt-5 grid gap-4">
            {ticketTypes.map((ticketType, index) => (
              <div key={index} className="grid gap-3 rounded-md border border-zinc-200 p-4 sm:grid-cols-[1fr_120px_120px_40px]">
                <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                  Name
                  <input
                    required
                    value={ticketType.name}
                    onChange={(event) =>
                      setTicketTypes((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, name: event.target.value } : item
                        )
                      )
                    }
                    className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                  Price
                  <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    value={ticketType.priceDollars}
                    onChange={(event) =>
                      setTicketTypes((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, priceDollars: event.target.value }
                            : item
                        )
                      )
                    }
                    className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                  Quantity
                  <input
                    required
                    min="1"
                    type="number"
                    value={ticketType.quantityTotal}
                    onChange={(event) =>
                      setTicketTypes((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, quantityTotal: event.target.value }
                            : item
                        )
                      )
                    }
                    className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </label>
                <button
                  type="button"
                  aria-label="Remove ticket type"
                  disabled={ticketTypes.length === 1}
                  onClick={() =>
                    setTicketTypes((current) => current.filter((_, itemIndex) => itemIndex !== index))
                  }
                  className="mt-7 inline-flex size-10 items-center justify-center rounded-md border border-zinc-300 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black tracking-tight">Venue</h2>
          <div className="mt-5 grid grid-cols-2 rounded-md border border-zinc-200 p-1">
            <button
              type="button"
              onClick={() => setVenueMode("existing")}
              disabled={venues.length === 0}
              className={`rounded px-3 py-2 text-sm font-bold transition ${
                venueMode === "existing" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-50"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              Existing
            </button>
            <button
              type="button"
              onClick={() => setVenueMode("new")}
              className={`rounded px-3 py-2 text-sm font-bold transition ${
                venueMode === "new" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              New
            </button>
          </div>

          {venueMode === "existing" ? (
            <label className="mt-5 grid gap-2 text-sm font-semibold text-zinc-800">
              Venue
              <select
                name="venueId"
                defaultValue={defaultVenueId}
                className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              >
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} · {venue.city}, {venue.state}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                Venue name
                <input name="venueName" required={venueMode === "new"} className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                Address
                <input name="venueAddress" required={venueMode === "new"} className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
              </label>
              <div className="grid grid-cols-[1fr_86px] gap-3">
                <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                  City
                  <input name="venueCity" required={venueMode === "new"} className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                  State
                  <input name="venueState" required={venueMode === "new"} maxLength={2} className="rounded-md border border-zinc-300 px-3 py-2 font-normal uppercase outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                Capacity
                <input name="venueCapacity" required={venueMode === "new"} min="1" type="number" className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
              </label>
            </div>
          )}
        </section>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!isReady || isSubmitting}
          className="w-full rounded-md bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-70"
        >
          {!isReady ? "Loading..." : isSubmitting ? "Creating..." : "Create event"}
        </button>
      </aside>
    </form>
  );
}
