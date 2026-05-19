import Link from "next/link";
import { ArrowLeft, Building2, UserRound } from "lucide-react";
import { getOrganizerAccount } from "@/features/dashboard/api";
import { AccountForm } from "./account-form";

export default async function AccountPage() {
  const organizer = await getOrganizerAccount();

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 transition hover:text-zinc-950"
      >
        <ArrowLeft className="size-4" />
        Dashboard
      </Link>

      <div className="mb-8 mt-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
          Account setup
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">Organizer account</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AccountForm organizer={organizer} />

        <aside className="space-y-4">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <Building2 className="size-6 text-teal-700" />
            <h2 className="mt-4 text-xl font-black tracking-tight">Venue-ready profile</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              This is the profile future customers will create after signup before adding venues and
              publishing events.
            </p>
          </section>
          <section className="rounded-lg border border-dashed border-zinc-300 bg-white p-5">
            <UserRound className="size-6 text-zinc-400" />
            <h2 className="mt-4 text-xl font-black tracking-tight">Auth comes next</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Clerk will replace the current development organizer and attach this account to the
              signed-in user.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
