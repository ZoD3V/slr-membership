'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type StatusFilterValue = string;

const KNOWN_LABELS: Record<string, string> = {
    active: 'Active',
    pending_payment: 'Pending payment',
    suspended: 'Suspended',
    deactivated: 'Deactivated'
};

function labelFor(status: string): string {
    if (KNOWN_LABELS[status]) return KNOWN_LABELS[status];

    const spaced = status.replace(/_/g, ' ');

    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

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
