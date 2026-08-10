import { API_BASE_URL } from './endpoints';
import { logApi } from './logger';
import { type ApiEnvelope, ApiError } from './types';

type ApiFetchOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    /** JSON body — serialized automatically. */
    body?: unknown;
    /** Bearer token for authenticated calls. */
    token?: string;
    headers?: Record<string, string>;
    /** Next.js fetch cache mode (server). */
    cache?: RequestCache;
    /** ISR revalidate seconds, or false to opt out (server). */
    revalidate?: number | false;
    /** Cache tags for on-demand revalidation (server). */
    tags?: string[];
    signal?: AbortSignal;
};

/** Shared request/parse/error/logging logic for apiFetch and apiFetchPaginated. */
async function doFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<ApiEnvelope<T>> {
    const { method = 'GET', body, token, headers, cache, revalidate, tags, signal } = opts;

    const next =
        revalidate !== undefined || tags
            ? { revalidate: revalidate === false ? undefined : revalidate, tags }
            : undefined;

    const start = Date.now();

    let res: Response;
    try {
        res = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers: {
                Accept: 'application/json',
                ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...headers
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal,
            ...(cache ? { cache } : {}),
            ...(next ? { next } : {})
        });
    } catch (networkError) {
        // Request never reached the API (DNS, offline, aborted).
        logApi({
            method,
            path,
            status: 0,
            ms: Date.now() - start,
            ok: false,
            error: { message: String(networkError) }
        });
        throw networkError;
    }

    let json: ApiEnvelope<T> | undefined;
    try {
        json = (await res.json()) as ApiEnvelope<T>;
    } catch {
        // Non-JSON response (e.g. gateway error page).
    }

    const ms = Date.now() - start;

    if (!res.ok || !json?.success) {
        logApi({
            method,
            path,
            status: res.status,
            statusText: res.statusText,
            message: json?.message ?? `Request failed (${res.status})`,
            ms,
            ok: false,
            error: json ?? { message: `Request failed (${res.status})` }
        });
        throw new ApiError(res.status, json?.message ?? `Request failed (${res.status})`, json);
    }

    logApi({ method, path, status: res.status, message: json.message, ms, ok: true, data: json.data });

    return json;
}

/**
 * Single entry point for hitting the SLR API. Works in Server Components,
 * route handlers, server actions, and the client. Unwraps the `{ success,
 * message, data }` envelope and throws `ApiError` on failure.
 *
 * Build typed resource functions on top of this (see `resources/*`) rather
 * than calling it directly from components.
 */
export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
    return (await doFetch<T>(path, opts)).data;
}

/**
 * Same as apiFetch, but keeps the envelope's `meta` — for server-paginated
 * list endpoints that return `{ data: T[], meta: { page, total_pages, ... } }`.
 */
export async function apiFetchPaginated<T, M = Record<string, unknown>>(
    path: string,
    opts: ApiFetchOptions = {}
): Promise<{ data: T; meta: M }> {
    const json = await doFetch<T>(path, opts);

    return { data: json.data, meta: (json.meta ?? {}) as M };
}
