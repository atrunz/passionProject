"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useApiAuthToken } from "@/components/auth-token-context";
import { resendOrganizerOrderConfirmation } from "@/features/dashboard/api";

type ResendConfirmationButtonProps = {
  orderId: string;
  disabled: boolean;
};

export function ResendConfirmationButton({ orderId, disabled }: ResendConfirmationButtonProps) {
  const { getToken } = useApiAuthToken();
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    setIsSending(true);
    setMessage(null);
    setError(null);

    try {
      const authToken = await getToken();
      const response = await resendOrganizerOrderConfirmation(orderId, authToken);
      setMessage(`Queued for ${response.toEmail}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not queue confirmation email");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={resend}
        disabled={disabled || isSending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600"
      >
        <Send className="size-4" />
        {isSending ? "Queueing..." : "Resend confirmation"}
      </button>
      {message ? <p className="mt-2 text-sm font-semibold text-teal-700">{message}</p> : null}
      {error ? <p className="mt-2 text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
