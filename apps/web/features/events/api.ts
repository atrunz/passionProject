import type { PublicEvent } from "@localshow/shared";

const fallbackEvents: PublicEvent[] = [
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
    minPriceCents: 1200,
    ticketTypes: [
      {
        id: "tt_needle_ga",
        name: "General Admission",
        priceCents: 1200,
        quantityTotal: 160,
        quantitySold: 0,
        quantityAvailable: 160
      },
      {
        id: "tt_needle_door",
        name: "Door Hold",
        priceCents: 1500,
        quantityTotal: 40,
        quantitySold: 0,
        quantityAvailable: 40
      }
    ]
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
    minPriceCents: 1000,
    ticketTypes: [
      {
        id: "tt_basement_ga",
        name: "All Ages GA",
        priceCents: 1000,
        quantityTotal: 140,
        quantitySold: 0,
        quantityAvailable: 140
      }
    ]
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
    minPriceCents: 1500,
    ticketTypes: [
      {
        id: "tt_late_set_ga",
        name: "General Admission",
        priceCents: 1500,
        quantityTotal: 90,
        quantitySold: 0,
        quantityAvailable: 90
      }
    ]
  }
];

export async function getPublicEvents(): Promise<PublicEvent[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl || process.env.NEXT_PHASE === "phase-production-build") {
    return fallbackEvents;
  }

  try {
    const response = await fetch(`${apiUrl}/events`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return fallbackEvents;
    }

    return response.json();
  } catch {
    return fallbackEvents;
  }
}

export async function getPublicEvent(slug: string): Promise<PublicEvent | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl || process.env.NEXT_PHASE === "phase-production-build") {
    return fallbackEvents.find((event) => event.slug === slug) ?? null;
  }

  try {
    const response = await fetch(`${apiUrl}/events/${slug}`, {
      cache: "no-store"
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return fallbackEvents.find((event) => event.slug === slug) ?? null;
    }

    return response.json();
  } catch {
    return fallbackEvents.find((event) => event.slug === slug) ?? null;
  }
}
