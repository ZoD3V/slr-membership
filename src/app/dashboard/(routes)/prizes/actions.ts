'use server';

import { revalidatePath, updateTag } from 'next/cache';

import { handleApiAuthError } from '@/lib/api/guard';
import { PRIZE_CONTENT_TAG, updateAdminPrizeContent } from '@/lib/api/resources/prizes';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';
import type { PrizeContent, PrizeContentUpdatePayload } from '@/types/member';

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

export async function savePrizeContentAction(payload: PrizeContentUpdatePayload): Promise<ActionResult<PrizeContent>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await updateAdminPrizeContent(token, payload);

        revalidatePath('/dashboard/prizes');

        updateTag(PRIZE_CONTENT_TAG);

        return { ok: true, data, message: 'Prize content saved.' };
    } catch (error) {
        return toActionError(error);
    }
}
