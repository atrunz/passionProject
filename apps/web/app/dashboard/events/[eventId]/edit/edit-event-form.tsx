"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Plus, Save, Trash2, Upload } from "lucide-react";
import { EVENT_GENRES, type EventGenre } from "@localshow/shared";
import { useApiAuthToken } from "@/components/auth-token-context";
import {
  uploadOrganizerEventPoster,
  updateOrganizerEvent,
  type DashboardEvent,
  type UpdateEventInput,
  type Venue
} from "@/features/dashboard/api";
import { revalidateEventViews } from "../../event-cache-actions";

type EditEventFormProps = {
  event: DashboardEvent;
  venues: Venue[];
};

type TicketTypeForm = {
  id?: string;
  name: string;
  priceDollars: string;
  quantityTotal: string;
  quantitySold: number;
  salesStartAt: string;
  salesEndAt: string;
};

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function EditEventForm({ event, venues }: EditEventFormProps) {
  const router = useRouter();
  const { getToken } = useApiAuthToken();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [venueId, setVenueId] = useState(event.venue.id);
  const [posterUrl, setPosterUrl] = useState(event.posterUrl);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>(
    event.ticketTypes.map((ticketType) => ({
      id: ticketType.id,
      name: ticketType.name,
      priceDollars: String(ticketType.priceCents / 100),
      quantityTotal: String(ticketType.quantityTotal),
      quantitySold: ticketType.quantitySold,
      salesStartAt: toDateTimeLocal(ticketType.salesStartAt),
      salesEndAt: toDateTimeLocal(ticketType.salesEndAt)
    }))
  );
  const [performers, setPerformers] = useState(
    event.performers.length > 0 ? event.performers.map((performer) => performer.name) : [""]
  );
  const selectedLocation = useMemo(
    () => venues.find((venue) => venue.id === venueId),
    [venueId, venues]
  );
  const ticketCapacity = ticketTypes.reduce(
    (total, ticketType) => total + Number(ticketType.quantityTotal || 0),
    0
  );
  const exceedsLocationCapacity = selectedLocation
    ? ticketCapacity > selectedLocation.capacity
    : false;

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = new FormData(formEvent.currentTarget);

    const payload: UpdateEventInput = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      genre: String(form.get("genre") ?? "OTHER") as EventGenre,
      venueId,
      startsAt: new Date(String(form.get("startsAt"))).toISOString(),
      endsAt: form.get("endsAt") ? new Date(String(form.get("endsAt"))).toISOString() : undefined,
      status: String(form.get("status") ?? "DRAFT") as UpdateEventInput["status"],
      ticketTypes: ticketTypes.map((ticketType) => ({
        id: ticketType.id,
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

    try {
      if (exceedsLocationCapacity) {
        throw new Error(
          `Ticket capacity (${ticketCapacity}) cannot exceed location capacity (${selectedLocation?.capacity})`
        );
      }

      const authToken = await getToken();
      const updated = await updateOrganizerEvent(event.id, payload, authToken);
      await revalidateEventViews(updated.slug);
      router.push("/dashboard/events");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update event");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePosterUpload() {
    if (!posterFile) {
      return;
    }

    setError(null);
    setIsUploadingPoster(true);

    try {
      const authToken = await getToken();
      const updated = await uploadOrganizerEventPoster(event.id, posterFile, authToken);
      setPosterUrl(updated.posterUrl);
      setPosterFile(null);
      await revalidateEventViews(updated.slug);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to upload poster");
    } finally {
      setIsUploadingPoster(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black tracking-tight">Event details</h2>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-zinc-800">
            Title
            <input
              name="title"
              required
              defaultValue={event.title}
              className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-zinc-800">
            Description
            <textarea
              name="description"
              required
              rows={6}
              defaultValue={event.description}
              className="resize-y rounded-md border border-zinc-300 px-3 py-2 font-normal leading-6 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-zinc-800">
              Genre
              <select
                name="genre"
                defaultValue={event.genre}
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
                defaultValue={event.status}
                className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CANCELED">Canceled</option>
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
                defaultValue={toDateTimeLocal(event.startsAt)}
                className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-800">
              Ends at
              <input
                name="endsAt"
                type="datetime-local"
                defaultValue={toDateTimeLocal(event.endsAt)}
                className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </label>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black tracking-tight">Poster</h2>
          <div className="mt-5 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={`${event.title} poster`}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center">
                <ImagePlus className="size-8 text-zinc-400" />
              </div>
            )}
          </div>
          <label className="mt-4 grid gap-2 text-sm font-semibold text-zinc-800">
            Upload image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(changeEvent) => setPosterFile(changeEvent.target.files?.[0] ?? null)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-normal file:mr-3 file:rounded-md file:border-0 file:bg-zinc-950 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
            />
          </label>
          <button
            type="button"
            onClick={handlePosterUpload}
            disabled={!posterFile || isUploadingPoster}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 py-3 text-sm font-black text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="size-4" />
            {isUploadingPoster ? "Uploading..." : "Upload poster"}
          </button>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight">Lineup tracking</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Performer names become attribution choices and share links on the public event page.
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
                    onChange={(changeEvent) =>
                      setPerformers((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? changeEvent.target.value : item
                        )
                      )
                    }
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
          <h2 className="text-xl font-black tracking-tight">Location</h2>
          <label className="mt-5 grid gap-2 text-sm font-semibold text-zinc-800">
            Location
            <select
              name="venueId"
              value={venueId}
              onChange={(changeEvent) => setVenueId(changeEvent.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            >
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} · {venue.city}, {venue.state}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight">Tickets</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Capacity cannot be reduced below tickets already sold.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setTicketTypes((current) => [
                  ...current,
                  {
                    name: "General Admission",
                    priceDollars: "15",
                    quantityTotal: "50",
                    quantitySold: 0,
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
          <div className="mt-4 grid gap-3">
            {ticketTypes.map((ticketType, index) => (
              <div key={ticketType.id ?? index} className="grid gap-3 rounded-md border border-zinc-200 p-3">
                <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                  Name
                  <input
                    required
                    value={ticketType.name}
                    onChange={(changeEvent) =>
                      setTicketTypes((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, name: changeEvent.target.value } : item
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
                      onChange={(changeEvent) =>
                        setTicketTypes((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, priceDollars: changeEvent.target.value }
                              : item
                          )
                        )
                      }
                      className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                    Capacity
                    <input
                      required
                      min={Math.max(1, ticketType.quantitySold)}
                      type="number"
                      value={ticketType.quantityTotal}
                      onChange={(changeEvent) =>
                        setTicketTypes((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, quantityTotal: changeEvent.target.value }
                              : item
                          )
                        )
                      }
                      className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    />
                  </label>
                  <button
                    type="button"
                    aria-label="Remove unsaved ticket type"
                    disabled={Boolean(ticketType.id) || ticketTypes.length === 1}
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
                      onChange={(changeEvent) =>
                        setTicketTypes((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, salesStartAt: changeEvent.target.value }
                              : item
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
                      onChange={(changeEvent) =>
                        setTicketTypes((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, salesEndAt: changeEvent.target.value }
                              : item
                          )
                        )
                      }
                      className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    />
                  </label>
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  {ticketType.quantitySold} sold
                </p>
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

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-70"
        >
          <Save className="size-4" />
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </aside>
    </form>
  );
}
