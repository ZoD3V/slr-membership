'use server';

import { revalidatePath } from 'next/cache';

import { handleApiAuthError } from '@/lib/api/guard';
import {
    type AdminGiveaway,
    type AdminGiveawayPayload,
    type AdminWinner,
    type AdminWinnerPayload,
    createGiveaway,
    createWinner,
    deleteGiveaway,
    deleteWinner,
    updateGiveaway,
    updateWinner
} from '@/lib/api/resources/giveaways';
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
    handleApiAuthError(error);

    if (error instanceof ApiError) {
        const payload = error.payload as
            | { code?: string; requestId?: string; errors?: { field?: string; message?: string }[] }
            | undefined;

        const fields = (payload?.errors ?? [])
            .map((e) => [e.field, e.message].filter(Boolean).join(': '))
            .filter(Boolean)
            .join(' · ');

        return {
            ok: false,
            message: fields ? `${error.message} (${fields})` : error.message,
            status: error.status,
            code: payload?.code ?? null,
            requestId: payload?.requestId ?? null
        };
    }

    return { ok: false, message: 'Something went wrong. Please try again.' };
}

async function withToken<T>(run: (token: string) => Promise<T>, message: string): Promise<ActionResult<T>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        return { ok: true, data: await run(token), message };
    } catch (error) {
        return toActionError(error);
    }
}

export async function createGiveawayAction(payload: AdminGiveawayPayload): Promise<ActionResult<AdminGiveaway>> {
    const res = await withToken((t) => createGiveaway(t, payload), 'Giveaway created.');
    if (res.ok) revalidatePath('/dashboard/giveaways');

    return res;
}

export async function updateGiveawayAction(
    id: string,
    payload: AdminGiveawayPayload
): Promise<ActionResult<AdminGiveaway>> {
    const res = await withToken((t) => updateGiveaway(t, id, payload), 'Giveaway updated.');
    if (res.ok) {
        revalidatePath('/dashboard/giveaways');
        revalidatePath(`/dashboard/giveaways/${id}`);
    }

    return res;
}

export async function deleteGiveawayAction(id: string): Promise<ActionResult<null>> {
    const res = await withToken((t) => deleteGiveaway(t, id), 'Giveaway deleted.');
    if (res.ok) revalidatePath('/dashboard/giveaways');

    return res;
}

export async function createWinnerAction(payload: AdminWinnerPayload): Promise<ActionResult<AdminWinner>> {
    const res = await withToken((t) => createWinner(t, payload), 'Winner recorded.');
    if (res.ok) revalidatePath('/dashboard/winners');

    return res;
}

export async function updateWinnerAction(id: string, payload: AdminWinnerPayload): Promise<ActionResult<AdminWinner>> {
    const res = await withToken((t) => updateWinner(t, id, payload), 'Winner updated.');
    if (res.ok) revalidatePath('/dashboard/winners');

    return res;
}

export async function deleteWinnerAction(id: string): Promise<ActionResult<null>> {
    const res = await withToken((t) => deleteWinner(t, id), 'Winner removed.');
    if (res.ok) revalidatePath('/dashboard/winners');

    return res;
}
