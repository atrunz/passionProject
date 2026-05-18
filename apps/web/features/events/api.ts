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
    minPriceCents: 1200
  }
];

export async function getPublicEvents(): Promise<PublicEvent[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return fallbackEvents;
  }

  try {
    const response = await fetch(`${apiUrl}/events`, {
      next: {
        revalidate: 60
      }
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

  if (!apiUrl) {
    return fallbackEvents.find((event) => event.slug === slug) ?? null;
  }

  try {
    const response = await fetch(`${apiUrl}/events/${slug}`, {
      next: {
        revalidate: 60
      }
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
