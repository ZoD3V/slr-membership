'use server';

import { revalidatePath } from 'next/cache';

import { handleApiAuthError } from '@/lib/api/guard';
import {
    type ChapterAdmin,
    type ChapterPayload,
    type EbookAdmin,
    type EbookPayload,
    type PresignedUrlResponse,
    createChapter,
    createEbook,
    deleteChapter,
    deleteEbook,
    getEbookPresignedUrl,
    updateChapter,
    updateEbook
} from '@/lib/api/resources/ebooks';
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

export async function createEbookAction(payload: EbookPayload): Promise<ActionResult<EbookAdmin>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await createEbook(token, payload);
        revalidatePath('/dashboard/ebooks');

        return { ok: true, data, message: 'Ebook created.' };
    } catch (error) {
        return toActionError(error);
    }
}

export async function updateEbookAction(id: string, payload: EbookPayload): Promise<ActionResult<EbookAdmin>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await updateEbook(token, id, payload);
        revalidatePath('/dashboard/ebooks');

        return { ok: true, data, message: 'Ebook updated.' };
    } catch (error) {
        return toActionError(error);
    }
}

export async function deleteEbookAction(id: string): Promise<ActionResult<null>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        await deleteEbook(token, id);
        revalidatePath('/dashboard/ebooks');

        return { ok: true, data: null, message: 'Ebook deleted.' };
    } catch (error) {
        return toActionError(error);
    }
}

export async function getEbookPresignedUrlAction(
    filename: string,
    contentType: string,
    fileSize: number
): Promise<ActionResult<PresignedUrlResponse>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await getEbookPresignedUrl(token, { filename, contentType, fileSize });

        return { ok: true, data, message: 'Upload URL generated.' };
    } catch (error) {
        return toActionError(error);
    }
}

export async function createChapterAction(
    ebookId: string,
    payload: ChapterPayload
): Promise<ActionResult<ChapterAdmin>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await createChapter(token, ebookId, payload);
        revalidatePath('/dashboard/ebooks');
        revalidatePath(`/dashboard/ebooks/${ebookId}`);
        revalidatePath(`/member/ebooks/${ebookId}`);

        return { ok: true, data, message: 'Chapter created.' };
    } catch (error) {
        return toActionError(error);
    }
}

export async function updateChapterAction(
    ebookId: string,
    chapterId: string,
    payload: ChapterPayload
): Promise<ActionResult<ChapterAdmin>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await updateChapter(token, ebookId, chapterId, payload);
        revalidatePath('/dashboard/ebooks');
        revalidatePath(`/dashboard/ebooks/${ebookId}`);
        revalidatePath(`/member/ebooks/${ebookId}`);

        return { ok: true, data, message: 'Chapter updated.' };
    } catch (error) {
        return toActionError(error);
    }
}

export async function deleteChapterAction(ebookId: string, chapterId: string): Promise<ActionResult<null>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        await deleteChapter(token, ebookId, chapterId);
        revalidatePath('/dashboard/ebooks');
        revalidatePath(`/dashboard/ebooks/${ebookId}`);
        revalidatePath(`/member/ebooks/${ebookId}`);

        return { ok: true, data: null, message: 'Chapter deleted.' };
    } catch (error) {
        return toActionError(error);
    }
}
