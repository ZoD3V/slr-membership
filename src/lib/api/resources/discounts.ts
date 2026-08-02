import { cache } from 'react';

import { API } from '../endpoints';
import { apiFetch } from '../http';

// ─── DTO (mirrors the OpenAPI schema) ────────────────────────────────────────

export interface Discount {
    discount_id: string;
    title: string;
    partner_name: string;
    description: string | null;
    category: string;
    is_featured: boolean;
    // `title` already carries the offer text (e.g. "15% off weekend getaways"), so
    // there is no separate value_label. `code` + `terms` are returned by the member API.
    code?: string | null;
    terms?: string | null;
    thumbnail_url: string | null;
    logo_url: string | null;
    website_url: string | null;
    maps_url: string | null;
}

// Admin create/patch responses are camelCase and richer than the member list DTO.
export interface DiscountAdmin {
    id: string;
    title: string;
    partnerName: string;
    description: string | null;
    category: string;
    code: string | null;
    terms: string | null;
    thumbnailUrl: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
    mapsUrl: string | null;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDiscountPayload {
    title: string;
    partnerName: string;
    category: string;
    description?: string;
    code?: string;
    terms?: string;
    thumbnailUrl?: string;
    logoUrl?: string;
    websiteUrl?: string;
    mapsUrl?: string;
    isFeatured?: boolean;
}

// PATCH is a partial merge (verified: sending only { isFeatured } keeps description/terms).
export type UpdateDiscountPayload = Partial<CreateDiscountPayload>;

// ─── Resource functions ──────────────────────────────────────────────────────

/** Partner discounts (RED/BLUE only — API enforces tier gating; admin gets 403). */
export const getDiscounts = cache((token: string) =>
    apiFetch<Discount[]>(API.discounts.list, { token, cache: 'no-store' })
);

/**
 * Public partner discounts — no auth, no tier gate (safe for visitors / logged-out).
 * `no-store`: admin logo/discount edits must show immediately (the data cache was
 * serving stale logo_urls after an update). React.cache still dedups within a render.
 */
export const getPublicDiscounts = cache(() => apiFetch<Discount[]>(API.discounts.public, { cache: 'no-store' }));

/** One discount's detail. ⚠️ tier-gated like the list (admin gets 403); member DTO omits code/terms. */
export const getDiscount = cache((id: string, token: string) =>
    apiFetch<Discount>(API.discounts.detail(id), { token, cache: 'no-store' })
);

/** Admin: create a discount. */
export const createDiscount = (token: string, body: CreateDiscountPayload) =>
    apiFetch<DiscountAdmin>(API.discounts.create, { method: 'POST', token, body });

/** Admin: update a discount (partial merge). Returns the full camelCase record. */
export const updateDiscount = (token: string, id: string, body: UpdateDiscountPayload) =>
    apiFetch<DiscountAdmin>(API.discounts.update(id), { method: 'PATCH', token, body });

/** Admin: delete a discount by id. */
export const deleteDiscount = (token: string, id: string) =>
    apiFetch<null>(API.discounts.remove(id), { method: 'DELETE', token });

export interface PresignedUrlResponse {
    upload_url: string;
    download_url: string;
    object_key: string;
}

/** Presign an object-storage URL for a discount logo/thumbnail upload. */
export const getDiscountPresignedUrl = (
    token: string,
    body: { filename: string; contentType: string; fileSize: number }
) => apiFetch<PresignedUrlResponse>(API.discounts.presignedUrl, { method: 'POST', token, body });
