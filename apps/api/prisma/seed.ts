import { PrismaClient, EventGenre, EventStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const organizer = await prisma.organizer.upsert({
    where: { slug: "localshow-demo" },
    update: {},
    create: {
      name: "LocalShow Demo Collective",
      slug: "localshow-demo",
      description: "Seed organizer for local venue and DIY show demos.",
      owner: {
        create: {
          clerkUserId: "seed_clerk_organizer",
          email: "organizer@localshow.test",
          name: "Demo Organizer",
          role: "ORGANIZER"
        }
      }
    }
  });

  const venue = await prisma.venue.create({
    data: {
      organizerId: organizer.id,
      name: "The Harbor Room",
      address: "100 Boardwalk Ave",
      city: "Asbury Park",
      state: "NJ",
      capacity: 220
    }
  });

  const event = await prisma.event.create({
    data: {
      organizerId: organizer.id,
      venueId: venue.id,
      title: "Needle Drop Night",
      slug: "needle-drop-night",
      description:
        "A three-band indie bill with local openers, early doors, and a late DJ set after the last act.",
      genre: EventGenre.INDIE,
      startsAt: new Date("2026-06-12T23:00:00.000Z"),
      endsAt: new Date("2026-06-13T03:00:00.000Z"),
      status: EventStatus.PUBLISHED,
      ticketTypes: {
        create: [
          {
            name: "General Admission",
            priceCents: 1200,
            quantityTotal: 160
          },
          {
            name: "Door Hold",
            priceCents: 1500,
            quantityTotal: 40
          }
        ]
      }
    }
  });

  console.log(`Seeded ${event.title}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
