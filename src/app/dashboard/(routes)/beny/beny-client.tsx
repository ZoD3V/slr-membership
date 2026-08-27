'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { type ListError } from '@/components/common/list-error-card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDateTime } from '@/lib/member';

import { benyColumnsFor } from './_components/columns';
import { type BenyTab, DEFAULT_BENY_TAB, TABS, isTabSupported } from './_components/tabs';
import { activateBenyAction, deactivateBenyAction, getBenySubscriptionsAction } from './actions';
import { UserCheck, UserMinus } from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

const FETCH_LIMIT = 200;

export type BenyRow = {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    requestedAt: string;
    activatedAt?: string | null;
    accessEndsAt?: string | null;

    accessEndsAtIso?: string | null;
    deactivatedAt?: string | null;
    deactivationReason?: string | null;
};

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
    initialTab,
    listError
}: {
    initialRows: BenyRow[];
    initialTab: BenyTab;
    listError: ListError | null;
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<BenyTab>(initialTab);
    const [rows, setRows] = useState<BenyRow[]>(initialRows);
    const [apiSupported, setApiSupported] = useState<boolean>(true);

    const [activateTarget, setActivateTarget] = useState<BenyRow | null>(null);
    const [deactivateTarget, setDeactivateTarget] = useState<BenyRow | null>(null);
    const [deactivationReason, setDeactivationReason] = useState('');

    const [isPending, startTransition] = useTransition();

    const loadData = (tab: BenyTab) => {
        if (!isTabSupported(tab)) {
            setRows([]);

            return;
        }
        if (!apiSupported && tab === DEFAULT_BENY_TAB) return;

        startTransition(async () => {
            const res = await getBenySubscriptionsAction(tab, 1, FETCH_LIMIT);
            if (res.ok) {
                const mapped = res.data.data.map((b: any) => ({
                    id: b.beny_subscription_id,
                    name: b.name || '-',
                    email: b.email || '-',
                    phone: b.phone || '-',
                    status: b.status || '-',
                    requestedAt: formatDateTime(b.created_at),
                    activatedAt: b.activated_at ? formatDateTime(b.activated_at) : null,
                    accessEndsAt: b.access_ends_at ? formatDateTime(b.access_ends_at) : null,
                    accessEndsAtIso: b.access_ends_at ?? null,
                    deactivatedAt: b.deactivated_at ? formatDateTime(b.deactivated_at) : null,
                    deactivationReason: b.deactivation_reason || null
                }));
                setRows(mapped);
                setApiSupported(true);
            } else if (res.status === 404 || res.status === 400 || res.status === 405) {
                console.warn('Backend does not support paginated BENY lists endpoint, using fallback.');
                setApiSupported(false);
                setRows(tab === DEFAULT_BENY_TAB ? initialRows : []);
            } else {
                toast.error(res.message);
            }
        });
    };

    const didMountFetch = useRef(false);
    useEffect(() => {
        if (didMountFetch.current || initialTab === DEFAULT_BENY_TAB) return;
        didMountFetch.current = true;
        loadData(initialTab);
    }, []);

    const handleTabChange = (tab: BenyTab) => {
        setActiveTab(tab);
        loadData(tab);

        router.replace(`/dashboard/beny?status=${tab}`, { scroll: false });
    };

    const confirmActivate = () => {
        if (!activateTarget) return;
        const { id } = activateTarget;
        startTransition(async () => {
            const res = await activateBenyAction(id);
            if (res.ok) {
                setRows((prev) => prev.filter((r) => r.id !== id));
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
            const res = await deactivateBenyAction(id, deactivationReason || undefined);
            if (res.ok) {
                setRows((prev) => prev.filter((r) => r.id !== id));
                toast.success(res.message);
                setDeactivationReason('');
            } else {
                toast.error(res.code ? `${res.message} (${res.code})` : res.message);
            }
            setDeactivateTarget(null);
        });
    };

    const openDeactivate = (row: BenyRow) => {
        setDeactivateTarget(row);
    };

    const columns = benyColumnsFor(activeTab, { onActivate: setActivateTarget, onDeactivate: openDeactivate });
    const emptyText = EMPTY_TEXT[activeTab];
    const EmptyIcon = activeTab === DEFAULT_BENY_TAB ? UserCheck : UserMinus;

    return (
        <>
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

            <DataTable
                isSearch={true}
                searchKey='name'
                columns={columns}
                data={rows}
                itemsPerPage={ITEMS_PER_PAGE}
                isLoading={isPending}
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
                        setDeactivationReason('');
                    }
                }}
                className='dashboard-theme dark'
                title='Mark as Deactivated?'
                confirmText={isPending ? 'Recording...' : 'Yes, Mark as Deactivated'}
                cancelBtnText='Cancel'
                destructive
                isLoading={isPending}
                handleConfirm={confirmDeactivate}
                desc={`This records that ${deactivateTarget?.name}'s BENY access has already been revoked in the BENY portal, and moves them to Cancelled. It does not revoke anything itself — do that in the BENY portal first, and only after their paid access has ended.`}>
                <div className='mt-4 space-y-2 text-start'>
                    <label htmlFor='reason' className='text-muted-foreground text-xs font-semibold uppercase'>
                        Deactivation Reason
                    </label>
                    <Select value={deactivationReason} onValueChange={setDeactivationReason}>
                        <SelectTrigger className='w-full border-neutral-700 bg-neutral-900 text-white'>
                            <SelectValue placeholder='Select a reason...' />
                        </SelectTrigger>
                        <SelectContent className='dashboard-theme dark border-border bg-background text-foreground'>
                            <SelectItem value='Member cancelled'>Member cancelled</SelectItem>
                            <SelectItem value='Payment failed'>Payment failed</SelectItem>
                            <SelectItem value='Admin refund'>Admin refund</SelectItem>
                            <SelectItem value='Other'>Other / manual revocation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </ConfirmDialog>
        </>
    );
}
