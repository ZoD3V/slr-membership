import type { ListError } from '@/components/common/list-error-card';

import { ApiError } from './types';

/** Normalise a caught fetch failure into the shape ListErrorCard renders. */
export function toListError(error: unknown): ListError {
    if (error instanceof ApiError) {
        const payload = error.payload as { code?: string; requestId?: string } | undefined;

        return {
            status: error.status,
            message: error.message,
            code: payload?.code ?? null,
            requestId: payload?.requestId ?? null
        };
    }

    return { status: 0, message: String(error), code: null, requestId: null };
}
