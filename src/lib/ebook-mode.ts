export type EbookContentMode = 'chapters' | 'pdf' | 'external';

function parseUrl(url: string): URL | null {
    try {
        return new URL(url);
    } catch {
        return null;
    }
}

function hasPdfExtension(value: string): boolean {
    return value.toLowerCase().endsWith('.pdf');
}

/**
 * The backend has no field for an external read link, so `pdf_url` carries both
 * an uploaded PDF asset and a link to a third-party reading site. The extension
 * is what separates them — the admin form refuses to store a `.pdf` link as an
 * external one so the two can never collide.
 */
export function resolveEbookMode(pdfUrl: string | null | undefined): EbookContentMode {
    const value = pdfUrl?.trim() ?? '';

    if (!value) return 'chapters';

    const parsed = parseUrl(value);

    if (parsed) return hasPdfExtension(parsed.pathname) ? 'pdf' : 'external';

    return hasPdfExtension(value.split('?')[0]) ? 'pdf' : 'external';
}

export function isExternalReadUrl(url: string): boolean {
    const parsed = parseUrl(url.trim());

    if (!parsed) return false;
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;

    return !hasPdfExtension(parsed.pathname);
}

export function externalHostLabel(url: string): string {
    const parsed = parseUrl(url.trim());

    if (!parsed) return '';

    return parsed.host.replace(/^www\./, '');
}
