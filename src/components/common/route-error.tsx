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

    secondaryAction?: ReactNode;

    className?: string;
};

const RouteError = ({
    error,
    reset,
    title = 'Something went wrong',
    description = 'We couldn’t load this page. This is usually temporary — try again in a moment.',
    secondaryAction,
    className = 'mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-16 md:px-6'
}: RouteErrorProps) => {
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
