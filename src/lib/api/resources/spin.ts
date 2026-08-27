import { API } from '../endpoints';
import { apiFetch } from '../http';

export type SpinMoment = 'registration' | 'renewal' | 'pre_renewal';

export interface SpinStatus {
    available: boolean;
    moment: SpinMoment | string | null;
    expires_at: string | null;

    discount_cents: number;
}

export interface SpinResult {
    result: 'win' | 'lose';

    discount_cents: number;
    spin_token: string;
    applies_to: string;
}

export const getSpinStatus = (token: string) => apiFetch<SpinStatus>(API.spin.status, { token, cache: 'no-store' });

export const executeSpin = (token: string) => apiFetch<SpinResult>(API.spin.execute, { method: 'POST', token });
