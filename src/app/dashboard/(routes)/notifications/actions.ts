'use server';

import { revalidatePath } from 'next/cache';

import { handleApiAuthError } from '@/lib/api/guard';
import { updateNotificationTemplate } from '@/lib/api/resources/notifications-admin';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';
import type { NotificationTemplate, NotificationTemplateUpdatePayload } from '@/types/member';

export type ActionError = {
    ok: false;
    message: string;
    status?: number;
    code?: string | null;
    requestId?: string | null;
};

export type ActionResult<T> = { ok: true; data: T; message: string } | ActionError;

function toActionError(error: unknown): ActionError {
    // 401 (expired/invalid session) → redirect('/api/auth/logout'), never returns.
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

export async function saveNotificationTemplateAction(
    templateId: string,
    payload: NotificationTemplateUpdatePayload
): Promise<ActionResult<NotificationTemplate>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await updateNotificationTemplate(token, templateId, payload);
        revalidatePath('/dashboard/notifications');

        return { ok: true, data, message: 'Template saved.' };
    } catch (error) {
        return toActionError(error);
    }
}
