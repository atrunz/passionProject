import Link from "next/link";
import { AlertTriangle, CheckCircle2, Rocket, Settings2 } from "lucide-react";
import { getLaunchReadiness } from "@/features/dashboard/api";
import { formatEventDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function getStatusClass(status: string) {
  if (status === "READY") {
    return "border-teal-200 bg-teal-50 text-teal-800";
  }

  if (status === "WARNING") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

function getStatusIcon(status: string) {
  if (status === "READY") {
    return CheckCircle2;
  }

  if (status === "WARNING") {
    return AlertTriangle;
  }

  return Settings2;
}

export default async function LaunchPage() {
  const readiness = await getLaunchReadiness();
  const blockedCount = readiness.checks.filter((check) => check.status === "BLOCKED").length;
  const warningCount = readiness.checks.filter((check) => check.status === "WARNING").length;

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
            Deployment
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">Launch readiness</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            A practical checklist for what can run now, what is mocked, and what blocks a paid production launch.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-wide ${getStatusClass(readiness.status)}`}
        >
          <Rocket className="size-4" />
          {readiness.status}
        </span>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <CheckCircle2 className="size-5 text-teal-700" />
          <p className="mt-4 text-sm font-semibold text-zinc-500">Ready checks</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
            {readiness.checks.length - blockedCount - warningCount}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <AlertTriangle className="size-5 text-amber-700" />
          <p className="mt-4 text-sm font-semibold text-zinc-500">Warnings</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-zinc-950">{warningCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <Settings2 className="size-5 text-red-700" />
          <p className="mt-4 text-sm font-semibold text-zinc-500">Blocked</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-zinc-950">{blockedCount}</p>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight text-zinc-950">Environment checks</h2>
            <p className="mt-2 text-sm text-zinc-600">
              {readiness.environment} · checked {formatEventDate(readiness.checkedAt)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {readiness.checks.map((check) => {
            const Icon = getStatusIcon(check.status);

            return (
              <div
                key={check.key}
                className={`rounded-md border p-4 ${getStatusClass(check.status)}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <Icon className="mt-0.5 size-5 shrink-0" />
                    <div>
                      <h3 className="font-black tracking-tight">{check.label}</h3>
                      <p className="mt-1 text-sm leading-6">{check.detail}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black uppercase tracking-wide">{check.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black tracking-tight text-zinc-950">ASAP launch path</h2>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-700">
          <p>1. Deploy web and API with managed PostgreSQL and persistent object storage.</p>
          <p>2. Configure Clerk before real users create accounts.</p>
          <p>3. Configure Stripe only after checkout sessions are created exclusively by our backend.</p>
          <p>4. Swap the dev email outbox into a provider worker for order and transfer notifications.</p>
        </div>
      </section>
    </main>
  );
}
