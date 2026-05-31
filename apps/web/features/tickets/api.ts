const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

type ApiOptions = RequestInit & {
  authToken?: string | null;
};

function getDevFanHeaders(authToken?: string | null): Record<string, string> {
  if (authToken || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return {};
  }

  return {
    "x-localshow-dev-role": "FAN"
  };
}

export type TicketWalletItem = {
  id: string;
  code: string;
  status: "ACTIVE" | "CHECKED_IN" | "VOID";
  createdAt: string;
  checkedInAt?: string | null;
  event: {
    id: string;
    title: string;
    slug: string;
    startsAt: string;
    venue: {
      name: string;
      city: string;
      state: string;
    };
  };
  ticketType: {
    name: string;
    priceCents: number;
  };
  order?: {
    id: string;
    totalCents: number;
    status: "PENDING" | "PAID" | "CANCELED" | "REFUNDED";
    createdAt: string;
  };
};

export type CreateMockOrderResponse = {
  order: {
    id: string;
    totalCents: number;
    status: "PENDING" | "PAID" | "CANCELED" | "REFUNDED";
    createdAt: string;
  };
  tickets: TicketWalletItem[];
};

async function request<T>(path: string, init?: ApiOptions): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...getDevFanHeaders(init?.authToken),
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

export function createMockOrder(
  ticketTypeId: string,
  quantity = 1,
  authToken?: string | null,
  performerAttributionId?: string
) {
  return request<CreateMockOrderResponse>("/orders/mock", {
    authToken,
    method: "POST",
    body: JSON.stringify({
      ticketTypeId,
      quantity,
      performerAttributionId
    })
  });
}

export function listMyTickets(authToken?: string | null) {
  return request<TicketWalletItem[]>("/me/tickets", { authToken });
}

export function getMyTicket(ticketId: string, authToken?: string | null) {
  return request<TicketWalletItem>(`/me/tickets/${ticketId}`, { authToken });
}

export function transferMyTicket(
  ticketId: string,
  input: { recipientEmail: string; recipientName?: string },
  authToken?: string | null
) {
  return request<TicketWalletItem>(`/me/tickets/${ticketId}/transfer`, {
    authToken,
    method: "POST",
    body: JSON.stringify(input)
  });
}
