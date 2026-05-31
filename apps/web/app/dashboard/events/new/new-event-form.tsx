"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Sparkles, Plus, Trash2 } from "lucide-react";
import { EVENT_GENRES, type EventGenre } from "@localshow/shared";
import { useApiAuthToken } from "@/components/auth-token-context";
import {
  createOrganizerEvent,
  createOrganizerVenue,
  generateEventCopy,
  type CreateEventInput,
  type Venue
} from "@/features/dashboard/api";
import { revalidateEventViews } from "../event-cache-actions";

type NewEventFormProps = {
  initialVenues: Venue[];
};

type TicketTypeForm = {
  name: string;
  priceDollars: string;
  quantityTotal: string;
  salesStartAt: string;
  salesEndAt: string;
};

export function NewEventForm({ initialVenues }: NewEventFormProps) {
  const router = useRouter();
  const { getToken } = useApiAuthToken();
  const [venues, setVenues] = useState(initialVenues);
  const [venueMode, setVenueMode] = useState<"existing" | "new">(
    initialVenues.length > 0 ? "existing" : "new"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyIdea, setCopyIdea] = useState("");
  const [promoLine, setPromoLine] = useState("");
  const [copiedPromoLine, setCopiedPromoLine] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState<EventGenre>("INDIE");
  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    {
      name: "General Admission",
      priceDollars: "12",
      quantityTotal: "100",
      salesStartAt: "",
      salesEndAt: ""
    }
  ]);
  const [performers, setPerformers] = useState<string[]>([""]);

  const defaultVenueId = useMemo(() => venues[0]?.id ?? "", [venues]);
  const selectedLocation = useMemo(
    () => venues.find((venue) => venue.id === defaultVenueId),
    [defaultVenueId, venues]
  );
  const ticketCapacity = ticketTypes.reduce(
    (total, ticketType) => total + Number(ticketType.quantityTotal || 0),
    0
  );
  const exceedsLocationCapacity = selectedLocation
    ? ticketCapacity > selectedLocation.capacity
    : false;

  useEffect(() => {
    setIsReady(true);
  }, []);

  async function handleGenerateCopy() {
    setError(null);
    setIsGeneratingCopy(true);

    try {
      const authToken = await getToken();
      const suggestion = await generateEventCopy(
        {
          idea: copyIdea || title || description || "local show",
          genre,
          locationName: selectedLocation?.name,
          city: selectedLocation?.city
        },
        authToken
      );

      setTitle(suggestion.title);
      setDescription(suggestion.description);
      setGenre(suggestion.genre);
      setPromoLine(suggestion.promoLine);
      setCopiedPromoLine(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to generate event copy");
    } finally {
      setIsGeneratingCopy(false);
    }
  }

  async function copyPromoLine() {
    if (!promoLine) {
      return;
    }

    await navigator.clipboard.writeText(promoLine);
    setCopiedPromoLine(true);
    window.setTimeout(() => setCopiedPromoLine(false), 1800);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);

    try {
      if (exceedsLocationCapacity) {
        throw new Error(
          `Ticket capacity (${ticketCapacity}) cannot exceed location capacity (${selectedLocation?.capacity})`
        );
      }

      const authToken = await getToken();
      let venueId = String(form.get("venueId") ?? defaultVenueId);

      if (venueMode === "new") {
        const venue = await createOrganizerVenue(
          {
            name: String(form.get("venueName") ?? ""),
            address: String(form.get("venueAddress") ?? ""),
            city: String(form.get("venueCity") ?? ""),
            state: String(form.get("venueState") ?? ""),
            capacity: Number(form.get("venueCapacity") ?? 0)
          },
          authToken
        );

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
          quantityTotal: Number(ticketType.quantityTotal),
          salesStartAt: ticketType.salesStartAt
            ? new Date(ticketType.salesStartAt).toISOString()
            : undefined,
          salesEndAt: ticketType.salesEndAt ? new Date(ticketType.salesEndAt).toISOString() : undefined
        })),
        performers: performers
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name) => ({ name }))
      };

      const created = await createOrganizerEvent(payload, authToken);
      await revalidateEventViews(created.slug);
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
                value={title}
                onChange={(event) => setTitle(event.target.value)}
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
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Tell fans what makes this show worth leaving the house for."
                className="resize-y rounded-md border border-zinc-300 px-3 py-2 font-normal leading-6 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <div className="rounded-md border border-teal-100 bg-teal-50/60 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 size-5 text-teal-700" />
                <div className="min-w-0 flex-1">
                  <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                    AI copy assistant
                    <textarea
                      value={copyIdea}
                      onChange={(event) => setCopyIdea(event.target.value)}
                      rows={3}
                      placeholder="Three-band punk night with touring opener, cheap tickets, all ages..."
                      className="resize-y rounded-md border border-teal-200 bg-white px-3 py-2 font-normal leading-6 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateCopy}
                    disabled={isGeneratingCopy || (!copyIdea.trim() && !title.trim() && !description.trim())}
                    className="mt-3 inline-flex items-center gap-2 rounded-md bg-teal-700 px-3 py-2 text-sm font-black text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles className="size-4" />
                    {isGeneratingCopy ? "Drafting..." : "Suggest copy"}
                  </button>
                  {promoLine ? (
                    <div className="mt-4 rounded-md border border-teal-200 bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wide text-teal-800">
                            Promo line
                          </p>
                          <p className="mt-1 text-sm leading-6 text-zinc-700">{promoLine}</p>
                        </div>
                        <button
                          type="button"
                          onClick={copyPromoLine}
                          className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-zinc-300 text-zinc-600 transition hover:bg-zinc-50"
                          aria-label="Copy promo line"
                        >
                          {copiedPromoLine ? <Check className="size-4" /> : <Copy className="size-4" />}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                Genre
                <select
                  name="genre"
                  value={genre}
                  onChange={(event) => setGenre(event.target.value as EventGenre)}
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
            <div>
              <h2 className="text-xl font-black tracking-tight">Lineup tracking</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Add bands, comics, DJs, or artists to generate attribution choices and share links.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPerformers((current) => [...current, ""])}
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm font-bold transition hover:bg-zinc-50"
            >
              <Plus className="size-4" />
              Add act
            </button>
          </div>
          <div className="mt-5 grid gap-3">
            {performers.map((performer, index) => (
              <div key={index} className="grid gap-3 sm:grid-cols-[1fr_40px]">
                <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                  Act name
                  <input
                    value={performer}
                    onChange={(event) =>
                      setPerformers((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? event.target.value : item
                        )
                      )
                    }
                    placeholder="The Midnight Openers"
                    className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </label>
                <button
                  type="button"
                  aria-label="Remove act"
                  disabled={performers.length === 1}
                  onClick={() => setPerformers((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  className="mt-7 inline-flex size-10 items-center justify-center rounded-md border border-zinc-300 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
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
                  {
                    name: "General Admission",
                    priceDollars: "15",
                    quantityTotal: "50",
                    salesStartAt: "",
                    salesEndAt: ""
                  }
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
              <div key={index} className="grid gap-3 rounded-md border border-zinc-200 p-4">
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
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_40px]">
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
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                    Sales start
                    <input
                      type="datetime-local"
                      value={ticketType.salesStartAt}
                      onChange={(event) =>
                        setTicketTypes((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, salesStartAt: event.target.value } : item
                          )
                        )
                      }
                      className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                    Sales end
                    <input
                      type="datetime-local"
                      value={ticketType.salesEndAt}
                      onChange={(event) =>
                        setTicketTypes((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, salesEndAt: event.target.value } : item
                          )
                        )
                      }
                      className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
          {selectedLocation ? (
            <p
              className={`mt-4 text-sm font-semibold ${
                exceedsLocationCapacity ? "text-red-700" : "text-zinc-600"
              }`}
            >
              Ticket capacity: {ticketCapacity} / {selectedLocation.capacity} at {selectedLocation.name}
            </p>
          ) : null}
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black tracking-tight">Location</h2>
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
              Location
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
                Location name
                <input name="venueName" required={venueMode === "new"} className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                Address
                <input name="venueAddress" required={venueMode === "new"} className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
              </label>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_72px]">
                <label className="grid min-w-0 gap-2 text-sm font-semibold text-zinc-800">
                  City
                  <input name="venueCity" required={venueMode === "new"} className="w-full rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
                </label>
                <label className="grid min-w-0 gap-2 text-sm font-semibold text-zinc-800">
                  State
                  <input name="venueState" required={venueMode === "new"} maxLength={2} className="w-full rounded-md border border-zinc-300 px-3 py-2 font-normal uppercase outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
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
