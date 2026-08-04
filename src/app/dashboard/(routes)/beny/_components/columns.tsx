import type { Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';

import type { BenyRow } from '../beny-client';
import type { BenyTab } from './tabs';
import { UserCheck, UserMinus } from 'lucide-react';

type Handlers = {
    onActivate: (row: BenyRow) => void;
    onDeactivate: (row: BenyRow) => void;
};

/**
 * Whether the paid period has actually elapsed. A missing date means the
 * subscription lapsed rather than being cancelled mid-period, so access ends now.
 */
function isAccessEnded(iso: string | null | undefined): boolean {
    if (!iso) return true;
    const ends = new Date(iso).getTime();

    return Number.isNaN(ends) ? true : ends <= Date.now();
}

// Columns differ per tab — a cancelled row has no action and carries a reason,
// an active row carries an access-end date. Built per tab rather than as one
// static array so empty cells never appear.
export function benyColumnsFor(tab: BenyTab, { onActivate, onDeactivate }: Handlers): Column[] {
    const base: Column[] = [
        { key: 'name', label: 'Name', render: (row) => <span className='font-medium text-white'>{row.name}</span> },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' }
    ];

    if (tab === 'pending_activation') {
        base.push({ key: 'requestedAt', label: 'Requested At' });
    }

    if (tab === 'active') {
        base.push(
            { key: 'activatedAt', label: 'Activated At', render: (row) => row.activatedAt || '-' }
        );
    }

    if (tab === 'pending_deactivation') {
        base.push({ key: 'accessEndsAt', label: 'Deactivate On' });
    }

    if (tab === 'cancelled') {
        base.push(
            { key: 'deactivatedAt', label: 'Deactivated At', render: (row) => row.deactivatedAt || '-' },
            { key: 'deactivationReason', label: 'Reason', render: (row) => row.deactivationReason || '-' }
        );
    }

    // `rowAction` rather than `action` — the latter is a DataTable magic key that
    // renders the generic Edit/Delete dropdown, which BENY does not use.
    if (tab === 'pending_activation') {
        base.push({
            key: 'rowAction',
            label: 'Action',
            render: (row) => (
                <Button size='sm' className='font-semibold' onClick={() => onActivate(row as BenyRow)}>
                    <UserCheck className='mr-2 h-4 w-4' />
                    Activate
                </Button>
            )
        });
    }

    // Only pending_deactivation is actionable. Moving active → pending_deactivation
    // is driven by the member cancelling, a failed payment, or a Stripe refund
    // (PRD §2.3) — never by an admin click, so the Active tab stays read-only.
    if (tab === 'pending_deactivation') {
        base.push({
            key: 'rowAction',
            label: 'Action',
            render: (row) => {
                const due = isAccessEnded(row.accessEndsAtIso);

                return (
                    <span
                        title={!due ? 'Cannot deactivate until paid access ends.' : 'Record that you have revoked this account in the BENY portal.'}>
                        <Button
                            size='sm'
                            variant='destructive'
                            disabled={!due}
                            className='font-medium hover:bg-red-600/80 disabled:opacity-50'
                            onClick={() => onDeactivate(row as BenyRow)}>
                            <UserMinus className='mr-2 h-4 w-4' />
                            Mark as Deactivated
                        </Button>
                    </span>
                );
            }
        });
    }

    return base;
}
