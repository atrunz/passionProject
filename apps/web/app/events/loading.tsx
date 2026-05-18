export default function EventsLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <div className="h-4 w-24 rounded bg-zinc-200" />
      <div className="mt-3 h-10 w-72 rounded bg-zinc-200" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-72 rounded-lg border border-zinc-200 bg-white p-5">
            <div className="h-6 w-24 rounded-full bg-zinc-100" />
            <div className="mt-8 h-8 w-3/4 rounded bg-zinc-200" />
            <div className="mt-4 h-20 rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    </main>
  );
}
