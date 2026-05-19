import type { EventGenre } from "@localshow/shared";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

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
  status: "DRAFT" | "PUBLISHED" | "CANCELED";
  startsAt: string;
  endsAt: string | null;
  venue: Venue;
  ticketTypes: Array<{
    id: string;
    name: string;
    priceCents: number;
    quantityTotal: number;
    quantitySold: number;
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
  }>;
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

export function listOrganizerVenues() {
  return request<Venue[]>("/organizer/venues");
}

export function getOrganizerAccount() {
  return request<OrganizerAccount>("/organizer/me");
}

export function updateOrganizerAccount(input: UpdateOrganizerInput) {
  return request<OrganizerAccount>("/organizer/me", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function getOrganizerSummary() {
  return request<OrganizerSummary>("/organizer/summary");
}

export function createOrganizerVenue(input: CreateVenueInput) {
  return request<Venue>("/organizer/venues", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function listOrganizerEvents() {
  return request<DashboardEvent[]>("/organizer/events");
}

export function createOrganizerEvent(input: CreateEventInput) {
  return request<DashboardEvent>("/organizer/events", {
    method: "POST",
    body: JSON.stringify(input)
  });
}
