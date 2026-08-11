'use client';

import { useEffect, useMemo, useState } from 'react';

import { type Column, DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { RecipientOption } from '@/types/member';

import { searchRecipientsAction } from '../actions';
import { MAX_SEND_RECIPIENTS, RECIPIENT_PAGE_SIZE } from '../seed';
import { Search } from 'lucide-react';

const STATUS_STYLE: Record<string, string> = {
    active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    pending_payment: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    suspended: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    deactivated: 'border-slate-500/40 bg-slate-500/10 text-slate-300'
};

export function RecipientPickerDialog({
    open,
    onOpenChange,
    selected,
    onConfirm
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selected: RecipientOption[];
    onConfirm: (next: RecipientOption[]) => void;
}) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState<RecipientOption[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draft, setDraft] = useState<RecipientOption[]>(selected);

    useEffect(() => {
        if (open) setDraft(selected);
    }, [open, selected]);

    // Debounced so typing a name doesn't fire a request per keystroke.
    useEffect(() => {
        if (!open) return;

        let active = true;
        setIsLoading(true);

        const timer = setTimeout(async () => {
            const res = await searchRecipientsAction(search, page);
            if (!active) return;

            if (res.ok) {
                setRows(res.data.rows);
                setTotal(res.data.total);
                setError(null);

                // Repair any placeholder already in the draft. A resend seeds a
                // recipient from a log row that may carry no email; as soon as
                // a page contains that member, fill in the real record. Doing
                // it here rather than on click keeps the checkbox a plain
                // toggle — repairing on click made the first click look dead.
                setDraft((current) =>
                    current.map((entry) => {
                        if (entry.email) return entry;
                        const match = res.data.rows.find((r) => r.user_id === entry.user_id);

                        return match ?? entry;
                    })
                );
            } else {
                setRows([]);
                setTotal(0);
                setError(res.message);
            }

            setIsLoading(false);
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [open, search, page]);

    const draftIds = useMemo(() => new Set(draft.map((d) => d.user_id)), [draft]);
    const isFull = draft.length >= MAX_SEND_RECIPIENTS;

    const columns: Column[] = useMemo(() => {
        const toggle = (row: RecipientOption) => {
            setDraft((current) => {
                if (current.some((c) => c.user_id === row.user_id)) {
                    return current.filter((c) => c.user_id !== row.user_id);
                }
                if (current.length >= MAX_SEND_RECIPIENTS) return current;

                return [...current, row];
            });
        };

        return [
            {
                key: 'pick',
                label: '',
                render: (row) => {
                    const checked = draftIds.has(row.user_id);

                    return (
                        <Checkbox
                            checked={checked}
                            // A full selection must not silently swallow a click.
                            disabled={!checked && isFull}
                            onCheckedChange={() => toggle(row as RecipientOption)}
                            aria-label={`Select ${row.email}`}
                        />
                    );
                }
            },
            { key: 'name', label: 'Name', render: (row) => <span className='font-medium text-white'>{row.name}</span> },
            { key: 'email', label: 'Email' },
            {
                key: 'status',
                label: 'Status',
                render: (row) => (
                    <span
                        className={cn(
                            'rounded-md border px-2 py-0.5 text-xs font-semibold uppercase',
                            STATUS_STYLE[row.status] ?? 'border-slr-navy-border bg-slr-navy-card text-slr-dim'
                        )}>
                        {row.status || '—'}
                    </span>
                )
            }
        ];
    }, [draftIds, isFull]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='dashboard-theme dark sm:max-w-3xl'>
                <DialogHeader>
                    <DialogTitle className='text-white'>Choose recipients</DialogTitle>
                    <DialogDescription>
                        {draft.length} of {MAX_SEND_RECIPIENTS} selected
                        {isFull ? ' — the API rejects more than 100 recipients in one send.' : ''}
                    </DialogDescription>
                </DialogHeader>

                <div className='relative'>
                    <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                    <Input
                        placeholder='Search name or email...'
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className='pl-10'
                    />
                </div>

                <div className='max-h-[55vh] overflow-y-auto'>
                    <DataTable
                        isSearch={false}
                        searchKey='name'
                        columns={columns}
                        data={rows}
                        isLoading={isLoading}
                        serverSide
                        currentPage={page}
                        totalItems={total}
                        itemsPerPage={RECIPIENT_PAGE_SIZE}
                        onPageChange={setPage}
                        emptyMessage={error ?? 'No members matched this search.'}
                    />
                </div>

                <DialogFooter>
                    <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type='button'
                        onClick={() => {
                            onConfirm(draft);
                            onOpenChange(false);
                        }}>
                        Use {draft.length} recipient{draft.length === 1 ? '' : 's'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
