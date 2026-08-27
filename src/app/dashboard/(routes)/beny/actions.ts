'use server';

import {
    type BenyActivateResult,
    type BenySubscriptionItem,
    activateBeny,
    deactivateBeny,
    getAllBenySubscriptions,
    getBenySubscriptions
} from '@/lib/api/resources/admin';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';

export type ActionError = {
    ok: false;
    message: string;
    status?: number;
    code?: string | null;
    requestId?: string | null;
};

export type ActionResult<T> = { ok: true; data: T; message: string } | ActionError;

function toActionError(error: unknown): ActionError {
    if (error instanceof ApiError) {
        const payload = error.payload as { code?: string; requestId?: string } | undefined;

        return {
            ok: false,
            message: error.message,
            status: error.status,
            code: payload?.code ?? null,
            requestId: payload?.requestId ?? null
        };
    }

    return { ok: false, message: 'Something went wrong. Please try again.' };
}

export async function getBenySubscriptionsAction(
    status: string,
    page = 1,
    limit = 10
): Promise<ActionResult<{ data: BenySubscriptionItem[]; total: number }>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        let data: BenySubscriptionItem[] = [];
        let total = 0;

        if (status === 'pending_deactivation') {
            const all = await getAllBenySubscriptions(token);
            data = all.filter((item) => (item.status || '').toLowerCase() === 'pending_deactivation');
            total = data.length;
            data = data.slice((page - 1) * limit, page * limit);
        } else {
            const res = await getBenySubscriptions(status, token, page, limit);

            if (Array.isArray(res)) {
                data = res;
            } else if (res && typeof res === 'object') {
                data = res.items || res.data || res.subscriptions || [];
            }

            total =
                typeof res.pagination?.total === 'number'
                    ? res.pagination.total
                    : typeof res.total === 'number'
                      ? res.total
                      : data.length;
        }

        return {
            ok: true,
            data: { data, total },
            message: 'Subscriptions retrieved successfully.'
        };
    } catch (error) {
        return toActionError(error);
    }
}

export async function activateBenyAction(id: string): Promise<ActionResult<BenyActivateResult>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await activateBeny(id, token);

        return { ok: true, data, message: 'BENY subscription activated.' };
    } catch (error) {
        return toActionError(error);
    }
}

export async function deactivateBenyAction(id: string, reason?: string): Promise<ActionResult<{ success: boolean }>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const res = await deactivateBeny(id, token, reason);

        return {
            ok: true,
            data: { success: res.success ?? true },
            message: 'BENY subscription deactivated successfully.'
        };
    } catch (error) {
        return toActionError(error);
    }
}
