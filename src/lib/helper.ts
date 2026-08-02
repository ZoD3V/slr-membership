/** Resolve a file field's existing value to a URL string (raw string, `{url}`, or `{image_path}`). */
function toUrlIfMeta(input: any): string | null {
    if (!input) return null;
    if (typeof input === 'string') return input;

    if (typeof input === 'object') {
        if (typeof input.url === 'string' && input.url.length > 0) {
            return input.url;
        }
        if (typeof input.image_path === 'string' && input.image_path.length > 0) {
            return `/storage/${input.image_path}`;
        }
    }

    return null;
}

type FileFieldMode = 'single' | 'multiple';

type FileFieldConfig = {
    key: string;
    formKey?: string;
    existingKey?: string;
    mode?: FileFieldMode;
};

/** Wrap a single value (or pass through an array) so callers can treat both alike. */
function normalizeToArray(value: any): any[] {
    if (value == null) return [];

    return Array.isArray(value) ? value : [value];
}

/**
 * Normalize a form's file value into FormData:
 * - single mode appends the first file (or its existing URL) under `formKey`/`existingKey`
 * - multiple mode appends every item with `[]`-suffixed keys
 * For updates, appends `_method: PUT` so the backend treats the POST as a PATCH.
 */
export function buildFormData(
    data: Record<string, any>,
    isUpdate: boolean,
    fileFields: FileFieldConfig[] = [
        { key: 'image', formKey: 'image', existingKey: 'existing_image', mode: 'single' },
        { key: 'icon', formKey: 'icon', existingKey: 'existing_icon', mode: 'single' }
    ]
) {
    const fd = new FormData();

    const fileKeys = new Set(fileFields.map((ff) => ff.key));

    for (const ff of fileFields) {
        const raw = data[ff.key];
        if (!raw) continue;

        const mode: FileFieldMode = ff.mode ?? 'single';
        const formKey = ff.formKey ?? ff.key;
        const existingKey = ff.existingKey ?? `existing_${formKey}`;

        const arr = normalizeToArray(raw);

        if (mode === 'single') {
            const first = arr[0];
            if (!first) continue;

            if (first instanceof File) {
                fd.append(formKey, first);
            } else {
                const url = toUrlIfMeta(first);
                if (url) {
                    fd.append(existingKey, url);
                }
            }
        } else {
            for (const item of arr) {
                if (!item) continue;

                if (item instanceof File) {
                    fd.append(`${formKey}[]`, item);
                } else {
                    const url = toUrlIfMeta(item);
                    if (url) {
                        fd.append(`${existingKey}[]`, url);
                    }
                }
            }
        }
    }

    Object.entries(data).forEach(([key, value]) => {
        if (fileKeys.has(key) || value == null) return;

        if (Array.isArray(value)) {
            value.forEach((it) => fd.append(`${key}[]`, String(it)));

            return;
        }

        if (typeof value === 'object') {
            fd.append(key, JSON.stringify(value));

            return;
        }

        fd.append(key, String(value));
    });

    if (isUpdate) {
        fd.append('_method', 'PUT');
    }

    return fd;
}
