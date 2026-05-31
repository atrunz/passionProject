import Link from "next/link";
import { AuthNav } from "@/components/auth-nav";
import { DevRoleSwitcher } from "@/components/dev-role-switcher";
import { getMe, type CurrentUser } from "@/features/users/api";
import { getServerDevRole } from "@/lib/server-dev-role";
import { getServerAuthToken } from "@/lib/server-auth-token";

async function getHeaderUser() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!clerkEnabled) {
    const role = await getServerDevRole();

    return {
      clerkEnabled,
      devRole: role,
      user: { role } as CurrentUser
    };
  }

  const authToken = await getServerAuthToken();

  if (!authToken) {
    return {
      clerkEnabled,
      devRole: null,
      user: null
    };
  }

  try {
    return {
      clerkEnabled,
      devRole: null,
      user: await getMe(authToken)
    };
  } catch {
    return {
      clerkEnabled,
      devRole: null,
      user: null
    };
  }
}

export async function SiteHeader() {
  const { clerkEnabled, devRole, user } = await getHeaderUser();
  const isOrganizer = user?.role === "ORGANIZER" || user?.role === "ADMIN";

  return (
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
          {user ? (
            <Link className="rounded-md px-2.5 py-2 transition hover:bg-zinc-100" href="/tickets">
              Tickets
            </Link>
          ) : null}
          {user && !isOrganizer ? (
            <Link
              className="rounded-md px-2.5 py-2 transition hover:bg-zinc-100"
              href="/onboarding"
            >
              Become organizer
            </Link>
          ) : null}
          {isOrganizer ? (
            <>
              <Link
                className="rounded-md px-2.5 py-2 transition hover:bg-zinc-100"
                href="/dashboard/venues"
              >
                Locations
              </Link>
              <Link
                className="rounded-md px-2.5 py-2 transition hover:bg-zinc-100"
                href="/dashboard/check-in"
              >
                Check-in
              </Link>
              <Link
                className="rounded-md px-2.5 py-2 transition hover:bg-zinc-100"
                href="/dashboard/orders"
              >
                Orders
              </Link>
              <Link
                className="rounded-md px-2.5 py-2 transition hover:bg-zinc-100"
                href="/dashboard/launch"
              >
                Launch
              </Link>
              {!clerkEnabled ? (
                <Link
                  className="rounded-md px-2.5 py-2 transition hover:bg-zinc-100"
                  href="/dashboard/email-outbox"
                >
                  Email
                </Link>
              ) : null}
              <Link
                className="rounded-md bg-zinc-950 px-3 py-2 text-white transition hover:bg-zinc-700"
                href="/dashboard"
              >
                Dashboard
              </Link>
            </>
          ) : null}
          {!clerkEnabled ? (
            <DevRoleSwitcher currentRole={devRole ?? "ORGANIZER"} />
          ) : null}
          <AuthNav />
        </nav>
      </div>
    </header>
  );
}
