"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { useApiAuthToken } from "@/components/auth-token-context";
import { transferMyTicket } from "@/features/tickets/api";

type TicketTransferFormProps = {
  ticketId: string;
  disabled: boolean;
};

export function TicketTransferForm({ ticketId, disabled }: TicketTransferFormProps) {
  const router = useRouter();
  const { getToken } = useApiAuthToken();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);

    try {
      const authToken = await getToken();
      await transferMyTicket(
        ticketId,
        {
          recipientEmail: String(form.get("recipientEmail") ?? ""),
          recipientName: String(form.get("recipientName") ?? "") || undefined
        },
        authToken
      );

      router.push("/tickets");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to transfer ticket");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black tracking-tight text-zinc-950">Transfer ticket</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        Send this ticket to another fan by email. Checked-in or void tickets cannot be transferred.
      </p>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Recipient email
          <input
            name="recipientEmail"
            required
            type="email"
            disabled={disabled || isSubmitting}
            placeholder="friend@example.com"
            className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Recipient name
          <input
            name="recipientName"
            disabled={disabled || isSubmitting}
            placeholder="Optional"
            className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
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
        disabled={disabled || isSubmitting}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="size-4" />
        {isSubmitting ? "Transferring..." : "Transfer ticket"}
      </button>
    </form>
  );
}
