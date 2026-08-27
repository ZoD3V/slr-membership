export interface ApiEnvelope<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
}

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

export interface ApiFieldError {
    field: string;
    message: string;
}

export function apiErrorMessage(error: ApiError): string {
    const errors = (error.payload as { errors?: unknown } | null | undefined)?.errors;
    const first = Array.isArray(errors) ? (errors[0] as { message?: unknown } | undefined) : undefined;

    return typeof first?.message === 'string' && first.message.length > 0 ? first.message : error.message;
}

export function apiErrorCode(error: ApiError): string | null {
    const code = (error.payload as { code?: unknown } | null | undefined)?.code;

    return typeof code === 'string' ? code : null;
}
