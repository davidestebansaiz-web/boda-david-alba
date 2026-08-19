const baseUrl = process.env.API_BASE_URL ?? "http://localhost:3000";
const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
const adminPassword = process.env.ADMIN_PASSWORD ?? "super-secret";

interface SmokeCreateResponse {
  id: string;
  token: string;
  qrTargetUrl: string;
  qrSvg: string;
  qrUpdatedAt: string;
}

interface SmokeListItem {
  id: string;
}

interface SmokeLoginResponse {
  accessToken: string;
}

const assertStatus = async (response: Response, expected: number, step: string): Promise<void> => {
  if (response.status === expected) {
    return;
  }

  const body = await response.text();
  throw new Error(`${step} failed. Expected ${expected}, got ${response.status}. Body: ${body}`);
};

const run = async (): Promise<void> => {
  const loginResponse = await fetch(`${baseUrl}/admin/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: adminUsername,
      password: adminPassword,
    }),
  });

  await assertStatus(loginResponse, 200, "admin login");
  const loginPayload = (await loginResponse.json()) as SmokeLoginResponse;

  const adminHeaders = {
    "content-type": "application/json",
    authorization: `Bearer ${loginPayload.accessToken}`,
  };

  const createResponse = await fetch(`${baseUrl}/admin/invitations`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      guestName: "Smoke Test Guests",
      maxGuests: 2,
      adminNotes: "Created by smoke script",
    }),
  });

  await assertStatus(createResponse, 201, "create invitation");
  const created = (await createResponse.json()) as SmokeCreateResponse;
  if (!created.qrTargetUrl.endsWith(`/${encodeURIComponent(created.token)}`)) {
    throw new Error("create invitation failed. Unexpected default qrTargetUrl");
  }
  if (!created.qrSvg.includes("<svg")) {
    throw new Error("create invitation failed. QR SVG not returned");
  }

  const publicLookup = await fetch(`${baseUrl}/public/invitations/${created.token}`);
  await assertStatus(publicLookup, 200, "public lookup");
  const publicPayload = (await publicLookup.json()) as {
    invitees: Array<{ id: string }>;
  };

  const submitRsvp = await fetch(`${baseUrl}/public/invitations/${created.token}/rsvp`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      invitees: publicPayload.invitees.map((invitee, index) => ({
        inviteeId: invitee.id,
        attending: index === 0,
        note: index === 0 ? "See you there" : null,
      })),
    }),
  });
  await assertStatus(submitRsvp, 200, "submit rsvp");

  const getById = await fetch(`${baseUrl}/admin/invitations/${created.id}`, {
    headers: {
      authorization: `Bearer ${loginPayload.accessToken}`,
    },
  });
  await assertStatus(getById, 200, "get by id");

  const regenerateResponse = await fetch(`${baseUrl}/admin/invitations/${created.id}`, {
    method: "PATCH",
    headers: adminHeaders,
    body: JSON.stringify({
      regenerateQr: true,
    }),
  });
  await assertStatus(regenerateResponse, 200, "regenerate qr");

  const listResponse = await fetch(`${baseUrl}/admin/invitations`, {
    headers: {
      authorization: `Bearer ${loginPayload.accessToken}`,
    },
  });
  await assertStatus(listResponse, 200, "list invitations");

  const list = (await listResponse.json()) as SmokeListItem[];

  console.log("Smoke flow completed");
  console.log(`Invitation ID: ${created.id}`);
  console.log(`Token: ${created.token}`);
  console.log(`Total invitations in list: ${list.length}`);
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
