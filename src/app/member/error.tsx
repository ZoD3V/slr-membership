'use client';

import Link from 'next/link';

import RouteError from '@/components/common/route-error';

// Member-area segment boundary: an unhandled throw in any /member page swaps only
// this slot, so the sidebar and header stay usable and the member can navigate
// away instead of hitting a blank screen.
export default function MemberError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <RouteError
            error={error}
            reset={reset}
            title='This page didn’t load'
            description='We couldn’t reach your membership data right now. Nothing is lost — try again in a moment.'
            secondaryAction={
                <Link href='/member' className='text-slr-dim text-sm transition-colors hover:text-white'>
                    Back to dashboard
                </Link>
            }
        />
    );
}
