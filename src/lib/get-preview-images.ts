import React from 'react';

import { ImageMeta } from '@/types/images';

/**
 * Convert an array of strings / Blobs / ImageMeta into stable object-URL previews
 * for <img src>. Strings and `{url}` / `{image_path}` metas pass through as-is;
 * Blobs get a temporary object URL that is revoked on cleanup. Used by image
 * upload fields to preview a freshly picked file before it is uploaded.
 */
export function useObjectURLPreviews(items: Array<string | File | Blob | ImageMeta | null | undefined>) {
    const [urls, setUrls] = React.useState<string[]>([]);

    React.useEffect(() => {
        const canCreate =
            typeof window !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';

        const created: string[] = [];
        const out: string[] = [];

        for (const it of items ?? []) {
            if (!it) continue;

            if (typeof it === 'string') {
                out.push(it);
                continue;
            }

            if (typeof it === 'object' && !(it instanceof Blob)) {
                const meta = it as any;
                if (typeof meta.url === 'string' && meta.url.length > 0) {
                    out.push(meta.url);
                    continue;
                }
                if (typeof meta.image_path === 'string' && meta.image_path.length > 0) {
                    out.push(`/storage/${meta.image_path}`);
                    continue;
                }
                continue;
            }

            if (canCreate && it instanceof Blob) {
                const u = URL.createObjectURL(it);
                created.push(u);
                out.push(u);
            }
        }

        setUrls((prev) => {
            if (prev.length === out.length && prev.every((v, i) => v === out[i])) {
                return prev;
            }

            return out;
        });

        return () => {
            for (const u of created) {
                // One bad revoke must not skip the rest of the cleanup loop.
                try {
                    URL.revokeObjectURL(u);
                } catch {
                    // no-op — the URL is simply left unreleased
                }
            }
        };
    }, [items]);

    return urls;
}
