"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";

type AuthTokenContextValue = {
  getToken: () => Promise<string | null>;
};

const AuthTokenContext = createContext<AuthTokenContextValue>({
  getToken: async () => null
});

export function DevAuthTokenProvider({ children }: { children: ReactNode }) {
  return (
    <AuthTokenContext.Provider value={{ getToken: async () => null }}>
      {children}
    </AuthTokenContext.Provider>
  );
}

export function ClerkAuthTokenProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  return <AuthTokenContext.Provider value={{ getToken }}>{children}</AuthTokenContext.Provider>;
}

export function useApiAuthToken() {
  return useContext(AuthTokenContext);
}
