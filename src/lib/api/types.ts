// Shared API primitives for the SLR REST backend (https://api.smartliferewards.com.au).
// Every endpoint returns this envelope; unwrap to the typed `data` payload.

export interface ApiEnvelope<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
}

/** Thrown by `apiFetch` on a transport error or a `success: false` envelope. */
export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public payload?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/** One field-level validation error from a `VALIDATION_ERROR` envelope. */
export interface ApiFieldError {
    field: string;
    message: string;
}

/**
 * User-facing message for an ApiError. Prefers the first field-level validation
 * message from the envelope's `errors` array (e.g. "must NOT have fewer than 10
 * characters") over the generic top-level message; falls back to the latter.
 */
export function apiErrorMessage(error: ApiError): string {
    const errors = (error.payload as { errors?: unknown } | null | undefined)?.errors;
    const first = Array.isArray(errors) ? (errors[0] as { message?: unknown } | undefined) : undefined;

    return typeof first?.message === 'string' && first.message.length > 0 ? first.message : error.message;
}

/** Machine-readable envelope code (`ACCOUNT_PENDING_PAYMENT`, `NOT_FOUND`, …). */
export function apiErrorCode(error: ApiError): string | null {
    const code = (error.payload as { code?: unknown } | null | undefined)?.code;

    return typeof code === 'string' ? code : null;
}
