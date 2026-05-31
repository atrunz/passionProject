const apiUrl = process.env.LOCALSHOW_API_URL ?? "http://127.0.0.1:4000/api/v1";
const webUrl = process.env.LOCALSHOW_WEB_URL ?? "http://127.0.0.1:3000";
const runMutatingFlow = process.env.LOCALSHOW_MUTATING_SMOKE === "true";
const fanDevHeaders = { "x-localshow-dev-role": "FAN" };
const organizerDevHeaders = { "x-localshow-dev-role": "ORGANIZER" };

async function request(label, url, options = {}) {
  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  } catch (error) {
    throw new Error(`${label} could not connect to ${url}: ${error.message}`);
  }

  const text = await response.text();
  const body = text ? parseJson(text) : null;

  return {
    label,
    response,
    body,
    text
  };
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function pass(message) {
  console.log(`PASS ${message}`);
}

async function expectOk(label, url, options) {
  const result = await request(label, url, options);
  assert(result.response.ok, `${label} failed with ${result.response.status}: ${result.text}`);
  pass(label);
  return result.body;
}

async function expectStatus(label, status, url, options) {
  const result = await request(label, url, options);
  assert(
    result.response.status === status,
    `${label} expected ${status}, got ${result.response.status}: ${result.text}`
  );
  pass(`${label} returned ${status}`);
  return result.body;
}

async function main() {
  console.log(`LocalShow smoke test`);
  console.log(`API ${apiUrl}`);
  console.log(`Web ${webUrl}`);
  console.log(`Mutating flow ${runMutatingFlow ? "enabled" : "disabled"}`);

  await expectOk("API health", `${apiUrl}/health`);

  const events = await expectOk("public events API", `${apiUrl}/events`);
  assert(Array.isArray(events), "public events API did not return an array");
  assert(events.length > 0, "public events API returned no events");

  const firstEvent = events[0];
  await expectOk("public event detail API", `${apiUrl}/events/${firstEvent.slug}`);
  await expectStatus("fan cannot access organizer events API", 403, `${apiUrl}/organizer/events`, {
    headers: fanDevHeaders
  });
  await expectOk("organizer events API", `${apiUrl}/organizer/events`, {
    headers: organizerDevHeaders
  });
  await expectOk("fan ticket wallet API", `${apiUrl}/me/tickets`, {
    headers: fanDevHeaders
  });

  await expectStatus("invalid mock order guard", 404, `${apiUrl}/orders/mock`, {
    method: "POST",
    headers: fanDevHeaders,
    body: JSON.stringify({
      ticketTypeId: "not-a-real-ticket-type",
      quantity: 1
    })
  });

  await expectStatus("invalid check-in guard", 201, `${apiUrl}/organizer/check-ins`, {
    method: "POST",
    headers: organizerDevHeaders,
    body: JSON.stringify({
      eventId: firstEvent.id,
      ticketCode: "LS-TK-NOTREAL"
    })
  });

  await expectStatus("invalid ticket transfer guard", 404, `${apiUrl}/me/tickets/not-a-real-ticket/transfer`, {
    method: "POST",
    headers: fanDevHeaders,
    body: JSON.stringify({
      recipientEmail: "transfer-test@localshow.test"
    })
  });

  await expectOk("web home", webUrl, {
    headers: {
      Accept: "text/html"
    }
  });
  await expectOk("web event detail", `${webUrl}/events/${firstEvent.slug}`, {
    headers: {
      Accept: "text/html"
    }
  });

  if (runMutatingFlow) {
    const purchasableTicketType = events
      .flatMap((event) =>
        event.ticketTypes.map((ticketType) => ({
          event,
          ticketType
        }))
      )
      .find(({ ticketType }) => ticketType.quantityAvailable > 0);

    assert(purchasableTicketType, "no ticket type had inventory available for mutating smoke test");

    const orderResult = await expectOk("mock order creates real tickets", `${apiUrl}/orders/mock`, {
      method: "POST",
      headers: fanDevHeaders,
      body: JSON.stringify({
        ticketTypeId: purchasableTicketType.ticketType.id,
        quantity: 1
      })
    });

    assert(orderResult.tickets?.[0]?.id, "mock order did not return a ticket id");
    await expectOk("created ticket detail API", `${apiUrl}/me/tickets/${orderResult.tickets[0].id}`, {
      headers: fanDevHeaders
    });
    await expectOk("created ticket detail page", `${webUrl}/tickets/${orderResult.tickets[0].id}`, {
      headers: {
        Accept: "text/html"
      }
    });
  }

  console.log("Smoke test complete");
}

main().catch((error) => {
  console.error(`FAIL ${error.message}`);
  process.exit(1);
});
