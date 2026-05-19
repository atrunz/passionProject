"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createOrganizerVenue } from "@/features/dashboard/api";

export function VenueForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);

    try {
      await createOrganizerVenue({
        name: String(form.get("name") ?? ""),
        address: String(form.get("address") ?? ""),
        city: String(form.get("city") ?? ""),
        state: String(form.get("state") ?? "").toUpperCase(),
        capacity: Number(form.get("capacity") ?? 0)
      });

      event.currentTarget.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create venue");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black tracking-tight">Add venue</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        Venues become selectable when creating organizer events.
      </p>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Venue name
          <input
            name="name"
            required
            placeholder="The Harbor Room"
            className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Address
          <input
            name="address"
            required
            placeholder="100 Boardwalk Ave"
            className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-[1fr_90px]">
          <label className="grid gap-2 text-sm font-semibold text-zinc-800">
            City
            <input
              name="city"
              required
              placeholder="Asbury Park"
              className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-zinc-800">
            State
            <input
              name="state"
              required
              maxLength={2}
              placeholder="NJ"
              className="rounded-md border border-zinc-300 px-3 py-2 font-normal uppercase outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Capacity
          <input
            name="capacity"
            required
            min="1"
            type="number"
            placeholder="220"
            className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </label>
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-70"
      >
        <Plus className="size-4" />
        {isSubmitting ? "Adding..." : "Add venue"}
      </button>
    </form>
  );
}
