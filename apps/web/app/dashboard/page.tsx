export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Organizer</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">Dashboard</h1>
      <div className="mt-8 rounded-lg border border-dashed border-zinc-300 bg-white p-8">
        <h2 className="text-xl font-bold">Next milestone</h2>
        <p className="mt-2 max-w-2xl text-zinc-600">
          Auth, organizer profiles, event creation, and ticket inventory will land here after the
          public browsing foundation is verified.
        </p>
      </div>
    </main>
  );
}
