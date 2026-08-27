'use client';

import { uploadViaPresign } from '@/lib/api/upload-asset';

import { getEbookPresignedUrlAction } from '../actions';

export function uploadEbookAsset(file: File): Promise<string> {
    return uploadViaPresign(file, getEbookPresignedUrlAction);
}
