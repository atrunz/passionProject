"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, CircleAlert, Search } from "lucide-react";
import { useApiAuthToken } from "@/components/auth-token-context";
import { checkInTicket, type CheckInResult } from "@/features/checkins/api";
import { formatEventDate } from "@/lib/format";

export function CheckInForm() {
  const { getToken } = useApiAuthToken();
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setIsChecking(true);

    const form = new FormData(event.currentTarget);
    const ticketCode = String(form.get("ticketCode") ?? "");

    try {
      const authToken = await getToken();
      const response = await checkInTicket(ticketCode, authToken);
      setResult(response);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to check in ticket");
    } finally {
      setIsChecking(false);
    }
  }

  const isSuccess = result?.result === "SUCCESS";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <form onSubmit={handleSubmit} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black tracking-tight">Manual ticket lookup</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Paste a ticket code from the fan wallet. QR scanning can use this same endpoint later.
        </p>
        <label className="mt-5 grid gap-2 text-sm font-semibold text-zinc-800">
          Ticket code
          <input
            name="ticketCode"
            required
            placeholder="LS-TK-ABC12345"
            className="rounded-md border border-zinc-300 px-3 py-3 font-mono text-lg uppercase tracking-wide outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <button
          type="submit"
          disabled={isChecking}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-70"
        >
          <Search className="size-4" />
          {isChecking ? "Checking..." : "Check in ticket"}
        </button>
      </form>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black tracking-tight">Result</h2>
        {!result && !error ? (
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            Check-in results will appear here with ticket, event, and venue details.
          </p>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {result ? (
          <div
            className={`mt-4 rounded-md border p-4 ${
              isSuccess ? "border-teal-200 bg-teal-50" : "border-amber-200 bg-amber-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {isSuccess ? (
                <CheckCircle2 className="mt-0.5 size-5 text-teal-700" />
              ) : (
                <CircleAlert className="mt-0.5 size-5 text-amber-700" />
              )}
              <div>
                <p className={`text-sm font-black ${isSuccess ? "text-teal-800" : "text-amber-800"}`}>
                  {result.result.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-sm text-zinc-700">{result.message}</p>
              </div>
            </div>

            {result.ticket ? (
              <div className="mt-4 space-y-2 border-t border-black/10 pt-4 text-sm text-zinc-700">
                <p className="font-black text-zinc-950">{result.ticket.event.title}</p>
                <p>{result.ticket.ticketType.name}</p>
                <p>{formatEventDate(result.ticket.event.startsAt)}</p>
                <p>
                  {result.ticket.event.venue.name}, {result.ticket.event.venue.city},{" "}
                  {result.ticket.event.venue.state}
                </p>
                <p className="font-mono font-bold tracking-wide">{result.ticket.code}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
