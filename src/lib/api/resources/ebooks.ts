import { cache } from 'react';

import { API } from '../endpoints';
import { apiFetch } from '../http';

export type EbookTier = 'VISITOR' | 'RED' | 'BLUE';

export interface EbookListItem {
    ebook_id: string;
    title: string;
    subtitle: string | null;
    cover_url: string | null;
    pdf_url: string | null;
    description: string | null;
    category: string | null;
    footnote: string | null;
    reading_time_minutes: number;
    chapter_count: number;
    is_locked: boolean;
}

export interface EbookAdmin {
    id: string;
    title: string;
    subtitle: string | null;
    coverUrl: string | null;
    pdfUrl: string | null;
    description: string | null;
    category: string | null;
    footnote: string | null;
    tierAccess: EbookTier;
    readingTimeMinutes: number;
    chapterCount: number;
    isActive: boolean;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface EbookPayload {
    title: string;
    subtitle?: string;
    coverUrl?: string;
    pdfUrl?: string | null;
    description?: string;
    category?: string;
    footnote?: string;
    tierAccess: EbookTier;
    readingTimeMinutes: number;
}

export interface EbookChapter {
    chapter_id?: string;
    chapter_number: number;
    title: string;
    image_url: string | null;
    body: string;
    pull_quote: string | null;
}

export interface EbookDetail {
    ebook_id: string;
    title: string;
    subtitle: string | null;
    cover_url: string | null;
    pdf_url: string | null;
    footnote: string | null;
    reading_time_minutes: number;
    chapter_count: number;
    published_at: string | null;
    chapters: EbookChapter[];
}

export interface ChapterPayload {
    chapterNumber: number;
    title: string;
    body: string;
    imageUrl?: string | null;
    pullQuote?: string | null;
    sortOrder?: number;
}

export interface ChapterAdmin {
    id: string;
    ebookId: string;
    chapterNumber: number;
    title: string;
    imageUrl: string | null;
    body: string;
    pullQuote: string | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export const getEbooks = cache((token: string) =>
    apiFetch<EbookListItem[]>(API.ebooks.list, { token, cache: 'no-store' })
);

export const getEbook = cache((id: string, token: string) =>
    apiFetch<EbookDetail>(API.ebooks.detail(id), { token, cache: 'no-store' })
);

export const createEbook = (token: string, body: EbookPayload) =>
    apiFetch<EbookAdmin>(API.ebooks.create, { method: 'POST', token, body });

export const updateEbook = (token: string, id: string, body: EbookPayload) =>
    apiFetch<EbookAdmin>(API.ebooks.update(id), { method: 'PATCH', token, body });

export const deleteEbook = (token: string, id: string) =>
    apiFetch<null>(API.ebooks.remove(id), { method: 'DELETE', token });

export interface PresignedUrlPayload {
    filename: string;
    contentType: string;
    fileSize: number;
}

export interface PresignedUrlResponse {
    upload_url: string;
    download_url: string;
    object_key: string;
}

export const getEbookPresignedUrl = (token: string, body: PresignedUrlPayload) =>
    apiFetch<PresignedUrlResponse>(API.ebooks.presignedUrl, { method: 'POST', token, body });

export const createChapter = (token: string, ebookId: string, body: ChapterPayload) =>
    apiFetch<ChapterAdmin>(API.ebooks.createChapter(ebookId), { method: 'POST', token, body });

export const updateChapter = (token: string, ebookId: string, chapterId: string, body: ChapterPayload) =>
    apiFetch<ChapterAdmin>(API.ebooks.updateChapter(ebookId, chapterId), { method: 'PATCH', token, body });

export const deleteChapter = (token: string, ebookId: string, chapterId: string) =>
    apiFetch<null>(API.ebooks.deleteChapter(ebookId, chapterId), { method: 'DELETE', token });
