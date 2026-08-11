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
import type { RecipientOption } from '@/types/member';

import { searchRecipientsAction } from '../actions';
import { MAX_SEND_RECIPIENTS } from '../seed';
import { Search } from 'lucide-react';

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
    const [rows, setRows] = useState<RecipientOption[]>([]);
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
            const res = await searchRecipientsAction(search);
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
    }, [open, search]);

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
            { key: 'email', label: 'Email' }
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
                        onChange={(e) => setSearch(e.target.value)}
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
                        itemsPerPage={10}
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
