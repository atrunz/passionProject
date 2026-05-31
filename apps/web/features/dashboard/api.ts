import type { EventGenre } from "@localshow/shared";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

type ApiOptions = RequestInit & {
  authToken?: string | null;
};

function getDevOrganizerHeaders(authToken?: string | null): Record<string, string> {
  if (authToken || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return {};
  }

  return {
    "x-localshow-dev-role": "ORGANIZER"
  };
}

export type Venue = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  capacity: number;
};

export type OrganizerAccount = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type OrganizerSummary = {
  organizerId: string;
  venueCount: number;
  eventCount: number;
  publishedEventCount: number;
  paidOrderCount: number;
  ticketCount: number;
  checkedInTicketCount: number;
  grossRevenueCents: number;
};

export type UpdateOrganizerInput = {
  name: string;
  slug: string;
  description?: string;
};

export type DashboardEvent = {
  id: string;
  title: string;
  slug: string;
  description: string;
  genre: EventGenre;
  posterUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "CANCELED";
  startsAt: string;
  endsAt: string | null;
  venue: Venue;
  performers: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  ticketTypes: Array<{
    id: string;
    name: string;
    priceCents: number;
    quantityTotal: number;
    quantitySold: number;
    salesStartAt: string | null;
    salesEndAt: string | null;
  }>;
};

export type OrganizerEventTicket = {
  id: string;
  code: string;
  status: "ACTIVE" | "CHECKED_IN" | "VOID";
  checkedInAt: string | null;
  createdAt: string;
  owner: {
    id: string;
    email: string;
    name: string | null;
  };
  ticketType: {
    id: string;
    name: string;
    priceCents: number;
  };
  performerAttribution: {
    id: string;
    name: string;
    slug: string;
  } | null;
  order: {
    id: string;
    totalCents: number;
    status: "PENDING" | "PAID" | "CANCELED" | "REFUNDED";
    createdAt: string;
  };
};

export type OrganizerOrder = {
  id: string;
  status: "PENDING" | "PAID" | "CANCELED" | "REFUNDED";
  totalCents: number;
  paymentProvider: string | null;
  paymentReference: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  event: {
    id: string;
    title: string;
    slug: string;
    startsAt: string;
  };
  performerAttribution: {
    id: string;
    name: string;
    slug: string;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    unitPriceCents: number;
    ticketType: {
      id: string;
      name: string;
    };
  }>;
  tickets: Array<{
    id: string;
    code: string;
    status: "ACTIVE" | "CHECKED_IN" | "VOID";
    checkedInAt: string | null;
  }>;
};

export type DevEmailNotification = {
  id: string;
  type: "ORDER_CONFIRMATION" | "TICKET_TRANSFER_SENT" | "TICKET_TRANSFER_RECEIVED";
  status: "QUEUED" | "SENT" | "FAILED";
  toEmail: string;
  subject: string;
  bodyText: string;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
  error: string | null;
};

export type LaunchReadiness = {
  status: "READY" | "WARNING" | "BLOCKED";
  service: string;
  environment: string;
  checkedAt: string;
  checks: Array<{
    key: string;
    label: string;
    status: "READY" | "WARNING" | "BLOCKED";
    detail: string;
  }>;
};

export type CreateVenueInput = {
  name: string;
  address: string;
  city: string;
  state: string;
  capacity: number;
};

export type CreateEventInput = {
  title: string;
  description: string;
  genre: EventGenre;
  venueId: string;
  startsAt: string;
  endsAt?: string;
  status: "DRAFT" | "PUBLISHED";
  ticketTypes: Array<{
    name: string;
    priceCents: number;
    quantityTotal: number;
    salesStartAt?: string;
    salesEndAt?: string;
  }>;
  performers?: Array<{
    name: string;
  }>;
};

export type UpdateEventStatusInput = {
  status: "DRAFT" | "PUBLISHED" | "CANCELED";
};

export type UpdateEventInput = {
  title: string;
  description: string;
  genre: EventGenre;
  venueId: string;
  startsAt: string;
  endsAt?: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELED";
  ticketTypes: Array<{
    id?: string;
    name: string;
    priceCents: number;
    quantityTotal: number;
    salesStartAt?: string;
    salesEndAt?: string;
  }>;
  performers?: Array<{
    id?: string;
    name: string;
  }>;
};

export type EventCopySuggestion = {
  title: string;
  description: string;
  genre: EventGenre;
  promoLine: string;
};

export type GenerateEventCopyInput = {
  idea: string;
  genre?: EventGenre;
  locationName?: string;
  city?: string;
};

async function request<T>(path: string, init?: ApiOptions): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...getDevOrganizerHeaders(init?.authToken),
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

export function listOrganizerVenues(authToken?: string | null) {
  return request<Venue[]>("/organizer/venues", { authToken });
}

export function getOrganizerAccount(authToken?: string | null) {
  return request<OrganizerAccount>("/organizer/me", { authToken });
}

export function updateOrganizerAccount(input: UpdateOrganizerInput, authToken?: string | null) {
  return request<OrganizerAccount>("/organizer/me", {
    authToken,
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function getOrganizerSummary(authToken?: string | null) {
  return request<OrganizerSummary>("/organizer/summary", { authToken });
}

export function getLaunchReadiness() {
  return request<LaunchReadiness>("/health/readiness");
}

export function createOrganizerVenue(input: CreateVenueInput, authToken?: string | null) {
  return request<Venue>("/organizer/venues", {
    authToken,
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function listOrganizerEvents(authToken?: string | null) {
  return request<DashboardEvent[]>("/organizer/events", { authToken });
}

export function getOrganizerEvent(eventId: string, authToken?: string | null) {
  return request<DashboardEvent>(`/organizer/events/${eventId}`, { authToken });
}

export function listOrganizerOrders(authToken?: string | null) {
  return request<OrganizerOrder[]>("/organizer/orders", { authToken });
}

export function getOrganizerOrder(orderId: string, authToken?: string | null) {
  return request<OrganizerOrder>(`/organizer/orders/${orderId}`, { authToken });
}

export function resendOrganizerOrderConfirmation(orderId: string, authToken?: string | null) {
  return request<{ queued: boolean; emailId: string; toEmail: string }>(
    `/organizer/orders/${orderId}/resend-confirmation`,
    {
      authToken,
      method: "POST"
    }
  );
}

export function listDevEmailOutbox(limit = 50) {
  return request<DevEmailNotification[]>(`/dev/email-outbox?limit=${limit}`);
}

export function listOrganizerEventTickets(eventId: string, authToken?: string | null) {
  return request<OrganizerEventTicket[]>(`/organizer/events/${eventId}/tickets`, { authToken });
}

export function updateOrganizerTicketStatus(
  eventId: string,
  ticketId: string,
  status: "ACTIVE" | "VOID",
  authToken?: string | null
) {
  return request<OrganizerEventTicket>(
    `/organizer/events/${eventId}/tickets/${ticketId}/status`,
    {
      authToken,
      method: "PATCH",
      body: JSON.stringify({ status })
    }
  );
}

export function createOrganizerEvent(input: CreateEventInput, authToken?: string | null) {
  return request<DashboardEvent>("/organizer/events", {
    authToken,
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateOrganizerEventStatus(
  eventId: string,
  input: UpdateEventStatusInput,
  authToken?: string | null
) {
  return request<DashboardEvent>(`/organizer/events/${eventId}/status`, {
    authToken,
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function updateOrganizerEvent(
  eventId: string,
  input: UpdateEventInput,
  authToken?: string | null
) {
  return request<DashboardEvent>(`/organizer/events/${eventId}`, {
    authToken,
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export async function uploadOrganizerEventPoster(
  eventId: string,
  file: File,
  authToken?: string | null
) {
  const form = new FormData();
  form.append("poster", file);

  const response = await fetch(`${apiUrl}/organizer/events/${eventId}/poster`, {
    method: "POST",
    headers: {
      ...getDevOrganizerHeaders(authToken),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    body: form,
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Poster upload failed");
  }

  return response.json() as Promise<DashboardEvent>;
}

export function generateEventCopy(input: GenerateEventCopyInput, authToken?: string | null) {
  return request<EventCopySuggestion>("/organizer/ai/event-copy", {
    authToken,
    method: "POST",
    body: JSON.stringify(input)
  });
}
