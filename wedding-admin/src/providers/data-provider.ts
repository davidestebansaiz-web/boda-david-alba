import type { DataProvider } from "react-admin";

import { getJson, patchJson } from "../infrastructure/http-client";
import { getStoredAccessToken } from "./auth-storage";

interface AdminInvitation {
  id: string;
  token: string;
  guestName: string;
  maxGuests: number;
  adminNotes: string | null;
  qrTargetUrl: string;
  qrSvg: string;
  qrUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
  rsvp: {
    status: "PENDING" | "ACCEPTED" | "DECLINED";
    attendingCount: number | null;
    message: string | null;
    inviteeResponses: Array<{
      inviteeId: string;
      attending: boolean;
      note: string | null;
    }>;
    submittedAt: string;
    updatedAt: string;
  } | null;
}

interface UpdateInvitationPayload {
  guestName?: string;
  maxGuests?: number;
  adminNotes?: string | null;
  qrTargetUrl?: string;
  regenerateQr?: boolean;
}

const buildAdminHeaders = (): HeadersInit => {
  const token = getStoredAccessToken();
  if (!token) {
    throw new Error("Missing auth token");
  }

  return {
    authorization: `Bearer ${token}`,
  };
};

const asString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  return value;
};

const asNumber = (value: unknown): number | undefined => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }

  return value;
};

const asBoolean = (value: unknown): boolean | undefined => {
  if (typeof value !== "boolean") {
    return undefined;
  }

  return value;
};

const applyFilters = (items: AdminInvitation[], filter: Record<string, unknown>): AdminInvitation[] => {
  const query = asString(filter.q)?.trim().toLowerCase();

  if (!query) {
    return items;
  }

  return items.filter((item) => {
    const notes = item.adminNotes ?? "";

    return (
      item.guestName.toLowerCase().includes(query) ||
      item.token.toLowerCase().includes(query) ||
      notes.toLowerCase().includes(query)
    );
  });
};

const applySort = (
  items: AdminInvitation[],
  sort: {
    field: string;
    order: "ASC" | "DESC";
  },
): AdminInvitation[] => {
  const sortedItems = [...items];

  sortedItems.sort((left, right) => {
    const leftValue = left[sort.field as keyof AdminInvitation];
    const rightValue = right[sort.field as keyof AdminInvitation];

    if (leftValue === rightValue) {
      return 0;
    }

    if (leftValue === null) {
      return 1;
    }

    if (rightValue === null) {
      return -1;
    }

    if (leftValue > rightValue) {
      return sort.order === "ASC" ? 1 : -1;
    }

    return sort.order === "ASC" ? -1 : 1;
  });

  return sortedItems;
};

const applyPagination = (
  items: AdminInvitation[],
  pagination: {
    page: number;
    perPage: number;
  },
): AdminInvitation[] => {
  const start = (pagination.page - 1) * pagination.perPage;
  return items.slice(start, start + pagination.perPage);
};

const toUpdatePayload = (data: Partial<AdminInvitation>): UpdateInvitationPayload => ({
  guestName: asString(data.guestName),
  maxGuests: asNumber(data.maxGuests),
  adminNotes: data.adminNotes === undefined ? undefined : (data.adminNotes ?? null),
  qrTargetUrl: asString(data.qrTargetUrl),
  regenerateQr: asBoolean((data as Partial<UpdateInvitationPayload>).regenerateQr),
});

const unsupported = async (): Promise<never> => {
  throw new Error("Operation not supported in this iteration");
};

export const dataProvider: DataProvider = {
  getList: async (_resource, params) => {
    const items = await getJson<AdminInvitation[]>("/admin/invitations", buildAdminHeaders());

    const filteredItems = applyFilters(items, params.filter as Record<string, unknown>);
    const sortedItems = applySort(filteredItems, params.sort ?? { field: "updatedAt", order: "DESC" });
    const paginatedItems = applyPagination(sortedItems, params.pagination ?? { page: 1, perPage: 25 });

    return {
      data: paginatedItems as any[],
      total: filteredItems.length,
    };
  },

  getOne: async (_resource, params) => {
    const invitation = await getJson<AdminInvitation>(
      `/admin/invitations/${encodeURIComponent(String(params.id))}`,
      buildAdminHeaders(),
    );

    return {
      data: invitation as any,
    };
  },

  update: async (_resource, params) => {
    const invitation = await patchJson<AdminInvitation>(
      `/admin/invitations/${encodeURIComponent(String(params.id))}`,
      toUpdatePayload(params.data),
      buildAdminHeaders(),
    );

    return {
      data: invitation as any,
    };
  },

  getMany: unsupported,
  getManyReference: unsupported,
  create: unsupported,
  delete: unsupported,
  deleteMany: unsupported,
  updateMany: unsupported,
} as DataProvider;
