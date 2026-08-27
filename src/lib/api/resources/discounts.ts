import { cache } from 'react';

import { API } from '../endpoints';
import { apiFetch } from '../http';

export interface Discount {
    discount_id: string;
    title: string;
    partner_name: string;
    description: string | null;
    category: string;
    is_featured: boolean;

    code?: string | null;
    terms?: string | null;
    thumbnail_url: string | null;
    logo_url: string | null;
    website_url: string | null;
    maps_url: string | null;
}

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

export type UpdateDiscountPayload = Partial<CreateDiscountPayload>;

export const getDiscounts = cache((token: string) =>
    apiFetch<Discount[]>(API.discounts.list, { token, cache: 'no-store' })
);

export const getPublicDiscounts = cache(() => apiFetch<Discount[]>(API.discounts.public, { cache: 'no-store' }));

export const getDiscount = cache((id: string, token: string) =>
    apiFetch<Discount>(API.discounts.detail(id), { token, cache: 'no-store' })
);

export const createDiscount = (token: string, body: CreateDiscountPayload) =>
    apiFetch<DiscountAdmin>(API.discounts.create, { method: 'POST', token, body });

export const updateDiscount = (token: string, id: string, body: UpdateDiscountPayload) =>
    apiFetch<DiscountAdmin>(API.discounts.update(id), { method: 'PATCH', token, body });

export const deleteDiscount = (token: string, id: string) =>
    apiFetch<null>(API.discounts.remove(id), { method: 'DELETE', token });

export interface PresignedUrlResponse {
    upload_url: string;
    download_url: string;
    object_key: string;
}

export const getDiscountPresignedUrl = (
    token: string,
    body: { filename: string; contentType: string; fileSize: number }
) => apiFetch<PresignedUrlResponse>(API.discounts.presignedUrl, { method: 'POST', token, body });
