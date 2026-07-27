'use client';

import { type ReactNode, useEffect } from 'react';

import EmptyState from '@/components/common/empty-state';
import { goldButtonStyle } from '@/lib/styles';

import { AlertTriangle, RotateCw } from 'lucide-react';

type RouteErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
    title?: string;
    description?: string;
    /** Secondary link rendered under the retry button (e.g. back to dashboard). */
    secondaryAction?: ReactNode;
    /** Wrapper classes — lets each segment match its own page container. */
    className?: string;
};

/**
 * Segment-level error boundary body. `global-error.tsx` handles the root (and
 * deployment-skew reloads); this one keeps the shell — nav, sidebar — intact and
 * only replaces the failed segment, so a dead API call doesn't blank the app.
 */
const RouteError = ({
    error,
    reset,
    title = 'Something went wrong',
    description = 'We couldn’t load this page. This is usually temporary — try again in a moment.',
    secondaryAction,
    className = 'mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-16 md:px-6'
}: RouteErrorProps) => {
    // Production strips the message from the UI, so keep the real one in the console.
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className={className}>
            <EmptyState
                icon={AlertTriangle}
                title={title}
                description={description}
                action={
                    <div className='flex flex-col items-center gap-3'>
                        <button
                            type='button'
                            onClick={() => reset()}
                            style={goldButtonStyle}
                            className='flex h-11 min-w-44 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold uppercase transition-opacity hover:opacity-90'>
                            <RotateCw className='size-4' /> Try again
                        </button>
                        {secondaryAction}
                        {error.digest ? (
                            <p className='text-slr-dim font-mono text-[10px] tracking-wider'>
                                Reference: {error.digest}
                            </p>
                        ) : null}
                    </div>
                }
            />
        </div>
    );
};

export default RouteError;
