"use client";

import { useRouter } from "next/navigation";
import { DEV_ROLE_COOKIE, type DevRole } from "@/lib/dev-role";

type DevRoleSwitcherProps = {
  currentRole: DevRole;
};

export function DevRoleSwitcher({ currentRole }: DevRoleSwitcherProps) {
  const router = useRouter();

  function setRole(role: DevRole) {
    document.cookie = `${DEV_ROLE_COOKIE}=${role}; path=/; max-age=2592000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center rounded-md border border-teal-200 bg-teal-50 p-1">
      {(["FAN", "ORGANIZER"] as const).map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => setRole(role)}
          className={`rounded px-2.5 py-1 text-xs font-black uppercase tracking-wide transition ${
            currentRole === role ? "bg-teal-700 text-white" : "text-teal-800 hover:bg-teal-100"
          }`}
        >
          {role === "FAN" ? "Fan" : "Organizer"}
        </button>
      ))}
    </div>
  );
}
