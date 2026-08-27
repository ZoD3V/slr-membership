import { API_BASE_URL } from './endpoints';
import { logApi } from './logger';
import { type ApiEnvelope, ApiError } from './types';

type ApiFetchOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

    body?: unknown;

    token?: string;
    headers?: Record<string, string>;

    cache?: RequestCache;

    revalidate?: number | false;

    tags?: string[];
    signal?: AbortSignal;
};

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
        void 0;
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

export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
    return (await doFetch<T>(path, opts)).data;
}

export async function apiFetchPaginated<T, M = Record<string, unknown>>(
    path: string,
    opts: ApiFetchOptions = {}
): Promise<{ data: T; meta: M }> {
    const json = await doFetch<T>(path, opts);

    return { data: json.data, meta: (json.meta ?? {}) as M };
}
