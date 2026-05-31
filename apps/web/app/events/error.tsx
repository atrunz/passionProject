"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

type EventsErrorProps = {
  reset: () => void;
};

export default function EventsError({ reset }: EventsErrorProps) {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <div className="rounded-lg border border-amber-200 bg-white p-8 shadow-sm">
        <AlertTriangle className="size-8 text-amber-600" />
        <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950">
          Events are temporarily unavailable
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          LocalShow could not reach the events API. Check that the API server is running, then try
          again.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-700"
          >
            <RefreshCw className="size-4" />
            Retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-zinc-300 px-4 py-3 text-sm font-black text-zinc-700 transition hover:bg-zinc-50"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
