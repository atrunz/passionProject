"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Ticket } from "lucide-react";
import { useApiAuthToken } from "@/components/auth-token-context";
import { createMockOrder } from "@/features/tickets/api";
import { formatCurrency } from "@/lib/format";

type TicketPurchaseButtonProps = {
  ticketTypeId: string;
  priceCents: number;
  available: number;
  disabled: boolean;
  disabledLabel?: string;
  performers: Array<{
    id: string;
    name: string;
  }>;
  initialPerformerId?: string;
};

export function TicketPurchaseButton({
  ticketTypeId,
  priceCents,
  available,
  disabled,
  disabledLabel = "Sold out",
  performers,
  initialPerformerId = ""
}: TicketPurchaseButtonProps) {
  const router = useRouter();
  const { getToken } = useApiAuthToken();
  const maxQuantity = Math.max(1, Math.min(8, available));
  const [quantity, setQuantity] = useState(1);
  const [performerAttributionId, setPerformerAttributionId] = useState(initialPerformerId);
  const [isBuying, setIsBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buyTicket() {
    setError(null);
    setIsBuying(true);

    try {
      const authToken = await getToken();
      const response = await createMockOrder(
        ticketTypeId,
        quantity,
        authToken,
        performerAttributionId || undefined
      );
      const firstTicket = response.tickets[0];
      router.push(firstTicket ? `/tickets/${firstTicket.id}` : "/tickets");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not reserve ticket");
    } finally {
      setIsBuying(false);
    }
  }

  return (
    <div className="mt-4">
      {!disabled ? (
        <>
          {performers.length > 0 ? (
            <label className="mb-3 grid gap-2 text-sm font-semibold text-zinc-800">
              Supporting
              <select
                value={performerAttributionId}
                onChange={(event) => setPerformerAttributionId(event.target.value)}
                className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              >
                <option value="">General sale / no specific act</option>
                {performers.map((performer) => (
                  <option key={performer.id} value={performer.id}>
                    {performer.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="mb-3 flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Quantity</p>
              <p className="text-sm font-black text-zinc-950">
                {formatCurrency(priceCents * quantity)} total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={quantity <= 1 || isBuying}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="inline-flex size-9 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center text-sm font-black text-zinc-950">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={quantity >= maxQuantity || isBuying}
                onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
                className="inline-flex size-9 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        </>
      ) : null}
      <button
        type="button"
        disabled={disabled || isBuying}
        onClick={buyTicket}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600"
      >
        <Ticket className="size-4" />
        {isBuying
          ? "Reserving..."
          : disabled
            ? disabledLabel
            : `Reserve ${quantity} ticket${quantity === 1 ? "" : "s"}`}
      </button>
      {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
