'use server';

import { revalidatePath } from 'next/cache';

import { handleApiAuthError } from '@/lib/api/guard';
import { getAdminMembersPaginated } from '@/lib/api/resources/admin';
import { sendNotifications, updateNotificationTemplate } from '@/lib/api/resources/notifications-admin';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';
import type {
    NotificationSendPayload,
    NotificationSendResult,
    NotificationTemplate,
    NotificationTemplateUpdatePayload,
    RecipientSearchResult
} from '@/types/member';

import { MAX_SEND_RECIPIENTS, RECIPIENT_PAGE_SIZE } from './seed';

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

/** One page of the picker. Paged server-side: the platform has thousands of
 *  members, so returning only the first page and calling it the total would
 *  make everyone past it unreachable. */
export async function searchRecipientsAction(search: string, page = 1): Promise<ActionResult<RecipientSearchResult>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const { data: members, meta } = await getAdminMembersPaginated(token, {
            search: search.trim() || undefined,
            page,
            perPage: RECIPIENT_PAGE_SIZE
        });

        // Projects away draw_pass, which must never reach any UI. `status` is
        // kept on purpose — an admin about to email a suspended account
        // should be able to see that.
        const rows = members.map((m) => ({
            user_id: m.user_id,
            name: m.full_name,
            email: m.email,
            status: m.status
        }));

        return {
            ok: true,
            data: {
                rows,
                page: meta.page ?? page,
                per_page: meta.per_page ?? RECIPIENT_PAGE_SIZE,
                total: meta.total ?? rows.length,
                total_pages: meta.total_pages ?? 1
            },
            message: 'OK'
        };
    } catch (error) {
        return toActionError(error);
    }
}

export async function sendNotificationsAction(
    payload: NotificationSendPayload
): Promise<ActionResult<NotificationSendResult>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    if (payload.user_ids.length === 0) return { ok: false, message: 'Pick at least one recipient.' };
    if (payload.user_ids.length > MAX_SEND_RECIPIENTS) {
        return { ok: false, message: `A single send is limited to ${MAX_SEND_RECIPIENTS} recipients.` };
    }
    if (!payload.template_id) return { ok: false, message: 'Pick a template.' };

    try {
        const data = await sendNotifications(token, payload);
        revalidatePath('/dashboard/notifications');

        return { ok: true, data, message: `Queued ${data.queued}, skipped ${data.skipped}.` };
    } catch (error) {
        return toActionError(error);
    }
}
