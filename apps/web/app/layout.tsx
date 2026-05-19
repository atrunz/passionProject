import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalShow",
  description: "Lightweight ticketing for local venues, DIY shows, bars, and bands."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-zinc-200 bg-white/85 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
            <Link href="/" className="text-xl font-black tracking-tight text-zinc-950">
              LocalShow
            </Link>
            <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-zinc-700">
              <Link className="rounded-md px-2.5 py-2 transition hover:bg-zinc-100" href="/">
                Home
              </Link>
              <Link className="rounded-md px-2.5 py-2 transition hover:bg-zinc-100" href="/events">
                Events
              </Link>
              <Link className="rounded-md px-2.5 py-2 transition hover:bg-zinc-100" href="/tickets">
                Tickets
              </Link>
              <Link
                className="rounded-md px-2.5 py-2 transition hover:bg-zinc-100"
                href="/dashboard/venues"
              >
                Venues
              </Link>
              <Link
                className="rounded-md px-2.5 py-2 transition hover:bg-zinc-100"
                href="/dashboard/check-in"
              >
                Check-in
              </Link>
              <Link
                className="rounded-md bg-zinc-950 px-3 py-2 text-white transition hover:bg-zinc-700"
                href="/dashboard"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
