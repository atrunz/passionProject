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
  city: string;
  state: string;
  venueName: string;
  startsAt: string;
  minPriceCents: number;
};
