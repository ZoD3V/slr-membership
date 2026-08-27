import { API } from '../endpoints';
import { apiFetch } from '../http';

export const cancelMySubscription = (token: string) =>
    apiFetch<unknown>(API.subscriptions.cancel, { method: 'POST', token });
