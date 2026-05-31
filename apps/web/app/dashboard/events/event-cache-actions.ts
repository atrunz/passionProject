"use server";

import { revalidatePath } from "next/cache";

export async function revalidateEventViews(slug?: string, organizerSlug?: string) {
  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");

  if (slug) {
    revalidatePath(`/events/${slug}`);
  }

  if (organizerSlug) {
    revalidatePath(`/organizers/${organizerSlug}`);
  }
}
