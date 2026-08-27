import { cache } from 'react';

import { API } from '../endpoints';
import { apiFetch } from '../http';

export type BenyStatusValue =
    | 'inactive'
    | 'pending_activation'
    | 'active'
    | 'pending_deactivation'
    | 'cancelled'
    | 'canceled';

export const isBenyCancelled = (status: BenyStatusValue) => status === 'cancelled' || status === 'canceled';

export const isBenyWindingDown = (status: BenyStatusValue) => status === 'pending_deactivation';

export interface BenyStatusResponse {
    beny_status: BenyStatusValue;
    activated_at?: string | null;
    cancelled_at?: string | null;
    expires_at?: string | null;
}

export interface BenySubscribeResponse extends BenyStatusResponse {
    checkout_url?: string | null;
    session_id?: string | null;
}

export interface BenySubscribePayload {
    name: string;
    email: string;
    phone: string;
}

export const getBenyStatus = cache((token: string) =>
    apiFetch<BenyStatusResponse>(API.beny.status, { token, cache: 'no-store' })
);

export const subscribeBeny = (token: string, body: BenySubscribePayload) =>
    apiFetch<BenySubscribeResponse>(API.beny.subscribe, { method: 'POST', token, body });

export const cancelBeny = (token: string) =>
    apiFetch<{ success?: boolean; message?: string } | null>(API.beny.subscribe, { method: 'DELETE', token });
