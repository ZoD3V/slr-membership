import { cache } from 'react';

import type { PrizeContent, PrizeContentUpdatePayload } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

export function getPrizePool(token: string) {
    return apiFetch<PrizeContent>(API.prizes.member, { token });
}

export const PRIZE_CONTENT_TAG = 'prize-content';

export const getPublicPrizeContent = cache(() =>
    apiFetch<PrizeContent>(API.prizes.member, { revalidate: 3600, tags: [PRIZE_CONTENT_TAG] })
);

export function getAdminPrizeContent(token: string) {
    return apiFetch<PrizeContent>(API.admin.prizes, { token });
}

export function updateAdminPrizeContent(token: string, payload: PrizeContentUpdatePayload) {
    return apiFetch<PrizeContent>(API.admin.prizes, {
        method: 'PUT',
        token,
        body: payload
    });
}
