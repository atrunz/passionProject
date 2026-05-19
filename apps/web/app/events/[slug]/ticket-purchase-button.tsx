"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMockOrder } from "@/features/tickets/api";

type TicketPurchaseButtonProps = {
  ticketTypeId: string;
  disabled: boolean;
};

export function TicketPurchaseButton({ ticketTypeId, disabled }: TicketPurchaseButtonProps) {
  const router = useRouter();
  const [isBuying, setIsBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buyTicket() {
    setError(null);
    setIsBuying(true);

    try {
      await createMockOrder(ticketTypeId, 1);
      router.push("/tickets");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not reserve ticket");
    } finally {
      setIsBuying(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={disabled || isBuying}
        onClick={buyTicket}
        className="w-full rounded-md bg-zinc-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600"
      >
        {isBuying ? "Reserving..." : disabled ? "Sold out" : "Reserve ticket"}
      </button>
      {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
