'use client';

import { useEffect, useState, useTransition } from 'react';

import EmptyState from '@/components/common/empty-state';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Heading from '@/components/ui/heading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { activateBenyAction, deactivateBenyAction, getBenySubscriptionsAction } from './actions';
import { ChevronLeft, ChevronRight, Loader2, TriangleAlert, UserCheck, UserMinus } from 'lucide-react';
import { toast } from 'sonner';

function getPaginationRange(currentPage: number, totalPages: number) {
    const range: (number | '...')[] = [];

    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) range.push(i);
        
return range;
    }

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
        start = 1;
        end = 5;
    } else if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
        end = totalPages;
    }

    for (let i = start; i <= end; i++) {
        range.push(i);
    }

    return range;
}

export type BenyRow = {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    requestedAt: string;
    activatedAt?: string | null;
    accessEndsAt?: string | null;
    deactivatedAt?: string | null;
    deactivationReason?: string | null;
};

export type ListError = {
    status: number;
    message: string;
    code: string | null;
    requestId: string | null;
};

const ListErrorCard = ({ error }: { error: ListError }) => (
    <div className='rounded-xl border border-red-500/40 bg-red-500/5 p-4'>
        <div className='flex items-center gap-2 text-red-400'>
            <TriangleAlert className='h-4 w-4' />
            <p className='text-sm font-semibold'>BENY list unavailable — report this to the backend</p>
        </div>
        <p className='text-muted-foreground mt-1 text-xs'>{`Retrieve failed, so BENY subscriptions can't be shown.`}</p>
        <dl className='mt-3 grid grid-cols-1 gap-1 font-mono text-xs sm:grid-cols-2'>
            <div className='flex gap-2'>
                <dt className='text-muted-foreground'>status</dt>
                <dd className='text-white select-all'>{error.status}</dd>
            </div>
            <div className='flex gap-2'>
                <dt className='text-muted-foreground'>code</dt>
                <dd className='text-white select-all'>{error.code ?? '-'}</dd>
            </div>
            <div className='flex gap-2 sm:col-span-2'>
                <dt className='text-muted-foreground'>message</dt>
                <dd className='text-white select-all'>{error.message}</dd>
            </div>
            <div className='flex gap-2 sm:col-span-2'>
                <dt className='text-muted-foreground'>requestId</dt>
                <dd className='text-white select-all'>{error.requestId ?? '-'}</dd>
            </div>
        </dl>
    </div>
);

const TABS = [
    { id: 'pending_activation', label: 'Pending Activation' },
    { id: 'active', label: 'Active' },
    { id: 'pending_deactivation', label: 'Pending Deactivation' },
    { id: 'cancelled', label: 'Cancelled' }
] as const;

export function BenyClient({
    initialRows,
    initialTotal,
    listError
}: {
    initialRows: BenyRow[];
    initialTotal: number;
    listError: ListError | null;
}) {
    const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('pending_activation');
    const [rows, setRows] = useState<BenyRow[]>(initialRows);
    const [total, setTotal] = useState<number>(initialTotal);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [apiSupported, setApiSupported] = useState<boolean>(true);

    const [activateTarget, setActivateTarget] = useState<BenyRow | null>(null);
    const [deactivateTarget, setDeactivateTarget] = useState<BenyRow | null>(null);
    const [deactivationReason, setDeactivationReason] = useState<string>('User Cancelled');
    const [customReason, setCustomReason] = useState<string>('');

    const [isPending, startTransition] = useTransition();

    const itemsPerPage = 10;
    const totalPages = Math.ceil(total / itemsPerPage) || 1;

    const [jumpPage, setJumpPage] = useState(currentPage.toString());

    useEffect(() => {
        setJumpPage(currentPage.toString());
    }, [currentPage]);

    const submitJump = () => {
        const page = parseInt(jumpPage);
        const maxPages = !apiSupported && activeTab === 'pending_activation'
            ? Math.ceil(initialTotal / itemsPerPage)
            : totalPages;

        if (!isNaN(page) && page >= 1 && page <= maxPages) {
            handlePageChange(page);
        } else {
            setJumpPage(currentPage.toString());
        }
    };

    const loadData = (tab: typeof TABS[number]['id'], page: number) => {
        if (!apiSupported && tab === 'pending_activation') {
            // Local fallback handling
            return;
        }

        startTransition(async () => {
            const res = await getBenySubscriptionsAction(tab, page, itemsPerPage);
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
                    deactivatedAt: b.deactivated_at ? new Date(b.deactivated_at).toLocaleString('en-AU') : null,
                    deactivationReason: b.deactivation_reason || null
                }));
                setRows(mapped);
                setTotal(res.data.total);
                setApiSupported(true);
            } else {
                // If it is 404/405 route not found, flag it to use fallback config on first tab
                if (res.status === 404 || res.status === 400 || res.status === 405) {
                    console.warn('Backend does not support paginated BENY lists endpoint, using fallback.');
                    setApiSupported(false);
                    if (tab === 'pending_activation') {
                        setRows(initialRows);
                        setTotal(initialTotal);
                    } else {
                        setRows([]);
                        setTotal(0);
                    }
                } else {
                    toast.error(res.message);
                }
            }
        });
    };

    const handleTabChange = (tab: typeof TABS[number]['id']) => {
        setActiveTab(tab);
        setCurrentPage(1);
        loadData(tab, 1);
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
        const finalReason = deactivationReason === 'Other' ? customReason : deactivationReason;

        startTransition(async () => {
            const res = await deactivateBenyAction(id, finalReason);
            if (res.ok) {
                setRows((prev) => prev.filter((r) => r.id !== id));
                setTotal((prev) => Math.max(0, prev - 1));
                toast.success(res.message);
            } else {
                toast.error(res.code ? `${res.message} (${res.code})` : res.message);
            }
            setDeactivateTarget(null);
            setDeactivationReason('User Cancelled');
            setCustomReason('');
        });
    };

    // Client-side pagination if api is not supported on backend
    const displayedRows = !apiSupported && activeTab === 'pending_activation'
        ? initialRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : rows;

    const displayedTotal = !apiSupported && activeTab === 'pending_activation'
        ? initialTotal
        : total;

    const computedTotalPages = !apiSupported && activeTab === 'pending_activation'
        ? Math.ceil(initialTotal / itemsPerPage)
        : totalPages;

    const getEmptyStateText = () => {
        switch (activeTab) {
            case 'pending_activation':
                return {
                    title: 'No pending activations',
                    description: 'All BENY subscriptions have been handled. New pending requests will appear here.'
                };
            case 'active':
                return {
                    title: 'No active accounts',
                    description: 'There are currently no active BENY accounts.'
                };
            case 'pending_deactivation':
                return {
                    title: 'No pending deactivations',
                    description: 'All cancelled or unpaid BENY subscriptions have been successfully processed.'
                };
            case 'cancelled':
                return {
                    title: 'No cancelled accounts',
                    description: 'No BENY subscriptions have been cancelled yet.'
                };
        }
    };

    const emptyText = getEmptyStateText();

    return (
        <div className='mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 overflow-x-auto px-4 py-6'>
            <Heading title='BENY Accounts' description='Review, activate, and deactivate manual BENY add-on subscriptions' />

            {listError ? <ListErrorCard error={listError} /> : null}

            {/* Tab navigation */}
            <div className='mb-2 flex border-b border-slr-navy-border gap-2 overflow-x-auto'>
                {TABS.map((t) => {
                    const isActive = activeTab === t.id;
                    
return (
                        <button
                            key={t.id}
                            disabled={isPending}
                            onClick={() => handleTabChange(t.id)}
                            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 uppercase tracking-wide transition-colors shrink-0 ${
                                isActive
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {isPending && (
                <div className='flex items-center justify-center py-12 text-slr-muted'>
                    <Loader2 className='mr-2 h-6 w-6 animate-spin text-primary' />
                    <span>Loading data...</span>
                </div>
            )}

            {!isPending && displayedRows.length === 0 && !listError && (
                <EmptyState
                    icon={activeTab === 'pending_activation' ? UserCheck : UserMinus}
                    title={emptyText.title}
                    description={emptyText.description}
                />
            )}

            {!isPending && displayedRows.length > 0 && !listError && (
                <div className='rounded-md border border-slr-navy-border bg-slr-navy-card'>
                    <div className='overflow-x-auto w-full'>
                        <Table>
                            <TableHeader>
                                <TableRow className='border-slr-navy-border'>
                                    <TableHead className='text-muted-foreground font-medium'>Name</TableHead>
                                    <TableHead className='text-muted-foreground font-medium'>Email</TableHead>
                                    <TableHead className='text-muted-foreground font-medium'>Phone</TableHead>
                                    
                                    {activeTab === 'pending_activation' && (
                                        <TableHead className='text-muted-foreground font-medium'>Requested At</TableHead>
                                    )}
                                    {activeTab === 'active' && (
                                        <>
                                            <TableHead className='text-muted-foreground font-medium'>Activated At</TableHead>
                                            <TableHead className='text-muted-foreground font-medium'>Access Ends At</TableHead>
                                        </>
                                    )}
                                    {activeTab === 'pending_deactivation' && (
                                        <TableHead className='text-muted-foreground font-medium'>Access Ends At</TableHead>
                                    )}
                                    {activeTab === 'cancelled' && (
                                        <>
                                            <TableHead className='text-muted-foreground font-medium'>Deactivated At</TableHead>
                                            <TableHead className='text-muted-foreground font-medium'>Reason</TableHead>
                                        </>
                                    )}
                                    
                                    {(activeTab === 'pending_activation' || activeTab === 'pending_deactivation' || activeTab === 'active') && (
                                        <TableHead className='text-muted-foreground font-medium text-right'>Action</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayedRows.map((row) => (
                                    <TableRow key={row.id} className='border-slr-navy-border hover:bg-slr-navy/40'>
                                        <TableCell className='font-medium text-white'>{row.name}</TableCell>
                                        <TableCell className='text-slate-300'>{row.email}</TableCell>
                                        <TableCell className='text-slate-300'>{row.phone}</TableCell>
                                        
                                        {activeTab === 'pending_activation' && (
                                            <TableCell className='text-slate-300'>{row.requestedAt}</TableCell>
                                        )}
                                        {activeTab === 'active' && (
                                            <>
                                                <TableCell className='text-slate-300'>{row.activatedAt || '-'}</TableCell>
                                                <TableCell className='text-slate-300'>
                                                    {row.accessEndsAt ? (
                                                        <span className='text-red-400 font-medium'>Deactivate on {row.accessEndsAt}</span>
                                                    ) : (
                                                        <span className='text-slate-400'>Ongoing</span>
                                                    )}
                                                </TableCell>
                                            </>
                                        )}
                                        {activeTab === 'pending_deactivation' && (
                                            <TableCell className='text-slate-300'>
                                                <span className='text-red-400 font-medium'>{row.accessEndsAt || 'Immediately'}</span>
                                            </TableCell>
                                        )}
                                        {activeTab === 'cancelled' && (
                                            <>
                                                <TableCell className='text-slate-300'>{row.deactivatedAt || '-'}</TableCell>
                                                <TableCell className='text-slate-400 italic max-w-xs truncate' title={row.deactivationReason || ''}>
                                                    {row.deactivationReason || '-'}
                                                </TableCell>
                                            </>
                                        )}

                                        {(activeTab === 'pending_activation' || activeTab === 'pending_deactivation' || activeTab === 'active') && (
                                            <TableCell className='text-right'>
                                                {activeTab === 'pending_activation' && (
                                                    <Button
                                                        onClick={() => setActivateTarget(row)}
                                                        className='font-semibold'
                                                        size='sm'
                                                    >
                                                        <UserCheck className='mr-2 h-4 w-4' />
                                                        Activate
                                                    </Button>
                                                )}
                                                {(activeTab === 'active' || activeTab === 'pending_deactivation') && (
                                                    <Button
                                                        onClick={() => setDeactivateTarget(row)}
                                                        variant='destructive'
                                                        className='hover:bg-red-600/80 font-medium'
                                                        size='sm'
                                                    >
                                                        <UserMinus className='mr-2 h-4 w-4' />
                                                        Deactivate
                                                    </Button>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {displayedTotal > itemsPerPage && (
                        <div className='mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slr-navy-border p-4 bg-slr-navy-deep/20 rounded-b-md'>
                            <div className='text-muted-foreground text-sm'>
                                Total: <span className='text-foreground font-medium text-white'>{displayedTotal}</span> entries
                            </div>

                            <div className='flex items-center gap-4'>
                                {/* Jump to Page Input */}
                                <div className='flex items-center gap-2'>
                                    <span className='text-muted-foreground text-sm'>Jump to</span>
                                    <Input
                                        type='number'
                                        value={jumpPage}
                                        onChange={(e) => setJumpPage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && submitJump()}
                                        onBlur={submitJump}
                                        className='h-8 w-14 [appearance:textfield] px-2 text-center bg-slr-navy border-slr-navy-border text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                                    />
                                    <span className='text-muted-foreground text-sm'>of {computedTotalPages}</span>
                                </div>

                                <div className='flex items-center gap-1'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        className='h-8 w-8 p-0 border-slr-navy-border hover:bg-slr-navy text-white'
                                        disabled={currentPage === 1 || isPending}
                                        onClick={() => handlePageChange(currentPage - 1)}>
                                        <ChevronLeft className='h-4 w-4' />
                                    </Button>

                                    {getPaginationRange(currentPage, computedTotalPages).map((p, idx) => (
                                        <Button
                                            key={idx}
                                            size='sm'
                                            className='h-8 w-8 p-0 border-slr-navy-border'
                                            variant={p === currentPage ? 'default' : 'outline'}
                                            disabled={p === '...' || isPending}
                                            onClick={() => typeof p === 'number' && handlePageChange(p)}>
                                            {p}
                                        </Button>
                                    ))}

                                    <Button
                                        variant='outline'
                                        size='sm'
                                        className='h-8 w-8 p-0 border-slr-navy-border hover:bg-slr-navy text-white'
                                        disabled={currentPage === computedTotalPages || isPending}
                                        onClick={() => handlePageChange(currentPage + 1)}>
                                        <ChevronRight className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Confirm Activation dialog */}
            <ConfirmDialog
                open={!!activateTarget}
                onOpenChange={(open) => {
                    if (!open) setActivateTarget(null);
                }}
                className='slr-admin dark'
                title='Activate BENY Add-on?'
                confirmText={isPending ? 'Activating...' : 'Yes, Activate'}
                cancelBtnText='Cancel'
                isLoading={isPending}
                handleConfirm={confirmActivate}
                desc={`This will mark the BENY addon for ${activateTarget?.name} as ACTIVE. Confirm after manually adding the member details into the third-party BENY dashboard.`}
            />

            {/* Confirm Deactivation dialog */}
            <ConfirmDialog
                open={!!deactivateTarget}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeactivateTarget(null);
                        setDeactivationReason('User Cancelled');
                        setCustomReason('');
                    }
                }}
                className='slr-admin dark'
                title='Mark as Deactivated?'
                confirmText={isPending ? 'Deactivating...' : 'Confirm Deactivation'}
                cancelBtnText='Cancel'
                destructive
                isLoading={isPending}
                handleConfirm={confirmDeactivate}
                desc={`Are you sure you want to mark the BENY addon for ${deactivateTarget?.name} as cancelled? Confirm this only after manually disabling the login/discounts on the BENY vendor dashboard.`}
            >
                <div className='mt-4 space-y-3 text-start'>
                    <label className='block text-xs font-semibold uppercase text-slate-400'>
                        Deactivation Reason
                    </label>
                    <select
                        value={deactivationReason}
                        onChange={(e) => setDeactivationReason(e.target.value)}
                        className='w-full rounded-lg border border-slr-navy-border bg-slr-navy-card p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary'
                    >
                        <option value='User Cancelled'>User Cancelled</option>
                        <option value='Payment Failed'>Payment Failed</option>
                        <option value='Admin Refund'>Admin Refund</option>
                        <option value='Other'>Other...</option>
                    </select>

                    {deactivationReason === 'Other' && (
                        <input
                            type='text'
                            placeholder='Specify custom reason...'
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            className='w-full rounded-lg border border-slr-navy-border bg-slr-navy-card p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary'
                        />
                    )}
                </div>
            </ConfirmDialog>
        </div>
    );
}