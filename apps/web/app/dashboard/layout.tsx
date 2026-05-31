import { redirect } from "next/navigation";
import { getMe } from "@/features/users/api";
import { getServerDevRole } from "@/lib/server-dev-role";
import { getServerAuthToken } from "@/lib/server-auth-token";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!clerkEnabled) {
    const devRole = await getServerDevRole();

    if (devRole !== "ORGANIZER") {
      redirect("/events");
    }

    return children;
  }

  const authToken = await getServerAuthToken();

  if (!authToken) {
    redirect("/sign-in");
  }

  const user = await getMe(authToken);

  if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
    redirect("/onboarding");
  }

  return children;
}
