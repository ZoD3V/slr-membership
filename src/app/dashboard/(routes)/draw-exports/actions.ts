'use server';

import { revalidatePath } from 'next/cache';

import { handleApiAuthError } from '@/lib/api/guard';
import { type DrawCsvGenerateResult, generateDrawCsv } from '@/lib/api/resources/admin';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';

export type ActionResult<T> = { ok: true; data: T; message: string } | { ok: false; message: string };

export async function generateDrawCsvAction(): Promise<ActionResult<DrawCsvGenerateResult>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await generateDrawCsv(token);
        revalidatePath('/dashboard/draw-exports');

        return { ok: true, data, message: 'CSV files generated.' };
    } catch (error) {
        handleApiAuthError(error);

        return { ok: false, message: error instanceof ApiError ? error.message : 'Could not generate the CSV files.' };
    }
}
