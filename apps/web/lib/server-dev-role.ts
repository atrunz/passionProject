import { cookies } from "next/headers";
import { DEV_ROLE_COOKIE, type DevRole } from "@/lib/dev-role";

export async function getServerDevRole(): Promise<DevRole> {
  const value = (await cookies()).get(DEV_ROLE_COOKIE)?.value?.toUpperCase();
  return value === "FAN" ? "FAN" : "ORGANIZER";
}
