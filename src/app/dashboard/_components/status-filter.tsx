'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type StatusFilterValue = string; // 'all' | a lowercase status from the API

/**
 * Labels for the statuses we know about. `pending_payment` is deliberately in
 * here even though it is absent from the API's own status enum — it is the
 * second-largest group in the live data (registered, never paid), and the
 * AdminMemberListItem DTO already warns that the documented set is incomplete.
 */
const KNOWN_LABELS: Record<string, string> = {
    active: 'Active',
    pending_payment: 'Pending payment',
    suspended: 'Suspended',
    deactivated: 'Deactivated'
};

/** Fallback for a status the backend adds later: 'foo_bar' → 'Foo bar'. */
function labelFor(status: string): string {
    if (KNOWN_LABELS[status]) return KNOWN_LABELS[status];

    const spaced = status.replace(/_/g, ' ');

    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Account-status filter for the Members table. Options come from the statuses
 * actually present in the rows rather than a hardcoded list, so a status the
 * backend starts sending is filterable immediately instead of silently
 * unreachable — and an option never sits there matching nothing.
 *
 * Filtering happens client-side. The list endpoint does accept a `status`
 * query param, but only `active` and `suspended` work: `pending_payment`
 * answers 400 and `deactivated` answers 500 (verified live 2026-08-22, see
 * docs/BACKEND-ISSUES.md). The page already loads every member, so filtering
 * here is both complete and cheaper than a round-trip.
 */
export function StatusFilter({
    value,
    onChange,
    statuses
}: {
    value: StatusFilterValue;
    onChange: (next: StatusFilterValue) => void;
    statuses: string[];
}) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className='w-44' aria-label='Filter by status'>
                <SelectValue placeholder='All statuses' />
            </SelectTrigger>
            <SelectContent className='dashboard-theme dark'>
                <SelectItem value='all'>All statuses</SelectItem>
                {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                        {labelFor(status)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
