import { auth } from "@clerk/nextjs/server";

export async function getServerAuthToken() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return undefined;
  }

  try {
    const { getToken } = await auth();
    return (await getToken()) ?? undefined;
  } catch {
    return undefined;
  }
}
