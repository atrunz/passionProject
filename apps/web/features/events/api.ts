import type { PublicEvent, PublicOrganizer } from "@localshow/shared";

export type PublicEventFilters = {
  query?: string;
  city?: string;
  genre?: string;
  when?: string;
};

const fallbackEvents: PublicEvent[] = [
  {
    id: "evt_needle-drop-night",
    title: "Needle Drop Night",
    slug: "needle-drop-night",
    description:
      "A three-band indie bill with local openers, early doors, and a late DJ set after the last act.",
    genre: "INDIE",
    posterUrl: null,
    organizerName: "LocalShow Demo",
    organizerSlug: "localshow-demo",
    city: "Asbury Park",
    state: "NJ",
    venueName: "The Harbor Room",
    startsAt: "2026-06-12T23:00:00.000Z",
    minPriceCents: 1200,
    performers: [
      { id: "perf_needle_static-lights", name: "Static Lights", slug: "static-lights" },
      { id: "perf_needle_soft-arcade", name: "Soft Arcade", slug: "soft-arcade" }
    ],
    ticketTypes: [
      {
        id: "tt_needle_ga",
        name: "General Admission",
        priceCents: 1200,
        quantityTotal: 160,
        quantitySold: 0,
        quantityAvailable: 160,
        salesStartAt: null,
        salesEndAt: null,
        salesStatus: "ON_SALE"
      },
      {
        id: "tt_needle_door",
        name: "Door Hold",
        priceCents: 1500,
        quantityTotal: 40,
        quantitySold: 0,
        quantityAvailable: 40,
        salesStartAt: null,
        salesEndAt: null,
        salesStatus: "ON_SALE"
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
    posterUrl: null,
    organizerName: "LocalShow Demo",
    organizerSlug: "localshow-demo",
    city: "Philadelphia",
    state: "PA",
    venueName: "Warehouse 39",
    startsAt: "2026-06-20T00:00:00.000Z",
    minPriceCents: 1000,
    performers: [
      { id: "perf_basement_rust-belt", name: "Rust Belt Choir", slug: "rust-belt-choir" },
      { id: "perf_basement_cheap-heat", name: "Cheap Heat", slug: "cheap-heat" }
    ],
    ticketTypes: [
      {
        id: "tt_basement_ga",
        name: "All Ages GA",
        priceCents: 1000,
        quantityTotal: 140,
        quantitySold: 0,
        quantityAvailable: 140,
        salesStartAt: null,
        salesEndAt: null,
        salesStatus: "ON_SALE"
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
    posterUrl: null,
    organizerName: "LocalShow Demo",
    organizerSlug: "localshow-demo",
    city: "Brooklyn",
    state: "NY",
    venueName: "Backbar Social",
    startsAt: "2026-06-27T01:30:00.000Z",
    minPriceCents: 1500,
    performers: [
      { id: "perf_late_set_maya", name: "Maya Torres", slug: "maya-torres" },
      { id: "perf_late_set_jules", name: "Jules Park", slug: "jules-park" }
    ],
    ticketTypes: [
      {
        id: "tt_late_set_ga",
        name: "General Admission",
        priceCents: 1500,
        quantityTotal: 90,
        quantitySold: 0,
        quantityAvailable: 90,
        salesStartAt: null,
        salesEndAt: null,
        salesStatus: "ON_SALE"
      }
    ]
  }
];

const fallbackOrganizer: PublicOrganizer = {
  id: "org_localshow_demo",
  name: "LocalShow Demo",
  slug: "localshow-demo",
  description: "Curated demo organizer for local shows, comedy nights, and DIY events.",
  eventCount: fallbackEvents.length,
  upcomingEvents: fallbackEvents
};

function buildEventsUrl(apiUrl: string, filters?: PublicEventFilters) {
  const url = new URL(`${apiUrl}/events`);

  if (filters?.query) {
    url.searchParams.set("q", filters.query);
  }

  if (filters?.city) {
    url.searchParams.set("city", filters.city);
  }

  if (filters?.genre && filters.genre !== "any") {
    url.searchParams.set("genre", filters.genre);
  }

  if (filters?.when && filters.when !== "any") {
    url.searchParams.set("when", filters.when);
  }

  return url;
}

function filterFallbackEvents(events: PublicEvent[], filters?: PublicEventFilters) {
  const query = filters?.query?.trim().toLowerCase();
  const city = filters?.city?.trim().toLowerCase();
  const genre = filters?.genre;

  return events.filter((event) => {
    const matchesQuery = query
      ? [event.title, event.description, event.venueName, event.city]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;
    const matchesCity = city ? event.city.toLowerCase().includes(city) : true;
    const matchesGenre = genre && genre !== "any" ? event.genre === genre : true;

    return matchesQuery && matchesCity && matchesGenre;
  });
}

export async function getPublicEvents(filters?: PublicEventFilters): Promise<PublicEvent[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (process.env.NEXT_PHASE === "phase-production-build") {
    return filterFallbackEvents(fallbackEvents, filters);
  }

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is required to load public events");
  }

  const response = await fetch(buildEventsUrl(apiUrl, filters), {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Unable to load public events: ${response.status}`);
  }

  return response.json();
}

export async function getPublicEvent(slug: string): Promise<PublicEvent | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (process.env.NEXT_PHASE === "phase-production-build") {
    return fallbackEvents.find((event) => event.slug === slug) ?? null;
  }

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is required to load public event details");
  }

  const response = await fetch(`${apiUrl}/events/${slug}`, {
    cache: "no-store"
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Unable to load public event: ${response.status}`);
  }

  return response.json();
}

export async function getPublicOrganizer(slug: string): Promise<PublicOrganizer | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (process.env.NEXT_PHASE === "phase-production-build") {
    return slug === fallbackOrganizer.slug ? fallbackOrganizer : null;
  }

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is required to load public organizer profiles");
  }

  const response = await fetch(`${apiUrl}/organizers/${slug}`, {
    cache: "no-store"
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Unable to load public organizer: ${response.status}`);
  }

  return response.json();
}
