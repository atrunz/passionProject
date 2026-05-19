import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { ClerkAuthTokenProvider, DevAuthTokenProvider } from "./auth-token-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return <DevAuthTokenProvider>{children}</DevAuthTokenProvider>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkAuthTokenProvider>{children}</ClerkAuthTokenProvider>
    </ClerkProvider>
  );
}
