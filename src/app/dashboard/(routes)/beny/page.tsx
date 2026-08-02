import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import type { ListError } from '@/components/common/list-error-card';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { toListError } from '@/lib/api/list-error';
import { getBenyPending } from '@/lib/api/resources/admin';
import { getAccessToken } from '@/lib/api/server';

import { toBenyTab } from './_components/tabs';
import { BenyClient, type BenyRow } from './beny-client';

function formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    const d = new Date(value);

    return Number.isNaN(d.getTime()) ? value : d.toLocaleString('en-AU');
}

export default async function BenyPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
    const { status } = await searchParams;
    const initialTab = toBenyTab(status);
    const token = await getAccessToken();

    let rows: BenyRow[] = [];
    let totalCount = 0;
    let listError: ListError | null = null;

    if (token) {
        try {
            // Fetch from the stable getBenyPending endpoint to support legacy backend on initial load
            const pending = await getBenyPending(token);
            const pendingList = Array.isArray(pending)
                ? pending
                : (pending && (pending as any).items
                    ? (pending as any).items
                    : []);
            rows = pendingList.map((b: any) => ({
                id: b.beny_subscription_id,
                name: b.name || '-',
                email: b.email || '-',
                phone: b.phone || '-',
                status: b.status || '-',
                requestedAt: formatDate(b.created_at),
                activatedAt: null,
                accessEndsAt: null,
                accessEndsAtIso: null,
                deactivatedAt: null,
                deactivationReason: null
            }));
            totalCount = rows.length;
        } catch (error) {
            handleApiAuthError(error); // 401 only → force logout; others fall through
            listError = toListError(error);
        }
    }

    return (
        <DashboardPageShell>
            <Heading
                title='BENY Accounts'
                description='Review, activate, and deactivate manual BENY add-on subscriptions'
            />

            <BenyClient initialRows={rows} initialTotal={totalCount} initialTab={initialTab} listError={listError} />
        </DashboardPageShell>
    );
}
