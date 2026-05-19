const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export type TicketWalletItem = {
  id: string;
  code: string;
  status: "ACTIVE" | "CHECKED_IN" | "VOID";
  createdAt: string;
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
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
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

export function createMockOrder(ticketTypeId: string, quantity = 1) {
  return request("/orders/mock", {
    method: "POST",
    body: JSON.stringify({
      ticketTypeId,
      quantity
    })
  });
}

export function listMyTickets() {
  return request<TicketWalletItem[]>("/me/tickets");
}
