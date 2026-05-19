"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Ticket } from "lucide-react";
import { useApiAuthToken } from "@/components/auth-token-context";
import { updateMe, type CurrentUser } from "@/features/users/api";

type OnboardingFormProps = {
  user: CurrentUser;
};

export function OnboardingForm({ user }: OnboardingFormProps) {
  const router = useRouter();
  const { getToken } = useApiAuthToken();
  const [isSubmittingRole, setIsSubmittingRole] = useState<"FAN" | "ORGANIZER" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function chooseRole(role: "FAN" | "ORGANIZER") {
    setError(null);
    setIsSubmittingRole(role);

    try {
      const authToken = await getToken();
      await updateMe({ role }, authToken);
      router.push(role === "ORGANIZER" ? "/dashboard/account" : "/events");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save account type");
    } finally {
      setIsSubmittingRole(null);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <button
        type="button"
        onClick={() => chooseRole("FAN")}
        disabled={Boolean(isSubmittingRole)}
        className="group rounded-lg border border-zinc-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md disabled:cursor-wait disabled:opacity-70"
      >
        <Ticket className="size-7 text-teal-700" />
        <h2 className="mt-5 text-2xl font-black tracking-tight text-zinc-950">I’m here for shows</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Browse local events, reserve tickets, and keep QR tickets in your wallet.
        </p>
        <span className="mt-6 inline-flex rounded-md bg-zinc-950 px-4 py-3 text-sm font-black text-white">
          {isSubmittingRole === "FAN" ? "Saving..." : "Continue as fan"}
        </span>
      </button>

      <button
        type="button"
        onClick={() => chooseRole("ORGANIZER")}
        disabled={Boolean(isSubmittingRole)}
        className="group rounded-lg border border-zinc-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md disabled:cursor-wait disabled:opacity-70"
      >
        <CalendarPlus className="size-7 text-teal-700" />
        <h2 className="mt-5 text-2xl font-black tracking-tight text-zinc-950">I run events</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Set up an organizer profile, add venues, publish listings, and check fans in.
        </p>
        <span className="mt-6 inline-flex rounded-md bg-zinc-950 px-4 py-3 text-sm font-black text-white">
          {isSubmittingRole === "ORGANIZER" ? "Saving..." : "Continue as organizer"}
        </span>
      </button>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 md:col-span-2">
          {error}
        </div>
      ) : null}

      <p className="text-sm leading-6 text-zinc-600 md:col-span-2">
        Signed in as <span className="font-bold text-zinc-950">{user.email}</span>. You can change
        direction later while the product is in MVP mode.
      </p>
    </div>
  );
}
