import { handleApiAuthError } from '@/lib/api/guard';
import { getBenyPending, getBenySubscriptions } from '@/lib/api/resources/admin';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';

import { BenyClient, type BenyRow, type ListError } from './beny-client';

function formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    const d = new Date(value);

    return Number.isNaN(d.getTime()) ? value : d.toLocaleString('en-AU');
}

export default async function BenyPage() {
    const token = await getAccessToken();

    let rows: BenyRow[] = [];
    let totalCount = 0;
    let listError: ListError | null = null;

    if (token) {
        try {
            // Fetch from the stable getBenyPending endpoint to support legacy backend on initial load
            const pending = await getBenyPending(token);
            rows = pending.map((b) => ({
                id: b.beny_subscription_id,
                name: b.name || '-',
                email: b.email || '-',
                phone: b.phone || '-',
                status: b.status || '-',
                requestedAt: formatDate(b.created_at),
                activatedAt: null,
                accessEndsAt: null,
                deactivatedAt: null,
                deactivationReason: null
            }));
            totalCount = rows.length;
        } catch (error) {
            handleApiAuthError(error); // 401 only → force logout; others fall through
            if (error instanceof ApiError) {
                const payload = error.payload as { code?: string; requestId?: string } | undefined;
                listError = {
                    status: error.status,
                    message: error.message,
                    code: payload?.code ?? null,
                    requestId: payload?.requestId ?? null
                };
            } else {
                listError = { status: 0, message: String(error), code: null, requestId: null };
            }
        }
    }

    return <BenyClient initialRows={rows} initialTotal={totalCount} listError={listError} />;
}
