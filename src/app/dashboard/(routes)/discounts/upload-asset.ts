'use client';

import { uploadViaPresign } from '@/lib/api/upload-asset';

import { getDiscountPresignedUrlAction } from './actions';

export function uploadDiscountAsset(file: File): Promise<string> {
    return uploadViaPresign(file, getDiscountPresignedUrlAction);
}
