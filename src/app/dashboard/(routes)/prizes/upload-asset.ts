'use client';

import { uploadViaPresign } from '@/lib/api/upload-asset';

import { getPrizePresignedUrlAction } from './actions';

export function uploadPrizeAsset(file: File): Promise<string> {
    return uploadViaPresign(file, getPrizePresignedUrlAction);
}
