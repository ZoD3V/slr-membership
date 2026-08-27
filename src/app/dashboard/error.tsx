'use client';

import Link from 'next/link';

import RouteError from '@/components/common/route-error';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <RouteError
            error={error}
            reset={reset}
            title='This page didn’t load'
            description='The admin API didn’t respond. Retry, or head back to the overview.'
            secondaryAction={
                <Link href='/dashboard' className='text-slr-dim text-sm transition-colors hover:text-white'>
                    Back to overview
                </Link>
            }
        />
    );
}
