import { externalHostLabel, isExternalReadUrl, resolveEbookMode } from './ebook-mode';
import { describe, expect, it } from 'vitest';

describe('resolveEbookMode', () => {
    it('treats a missing pdf_url as a chaptered ebook', () => {
        expect(resolveEbookMode(null)).toBe('chapters');
        expect(resolveEbookMode('')).toBe('chapters');
        expect(resolveEbookMode('   ')).toBe('chapters');
    });

    it('treats an uploaded .pdf asset as a pdf ebook', () => {
        expect(resolveEbookMode('https://storage.example.com/ebooks/1712-ab-book.pdf')).toBe('pdf');
    });

    it('ignores the presigned query string when reading the extension', () => {
        expect(resolveEbookMode('https://storage.example.com/ebooks/1712-ab-book.pdf?X-Amz-Signature=abc&e=1')).toBe(
            'pdf'
        );
    });

    it('matches the extension case-insensitively', () => {
        expect(resolveEbookMode('https://storage.example.com/ebooks/BOOK.PDF')).toBe('pdf');
    });

    it('treats any other http(s) url as an external read link', () => {
        expect(resolveEbookMode('https://www.free-ebooks.net/self-help/Becoming-Mindful')).toBe('external');
        expect(resolveEbookMode('http://example.com/read/123')).toBe('external');
    });

    it('falls back to a raw suffix check when the url does not parse', () => {
        expect(resolveEbookMode('ebooks/local-copy.pdf')).toBe('pdf');
        expect(resolveEbookMode('not a url at all')).toBe('external');
    });
});

describe('isExternalReadUrl', () => {
    it('accepts an http(s) url that is not a pdf', () => {
        expect(isExternalReadUrl('https://www.free-ebooks.net/self-help/Becoming-Mindful')).toBe(true);
    });

    it('rejects a pdf url, so it is saved through the PDF mode instead', () => {
        expect(isExternalReadUrl('https://example.com/book.pdf')).toBe(false);
    });

    it('rejects a non-http protocol and anything unparseable', () => {
        expect(isExternalReadUrl('ftp://example.com/book')).toBe(false);
        expect(isExternalReadUrl('javascript:alert(1)')).toBe(false);
        expect(isExternalReadUrl('example.com/book')).toBe(false);
        expect(isExternalReadUrl('')).toBe(false);
    });
});

describe('externalHostLabel', () => {
    it('returns the host without a www prefix', () => {
        expect(externalHostLabel('https://www.free-ebooks.net/self-help/Becoming-Mindful')).toBe('free-ebooks.net');
    });

    it('returns an empty string when the url does not parse', () => {
        expect(externalHostLabel('not a url')).toBe('');
    });
});
