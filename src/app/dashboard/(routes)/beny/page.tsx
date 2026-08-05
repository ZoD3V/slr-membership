import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import type { ListError } from '@/components/common/list-error-card';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { toListError } from '@/lib/api/list-error';
import { getBenyPending, getBenySubscriptions } from '@/lib/api/resources/admin';
import { getAccessToken } from '@/lib/api/server';
import { formatDateTime as formatDate } from '@/lib/member';

import { toBenyTab } from './_components/tabs';
import { BenyClient, type BenyRow } from './beny-client';

export default async function BenyPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
    const { status } = await searchParams;
    const initialTab = toBenyTab(status);
    const token = await getAccessToken();

    let rows: BenyRow[] = [];
    let listError: ListError | null = null;

    if (token) {
        try {
            let res;
            if (initialTab === 'pending_deactivation') {
                // Backend does not support ?status=pending_deactivation and 400s.
                // Fetch all items and filter client side.
                res = await getBenySubscriptions('', token, 1, 200);
            } else {
                res = await getBenySubscriptions(initialTab, token, 1, 200).catch((err) => {
                    if (initialTab === 'pending_activation') {
                        return getBenyPending(token);
                    }
                    throw err;
                });
            }

            let items: any[] = [];
            if (Array.isArray(res)) {
                items = res;
            } else if (res && typeof res === 'object') {
                items = res.items || res.data || res.subscriptions || [];
            }

            if (initialTab === 'pending_deactivation') {
                items = items.filter((b: any) => (b.status || '').toLowerCase() === 'pending_deactivation');
            }

            rows = items.map((b: any) => ({
                id: b.beny_subscription_id,
                name: b.name || '-',
                email: b.email || '-',
                phone: b.phone || '-',
                status: b.status || '-',
                requestedAt: formatDate(b.created_at),
                activatedAt: b.activated_at ? formatDate(b.activated_at) : null,
                accessEndsAt: b.access_ends_at ? formatDate(b.access_ends_at) : null,
                accessEndsAtIso: b.access_ends_at ?? null,
                deactivatedAt: b.deactivated_at ? formatDate(b.deactivated_at) : null,
                deactivationReason: b.deactivation_reason || null
            }));
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

            <BenyClient initialRows={rows} initialTab={initialTab} listError={listError} />
        </DashboardPageShell>
    );
}
