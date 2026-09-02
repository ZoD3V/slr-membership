'use server';

import {
    type AnnouncementItem,
    type AnnouncementPayload,
    createAnnouncement,
    deleteAnnouncement,
    updateAnnouncement
} from '@/lib/api/resources/announcements';
import { type PresignedUrlResponse, getEbookPresignedUrl } from '@/lib/api/resources/ebooks';
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

export async function createAnnouncementAction(payload: AnnouncementPayload): Promise<ActionResult<AnnouncementItem>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await createAnnouncement(token, payload);

        return { ok: true, data, message: 'Announcement created.' };
    } catch (error) {
        return toActionError(error);
    }
}

export async function updateAnnouncementAction(
    id: string,
    payload: AnnouncementPayload
): Promise<ActionResult<AnnouncementItem>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await updateAnnouncement(token, id, payload);

        return { ok: true, data, message: 'Announcement updated.' };
    } catch (error) {
        return toActionError(error);
    }
}

export async function deleteAnnouncementAction(id: string): Promise<ActionResult<null>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        await deleteAnnouncement(token, id);

        return { ok: true, data: null, message: 'Announcement deleted.' };
    } catch (error) {
        return toActionError(error);
    }
}

// The platform exposes a single presigned-upload endpoint (ebooks). Announcement
// images ride on it until the backend adds one of its own.
export async function getAnnouncementPresignedUrlAction(
    filename: string,
    contentType: string,
    fileSize: number
): Promise<ActionResult<PresignedUrlResponse>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await getEbookPresignedUrl(token, { filename, contentType, fileSize });

        return { ok: true, data, message: 'Upload URL ready.' };
    } catch (error) {
        return toActionError(error);
    }
}
