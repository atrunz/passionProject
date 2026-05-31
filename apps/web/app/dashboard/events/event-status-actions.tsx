"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Eye, FilePenLine } from "lucide-react";
import { useApiAuthToken } from "@/components/auth-token-context";
import { updateOrganizerEventStatus, type DashboardEvent } from "@/features/dashboard/api";
import { revalidateEventViews } from "./event-cache-actions";

type EventStatusActionsProps = {
  event: DashboardEvent;
};

const nextActions = {
  DRAFT: [
    {
      label: "Publish",
      status: "PUBLISHED",
      Icon: Eye
    },
    {
      label: "Cancel",
      status: "CANCELED",
      Icon: Ban
    }
  ],
  PUBLISHED: [
    {
      label: "Move to draft",
      status: "DRAFT",
      Icon: FilePenLine
    },
    {
      label: "Cancel",
      status: "CANCELED",
      Icon: Ban
    }
  ],
  CANCELED: [
    {
      label: "Reopen as draft",
      status: "DRAFT",
      Icon: FilePenLine
    }
  ]
} as const;

export function EventStatusActions({ event }: EventStatusActionsProps) {
  const router = useRouter();
  const { getToken } = useApiAuthToken();
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: "DRAFT" | "PUBLISHED" | "CANCELED") {
    setError(null);
    setPendingStatus(status);

    try {
      const authToken = await getToken();
      const updated = await updateOrganizerEventStatus(event.id, { status }, authToken);
      await revalidateEventViews(updated.slug);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update event");
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        {nextActions[event.status].map((action) => {
          const Icon = action.Icon;
          const isPending = pendingStatus === action.status;

          return (
            <button
              key={action.status}
              type="button"
              onClick={() => updateStatus(action.status)}
              disabled={pendingStatus !== null}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-wait disabled:opacity-60"
            >
              <Icon className="size-4" />
              {isPending ? "Updating..." : action.label}
            </button>
          );
        })}
      </div>
      {error ? <p className="max-w-80 text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
