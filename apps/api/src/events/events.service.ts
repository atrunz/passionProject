import { Injectable, NotFoundException } from "@nestjs/common";
import type { PublicEvent } from "@localshow/shared";

const demoEvents: PublicEvent[] = [
  {
    id: "evt_needle-drop-night",
    title: "Needle Drop Night",
    slug: "needle-drop-night",
    description:
      "A three-band indie bill with local openers, early doors, and a late DJ set after the last act.",
    genre: "INDIE",
    city: "Asbury Park",
    state: "NJ",
    venueName: "The Harbor Room",
    startsAt: "2026-06-12T23:00:00.000Z",
    minPriceCents: 1200
  },
  {
    id: "evt-basement-signal",
    title: "Basement Signal",
    slug: "basement-signal",
    description:
      "DIY punk and noise rock showcase with four regional bands and a strict all-ages door policy.",
    genre: "PUNK",
    city: "Philadelphia",
    state: "PA",
    venueName: "Warehouse 39",
    startsAt: "2026-06-20T00:00:00.000Z",
    minPriceCents: 1000
  },
  {
    id: "evt-late-set-laughs",
    title: "Late Set Laughs",
    slug: "late-set-laughs",
    description:
      "A tight local comedy lineup built for small rooms, quick sets, and a casual Friday crowd.",
    genre: "COMEDY",
    city: "Brooklyn",
    state: "NY",
    venueName: "Backbar Social",
    startsAt: "2026-06-27T01:30:00.000Z",
    minPriceCents: 1500
  }
];

@Injectable()
export class EventsService {
  listPublicEvents() {
    return demoEvents;
  }

  getPublicEventBySlug(slug: string) {
    const event = demoEvents.find((item) => item.slug === slug);

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    return event;
  }
}
