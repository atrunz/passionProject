const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

function getDevOrganizerHeaders(authToken?: string | null): Record<string, string> {
  if (authToken || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return {};
  }

  return {
    "x-localshow-dev-role": "ORGANIZER"
  };
}

export type CheckInResult = {
  result: "SUCCESS" | "ALREADY_CHECKED_IN" | "INVALID" | "VOID";
  message: string;
  ticket?: {
    id: string;
    code: string;
    status: "ACTIVE" | "CHECKED_IN" | "VOID";
    checkedInAt: string | null;
    event: {
      title: string;
      startsAt: string;
      venue: {
        name: string;
        city: string;
        state: string;
      };
    };
    ticketType: {
      name: string;
    };
  };
};

export async function checkInTicket(ticketCode: string, eventId: string, authToken?: string | null) {
  const response = await fetch(`${apiUrl}/organizer/check-ins`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getDevOrganizerHeaders(authToken),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    body: JSON.stringify({ ticketCode, eventId })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Check-in failed");
  }

  return response.json() as Promise<CheckInResult>;
}
