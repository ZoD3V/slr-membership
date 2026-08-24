'use server';

import { type ContactPayload, type ContactSubmission, submitContact } from '@/lib/api/resources/contact';
import { ApiError } from '@/lib/api/types';

export type ActionError = {
    ok: false;
    message: string;
    status?: number;
    code?: string | null;
    fieldErrors?: Record<string, string>;
};

export type ActionResult<T> = { ok: true; data: T; message: string } | ActionError;

function toActionError(error: unknown): ActionError {
    if (error instanceof ApiError) {
        const payload = error.payload as
            | { code?: string; details?: { field: string; message: string }[] }
            | undefined;

        const fieldErrors = payload?.details?.reduce<Record<string, string>>((acc, d) => {
            acc[d.field] = d.message;

            return acc;
        }, {});

        const message =
            payload?.code === 'RATE_LIMIT_EXCEEDED'
                ? "You've sent too many messages — please wait a minute and try again."
                : error.message;

        return {
            ok: false,
            message,
            status: error.status,
            code: payload?.code ?? null,
            fieldErrors: fieldErrors && Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined
        };
    }

    return { ok: false, message: 'Something went wrong. Please try again.' };
}

export async function submitContactAction(payload: ContactPayload): Promise<ActionResult<ContactSubmission>> {
    try {
        const data = await submitContact(payload);
        const ticket = data?.ticket_id ?? data?.submission_id ?? data?.reference_id;
        const refText = ticket ? ` (Ticket #${ticket})` : '';

        return { ok: true, data, message: `Message sent${refText}. We'll get back to you within one business day.` };
    } catch (error) {
        return toActionError(error);
    }
}
