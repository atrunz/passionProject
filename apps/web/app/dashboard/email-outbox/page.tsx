import Link from "next/link";
import { Mail, Send, TriangleAlert } from "lucide-react";
import { listDevEmailOutbox } from "@/features/dashboard/api";
import { formatEventDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function getStatusClass(status: string) {
  if (status === "SENT") {
    return "bg-teal-50 text-teal-800";
  }

  if (status === "FAILED") {
    return "bg-red-50 text-red-700";
  }

  return "bg-zinc-100 text-zinc-700";
}

function formatType(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function EmailOutboxPage() {
  const emails = await listDevEmailOutbox(75);
  const queuedCount = emails.filter((email) => email.status === "QUEUED").length;
  const failedCount = emails.filter((email) => email.status === "FAILED").length;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-zinc-950"
      >
        ← Dashboard
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Dev communications
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">Email outbox</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Preview transactional emails queued by ticket purchases and transfers before a real provider is connected.
          </p>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <Mail className="size-5 text-teal-700" />
          <p className="mt-4 text-sm font-semibold text-zinc-500">Messages</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-zinc-950">{emails.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <Send className="size-5 text-teal-700" />
          <p className="mt-4 text-sm font-semibold text-zinc-500">Queued</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-zinc-950">{queuedCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <TriangleAlert className="size-5 text-amber-700" />
          <p className="mt-4 text-sm font-semibold text-zinc-500">Failed</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-zinc-950">{failedCount}</p>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white shadow-sm">
        {emails.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="mx-auto size-8 text-zinc-400" />
            <h2 className="mt-3 text-xl font-black tracking-tight text-zinc-950">No emails queued</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
              Reserve or transfer a ticket to generate transactional email records.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {emails.map((email) => (
              <article key={email.id} className="grid gap-4 p-5 lg:grid-cols-[260px_1fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${getStatusClass(email.status)}`}
                    >
                      {email.status}
                    </span>
                    <span className="text-xs font-black uppercase tracking-wide text-zinc-500">
                      {formatType(email.type)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-black text-zinc-950">{email.toEmail}</p>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">
                    {formatEventDate(email.createdAt)}
                  </p>
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-black tracking-tight text-zinc-950">{email.subject}</h2>
                  <pre className="mt-3 whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
                    {email.bodyText}
                  </pre>
                  {email.error ? (
                    <p className="mt-3 text-sm font-semibold text-red-700">{email.error}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
