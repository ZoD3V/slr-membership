'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CONSENT_LABELS, CONSENT_TYPES } from '@/lib/api/resources/consents';

const ANY = 'any';

export function ConsentFilters() {
    const router = useRouter();
    const params = useSearchParams();

    const consentType = params.get('consent_type') ?? ANY;
    const agreed = params.get('agreed') ?? ANY;
    const member = params.get('member') ?? '';

    const apply = (patch: Record<string, string>) => {
        const next = new URLSearchParams(params.toString());
        for (const [key, value] of Object.entries(patch)) {
            if (!value || value === ANY) next.delete(key);
            else next.set(key, value);
        }
        // Any filter change invalidates the current page offset.
        next.delete('page');
        router.push(`/dashboard/consents${next.toString() ? `?${next}` : ''}`);
    };

    return (
        <form
            className='flex flex-wrap items-end gap-3'
            onSubmit={(event) => {
                event.preventDefault();
                const value = new FormData(event.currentTarget).get('member');
                apply({ member: typeof value === 'string' ? value.trim() : '' });
            }}>
            <div className='grid gap-1.5'>
                <label className='text-muted-foreground text-xs tracking-wide uppercase'>Consent type</label>
                <Select value={consentType} onValueChange={(value) => apply({ consent_type: value })}>
                    <SelectTrigger className='w-56'>
                        <SelectValue placeholder='All types' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ANY}>All types</SelectItem>
                        {CONSENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                                {CONSENT_LABELS[type]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className='grid gap-1.5'>
                <label className='text-muted-foreground text-xs tracking-wide uppercase'>Status</label>
                <Select value={agreed} onValueChange={(value) => apply({ agreed: value })}>
                    <SelectTrigger className='w-40'>
                        <SelectValue placeholder='Any' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ANY}>Any</SelectItem>
                        <SelectItem value='true'>Agreed</SelectItem>
                        <SelectItem value='false'>Declined</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className='grid gap-1.5'>
                <label className='text-muted-foreground text-xs tracking-wide uppercase' htmlFor='member'>
                    Member
                </label>
                <Input
                    id='member'
                    name='member'
                    type='search'
                    // Remount on change so Clear actually empties the field.
                    key={member}
                    defaultValue={member}
                    placeholder='Email, name, or user ID'
                    className='w-72'
                />
            </div>

            <Button type='submit' variant='secondary'>
                Search
            </Button>
            {consentType !== ANY || agreed !== ANY || member ? (
                <Button type='button' variant='ghost' onClick={() => router.push('/dashboard/consents')}>
                    Clear
                </Button>
            ) : null}
        </form>
    );
}
