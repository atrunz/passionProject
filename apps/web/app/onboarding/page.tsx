import { getMe } from "@/features/users/api";
import { getServerAuthToken } from "@/lib/server-auth-token";
import { OnboardingForm } from "./onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const authToken = await getServerAuthToken();
  const user = await getMe(authToken);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
          Account setup
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">
          What are you using LocalShow for?
        </h1>
        <p className="mt-3 text-base leading-7 text-zinc-600">
          LocalShow has two modes: fan wallet and organizer workspace. Choose the path that fits
          what you want to do first.
        </p>
      </div>

      <OnboardingForm user={user} />
    </main>
  );
}
