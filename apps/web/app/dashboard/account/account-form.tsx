"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { useApiAuthToken } from "@/components/auth-token-context";
import { updateOrganizerAccount, type OrganizerAccount } from "@/features/dashboard/api";

type AccountFormProps = {
  organizer: OrganizerAccount;
};

export function AccountForm({ organizer }: AccountFormProps) {
  const router = useRouter();
  const { getToken } = useApiAuthToken();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    const form = new FormData(event.currentTarget);

    try {
      const authToken = await getToken();
      await updateOrganizerAccount({
        name: String(form.get("name") ?? ""),
        slug: String(form.get("slug") ?? ""),
        description: String(form.get("description") ?? "")
      }, authToken);

      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update organizer account");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black tracking-tight">Organizer profile</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        This profile represents the venue, promoter, or collective that publishes events.
      </p>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Display name
          <input
            name="name"
            required
            defaultValue={organizer.name}
            className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Public slug
          <input
            name="slug"
            required
            defaultValue={organizer.slug}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className="rounded-md border border-zinc-300 px-3 py-2 font-mono font-normal lowercase outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Description
          <textarea
            name="description"
            rows={5}
            defaultValue={organizer.description ?? ""}
            className="resize-y rounded-md border border-zinc-300 px-3 py-2 font-normal leading-6 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
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
        disabled={isSaving}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-70"
      >
        <Save className="size-4" />
        {isSaving ? "Saving..." : "Save account"}
      </button>
    </form>
  );
}
