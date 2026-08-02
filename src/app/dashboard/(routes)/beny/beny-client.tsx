'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { type ListError, ListErrorCard } from '@/components/common/list-error-card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';

import { benyColumnsFor } from './_components/columns';
import { type BenyTab, DEFAULT_BENY_TAB, TABS, isTabSupported } from './_components/tabs';
import { activateBenyAction, deactivateBenyAction, getBenySubscriptionsAction } from './actions';
import { Construction, UserCheck, UserMinus } from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export type BenyRow = {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    requestedAt: string;
    activatedAt?: string | null;
    accessEndsAt?: string | null;
    /** Raw ISO alongside the display string — the paid period must actually be
     *  over before access can be revoked, and that needs a real date to compare. */
    accessEndsAtIso?: string | null;
    deactivatedAt?: string | null;
    deactivationReason?: string | null;
};

// Mirrors the three triggers that move a subscription into pending_deactivation
// (PRD §2.3), plus a free-text escape hatch.
const EMPTY_TEXT: Record<BenyTab, { title: string; description: string }> = {
    pending_activation: {
        title: 'No pending activations',
        description: 'All BENY subscriptions have been handled. New pending requests will appear here.'
    },
    active: { title: 'No active accounts', description: 'There are currently no active BENY accounts.' },
    pending_deactivation: {
        title: 'No pending deactivations',
        description: 'All cancelled or unpaid BENY subscriptions have been successfully processed.'
    },
    cancelled: { title: 'No cancelled accounts', description: 'No BENY subscriptions have been cancelled yet.' }
};

export function BenyClient({
    initialRows,
    initialTotal,
    initialTab,
    listError
}: {
    initialRows: BenyRow[];
    initialTotal: number;
    initialTab: BenyTab;
    listError: ListError | null;
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<BenyTab>(initialTab);
    const [rows, setRows] = useState<BenyRow[]>(initialRows);
    const [total, setTotal] = useState<number>(initialTotal);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [apiSupported, setApiSupported] = useState<boolean>(true);

    const [activateTarget, setActivateTarget] = useState<BenyRow | null>(null);
    const [deactivateTarget, setDeactivateTarget] = useState<BenyRow | null>(null);

    const [isPending, startTransition] = useTransition();

    const loadData = (tab: BenyTab, page: number) => {
        // Backend has no pending_deactivation status yet — requesting it can only 400.
        if (!isTabSupported(tab)) {
            setRows([]);
            setTotal(0);

            return;
        }
        if (!apiSupported && tab === DEFAULT_BENY_TAB) return; // served by the local fallback below

        startTransition(async () => {
            const res = await getBenySubscriptionsAction(tab, page, ITEMS_PER_PAGE);
            if (res.ok) {
                const mapped = res.data.data.map((b: any) => ({
                    id: b.beny_subscription_id,
                    name: b.name || '-',
                    email: b.email || '-',
                    phone: b.phone || '-',
                    status: b.status || '-',
                    requestedAt: b.created_at ? new Date(b.created_at).toLocaleString('en-AU') : '-',
                    activatedAt: b.activated_at ? new Date(b.activated_at).toLocaleString('en-AU') : null,
                    accessEndsAt: b.access_ends_at ? new Date(b.access_ends_at).toLocaleString('en-AU') : null,
                    accessEndsAtIso: b.access_ends_at ?? null,
                    deactivatedAt: b.deactivated_at ? new Date(b.deactivated_at).toLocaleString('en-AU') : null,
                    deactivationReason: b.deactivation_reason || null
                }));
                setRows(mapped);
                setTotal(res.data.total);
                setApiSupported(true);
            } else if (res.status === 404 || res.status === 400 || res.status === 405) {
                // Paginated list endpoint isn't live yet — fall back to the server
                // prefetch, which only covers the pending tab.
                console.warn('Backend does not support paginated BENY lists endpoint, using fallback.');
                setApiSupported(false);
                setRows(tab === DEFAULT_BENY_TAB ? initialRows : []);
                setTotal(tab === DEFAULT_BENY_TAB ? initialTotal : 0);
            } else {
                toast.error(res.message);
            }
        });
    };

    // The server only prefetches the pending tab, so any other deep-linked tab
    // has to fetch itself once on mount.
    const didMountFetch = useRef(false);
    useEffect(() => {
        if (didMountFetch.current || initialTab === DEFAULT_BENY_TAB) return;
        didMountFetch.current = true;
        loadData(initialTab, 1);
    }, []);

    const handleTabChange = (tab: BenyTab) => {
        setActiveTab(tab);
        setCurrentPage(1);
        loadData(tab, 1);
        // Keep the tab in the URL so it stays shareable and Back-navigable.
        router.replace(`/dashboard/beny?status=${tab}`, { scroll: false });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        loadData(activeTab, page);
    };

    const confirmActivate = () => {
        if (!activateTarget) return;
        const { id } = activateTarget;
        startTransition(async () => {
            const res = await activateBenyAction(id);
            if (res.ok) {
                setRows((prev) => prev.filter((r) => r.id !== id));
                setTotal((prev) => Math.max(0, prev - 1));
                toast.success(res.message);
            } else {
                toast.error(res.code ? `${res.message} (${res.code})` : res.message);
            }
            setActivateTarget(null);
        });
    };

    const confirmDeactivate = () => {
        if (!deactivateTarget) return;
        const { id } = deactivateTarget;

        startTransition(async () => {
            const res = await deactivateBenyAction(id);
            if (res.ok) {
                setRows((prev) => prev.filter((r) => r.id !== id));
                setTotal((prev) => Math.max(0, prev - 1));
                toast.success(res.message);
            } else {
                toast.error(res.code ? `${res.message} (${res.code})` : res.message);
            }
            setDeactivateTarget(null);
        });
    };

    // Without the paginated endpoint the pending tab paginates the prefetch locally.
    const usingLocalFallback = !apiSupported && activeTab === DEFAULT_BENY_TAB;
    const displayedRows = usingLocalFallback
        ? initialRows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
        : rows;
    const displayedTotal = usingLocalFallback ? initialTotal : total;

    const openDeactivate = (row: BenyRow) => {
        setDeactivateTarget(row);
    };

    const columns = benyColumnsFor(activeTab, { onActivate: setActivateTarget, onDeactivate: openDeactivate });
    const emptyText = EMPTY_TEXT[activeTab];
    const EmptyIcon = activeTab === DEFAULT_BENY_TAB ? UserCheck : UserMinus;

    return (
        <>
            {listError ? (
                <ListErrorCard
                    error={listError}
                    title='BENY list unavailable — report this to the backend'
                    description={`Retrieve failed, so BENY subscriptions can't be shown.`}
                />
            ) : null}

            <div className='border-slr-navy-border mb-2 flex gap-2 overflow-x-auto border-b'>
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        disabled={isPending}
                        onClick={() => handleTabChange(t.id)}
                        className={`shrink-0 border-b-2 px-4 pb-3 text-xs font-semibold tracking-wide uppercase transition-colors sm:text-sm ${
                            activeTab === t.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* The table always renders — headers and the pager stay put at any row
                count, and the per-tab copy lives inside the empty row rather than in
                a second card stacked above it. */}
            <DataTable
                isSearch={true}
                searchKey='name'
                columns={columns}
                data={displayedRows}
                serverSide={!usingLocalFallback}
                currentPage={currentPage}
                totalItems={displayedTotal}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
                isLoading={isPending}
                // Tabs swap the row set constantly — keeping the pager pinned
                // means the total is always readable, even on a single page.
                alwaysShowPagination
                emptyMessage={
                    <span className='flex flex-col items-center gap-1'>
                        <EmptyIcon className='mb-1 size-8 opacity-40' />
                        <span className='text-foreground text-sm font-semibold'>{emptyText.title}</span>
                        <span className='max-w-sm text-xs leading-relaxed'>{emptyText.description}</span>
                    </span>
                }
            />

            <ConfirmDialog
                open={!!activateTarget}
                onOpenChange={(open) => {
                    if (!open) setActivateTarget(null);
                }}
                className='dashboard-theme dark'
                title='Activate BENY Add-on?'
                confirmText={isPending ? 'Activating...' : 'Yes, Activate'}
                cancelBtnText='Cancel'
                isLoading={isPending}
                handleConfirm={confirmActivate}
                desc={`This will mark the BENY addon for ${activateTarget?.name} as ACTIVE. Confirm after manually adding the member details into the third-party BENY dashboard.`}
            />

            <ConfirmDialog
                open={!!deactivateTarget}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeactivateTarget(null);
                    }
                }}
                className='dashboard-theme dark'
                title='Mark as Deactivated?'
                confirmText={isPending ? 'Recording...' : 'Yes, Mark as Deactivated'}
                cancelBtnText='Cancel'
                destructive
                isLoading={isPending}
                handleConfirm={confirmDeactivate}
                desc={`This records that ${deactivateTarget?.name}'s BENY access has already been revoked in the BENY portal, and moves them to Cancelled. It does not revoke anything itself — do that in the BENY portal first, and only after their paid access has ended.`}
            />
        </>
    );
}
