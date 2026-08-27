'use client';

import Link from 'next/link';

import RouteError from '@/components/common/route-error';

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
