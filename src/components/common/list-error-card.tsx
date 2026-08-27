import { TriangleAlert } from 'lucide-react';

export type ListError = {
    status: number;
    message: string;
    code: string | null;
    requestId: string | null;
};

export function ListErrorCard({
    error,
    title,
    description
}: {
    error: ListError;
    title: string;
    description?: string;
}) {
    return (
        <div className='rounded-xl border border-red-500/40 bg-red-500/5 p-4'>
            <div className='flex items-center gap-2 text-red-400'>
                <TriangleAlert className='h-4 w-4' />
                <p className='text-sm font-semibold'>{title}</p>
            </div>
            {description ? <p className='text-muted-foreground mt-1 text-xs'>{description}</p> : null}
            <dl className='mt-3 grid grid-cols-1 gap-1 font-mono text-xs sm:grid-cols-2'>
                <div className='flex gap-2'>
                    <dt className='text-muted-foreground'>status</dt>
                    <dd className='text-white select-all'>{error.status}</dd>
                </div>
                <div className='flex gap-2'>
                    <dt className='text-muted-foreground'>code</dt>
                    <dd className='text-white select-all'>{error.code ?? '-'}</dd>
                </div>
                <div className='flex gap-2 sm:col-span-2'>
                    <dt className='text-muted-foreground'>message</dt>
                    <dd className='text-white select-all'>{error.message}</dd>
                </div>
                <div className='flex gap-2 sm:col-span-2'>
                    <dt className='text-muted-foreground'>requestId</dt>
                    <dd className='text-white select-all'>{error.requestId ?? '-'}</dd>
                </div>
            </dl>
        </div>
    );
}
