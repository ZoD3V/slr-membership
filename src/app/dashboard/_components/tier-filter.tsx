'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TierGroup } from '@/types/member';

export type TierFilterValue = TierGroup | 'all';

const OPTIONS: { value: TierFilterValue; label: string }[] = [
    { value: 'all', label: 'All tiers' },
    { value: 'visitor', label: 'Visitor' },
    { value: 'red', label: 'SLR Red' },
    { value: 'blue', label: 'SLR Blue' }
];

export function TierFilter({ value, onChange }: { value: TierFilterValue; onChange: (next: TierFilterValue) => void }) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as TierFilterValue)}>
            <SelectTrigger className='w-44' aria-label='Filter by tier'>
                <SelectValue placeholder='All tiers' />
            </SelectTrigger>
            <SelectContent className='dashboard-theme dark'>
                {OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
