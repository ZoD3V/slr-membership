'use client';

import { useEffect, useMemo, useState } from 'react';

import { type Column, DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AU_STATES } from '@/constant/au-states';
import { cn } from '@/lib/utils';
import type { TierGroup } from '@/types/member';

import { type WinnerMemberOption, searchWinnerMembersAction } from '../actions';
import { Search } from 'lucide-react';

const STATUS_STYLE: Record<string, string> = {
    active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    suspended: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    deactivated: 'border-slate-500/40 bg-slate-500/10 text-slate-300'
};

const ALL_STATES = 'all';

export function MemberPickerDialog({
    open,
    onOpenChange,
    tier,
    poolLabel,
    onSelect
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tier: TierGroup;

    poolLabel: string;
    onSelect: (member: WinnerMemberOption) => void;
}) {
    const [state, setState] = useState<string>(ALL_STATES);
    const [search, setSearch] = useState('');
    const [rows, setRows] = useState<WinnerMemberOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        let active = true;
        setIsLoading(true);

        const timer = setTimeout(async () => {
            const res = await searchWinnerMembersAction({
                tier,
                state: state === ALL_STATES ? undefined : state,
                search
            });

            if (!active) return;

            if (res.ok) {
                setRows(res.data);
                setError(null);
            } else {
                setRows([]);
                setError(res.message);
            }

            setIsLoading(false);
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [open, tier, state, search]);

    const columns: Column[] = useMemo(
        () => [
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
                        {row.status}
                    </span>
                )
            },
            {
                key: 'pick',
                label: '',
                render: (row) => (
                    <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        onClick={() => {
                            onSelect(row as WinnerMemberOption);
                            onOpenChange(false);
                        }}>
                        Select
                    </Button>
                )
            }
        ],
        [onSelect, onOpenChange]
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='dashboard-theme dark sm:max-w-4xl'>
                <DialogHeader>
                    <DialogTitle className='text-white'>Assign Member</DialogTitle>
                    <DialogDescription>Draw pool: {poolLabel}</DialogDescription>
                </DialogHeader>

                <div className='flex flex-col gap-3 sm:flex-row'>
                    <div className='relative flex-1'>
                        <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                        <Input
                            placeholder='Search name or email...'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className='pl-10'
                        />
                    </div>
                    <Select value={state} onValueChange={setState}>
                        <SelectTrigger className='w-full sm:w-56' aria-label='Filter by state'>
                            <SelectValue placeholder='All states' />
                        </SelectTrigger>
                        <SelectContent className='dashboard-theme dark'>
                            <SelectItem value={ALL_STATES}>All states</SelectItem>
                            {AU_STATES.map((s) => (
                                <SelectItem key={s.code} value={s.code}>
                                    {s.code} — {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className='max-h-[60vh] overflow-y-auto'>
                    <DataTable
                        isSearch={false}
                        searchKey='name'
                        columns={columns}
                        data={rows}
                        isLoading={isLoading}
                        itemsPerPage={8}
                        emptyMessage={
                            error ??
                            'No eligible members in this draw pool. Only active accounts are listed — members still pending payment, suspended, or who have already won this cycle are excluded.'
                        }
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
