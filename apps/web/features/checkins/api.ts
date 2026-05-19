const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

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

export async function checkInTicket(ticketCode: string) {
  const response = await fetch(`${apiUrl}/organizer/check-ins`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ ticketCode })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Check-in failed");
  }

  return response.json() as Promise<CheckInResult>;
}
