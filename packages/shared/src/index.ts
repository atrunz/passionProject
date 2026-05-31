export const EVENT_GENRES = [
  "ROCK",
  "PUNK",
  "INDIE",
  "HIP_HOP",
  "ELECTRONIC",
  "FOLK",
  "JAZZ",
  "COMEDY",
  "OTHER"
] as const;

export type EventGenre = (typeof EVENT_GENRES)[number];

export type PublicEvent = {
  id: string;
  title: string;
  slug: string;
  description: string;
  genre: EventGenre;
  posterUrl: string | null;
  organizerName: string;
  organizerSlug: string;
  city: string;
  state: string;
  venueName: string;
  startsAt: string;
  minPriceCents: number;
  performers: PublicEventPerformer[];
  ticketTypes: PublicTicketType[];
};

export type PublicEventPerformer = {
  id: string;
  name: string;
  slug: string;
};

export type PublicTicketType = {
  id: string;
  name: string;
  priceCents: number;
  quantityTotal: number;
  quantitySold: number;
  quantityAvailable: number;
  salesStartAt: string | null;
  salesEndAt: string | null;
  salesStatus: "ON_SALE" | "NOT_STARTED" | "ENDED";
};

export type PublicOrganizer = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  eventCount: number;
  upcomingEvents: PublicEvent[];
};
