'use client';

import { uploadViaPresign } from '@/lib/api/upload-asset';

import { getAnnouncementPresignedUrlAction } from '../actions';

export function uploadAnnouncementAsset(file: File): Promise<string> {
    return uploadViaPresign(file, getAnnouncementPresignedUrlAction);
}
