const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

type ApiOptions = RequestInit & {
  authToken?: string | null;
};

export type UserRole = "FAN" | "ORGANIZER" | "ADMIN";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type UpdateMeInput = {
  name?: string;
  role?: "FAN" | "ORGANIZER";
};

async function request<T>(path: string, init?: ApiOptions): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.authToken ? { Authorization: `Bearer ${init.authToken}` } : {}),
      ...init?.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  return response.json();
}

export function getMe(authToken?: string | null) {
  return request<CurrentUser>("/me", { authToken });
}

export function updateMe(input: UpdateMeInput, authToken?: string | null) {
  return request<CurrentUser>("/me", {
    authToken,
    method: "PATCH",
    body: JSON.stringify(input)
  });
}
