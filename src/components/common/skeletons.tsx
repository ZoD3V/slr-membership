import { Skeleton } from '@/components/ui/skeleton';

// Shared skeleton variants streamed as Suspense fallbacks (loading.tsx) so each
// route shows a shape that matches its real layout instead of a blank/spinner.
// bg is overridden to a light tint — the shadcn default (bg-primary/10) is too
// faint on the dark navy surfaces.
const SK = 'bg-white/[0.06]';
const PAGE = 'mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8';

function PageHeading() {
    return (
        <div className='space-y-2'>
            <Skeleton className={`${SK} h-7 w-48`} />
            <Skeleton className={`${SK} h-4 w-64`} />
        </div>
    );
}

/** Overview: greeting → two summary cards → quick actions → a card grid. (/member, /dashboard) */
export function DashboardHomeSkeleton() {
    return (
        <div className={PAGE}>
            <PageHeading />
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <Skeleton className={`${SK} h-40 rounded-xl lg:col-span-1`} />
                <Skeleton className={`${SK} h-40 rounded-xl sm:col-span-2`} />
            </div>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className={`${SK} h-20 rounded-xl`} />
                ))}
            </div>
            <Skeleton className={`${SK} h-6 w-40`} />
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className={`${SK} h-56 rounded-2xl`} />
                ))}
            </div>
        </div>
    );
}

/** Admin overview: heading → 4 stat cards → 2 breakdown cards → footnote. (/dashboard) */
export function AdminDashboardSkeleton() {
    return (
        <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6'>
            <div className='space-y-2'>
                <Skeleton className={`${SK} h-8 w-40`} />
                <Skeleton className={`${SK} h-4 w-56`} />
            </div>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className={`${SK} h-28 rounded-xl`} />
                ))}
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
                {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className={`${SK} h-48 rounded-xl`} />
                ))}
            </div>
            <Skeleton className={`${SK} h-4 w-72`} />
        </div>
    );
}

/**
 * Admin list: heading → search → bordered table with rows.
 * Wrapper must track DashboardPageShell (full width, gap-4) or the page jumps on hydration.
 */
export function TableSkeleton() {
    return (
        <div className='flex h-full w-full flex-1 flex-col gap-4 px-4 py-6 md:px-6'>
            <div className='flex items-center justify-between'>
                <PageHeading />
                <Skeleton className={`${SK} h-10 w-32 rounded-xl`} />
            </div>
            <Skeleton className={`${SK} h-10 w-full rounded-lg`} />
            <div className='border-slr-navy-border overflow-hidden rounded-xl border'>
                <Skeleton className={`${SK} h-12 w-full rounded-none`} />
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className='border-slr-navy-border/60 border-t px-4 py-3.5'>
                        <Skeleton className={`${SK} h-5 w-full`} />
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Member browse: search + filter chips → responsive card grid. */
export function CardGridSkeleton() {
    return (
        <div className={PAGE}>
            <PageHeading />
            <Skeleton className={`${SK} h-11 w-full rounded-lg`} />
            <div className='flex flex-wrap gap-2.5'>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className={`${SK} h-9 w-24 rounded-full`} />
                ))}
            </div>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className={`${SK} h-64 rounded-2xl`} />
                ))}
            </div>
        </div>
    );
}

/** Detail: back + header → two-column body (media/card + text). */
export function DetailSkeleton() {
    return (
        <div className={PAGE}>
            <Skeleton className={`${SK} h-9 w-28 rounded-lg`} />
            <div className='grid gap-6 lg:grid-cols-2'>
                <Skeleton className={`${SK} aspect-video w-full rounded-2xl`} />
                <div className='space-y-4'>
                    <Skeleton className={`${SK} h-8 w-3/4`} />
                    <Skeleton className={`${SK} h-5 w-1/2`} />
                    <Skeleton className={`${SK} h-24 w-full rounded-xl`} />
                    <Skeleton className={`${SK} h-11 w-40 rounded-xl`} />
                </div>
            </div>
        </div>
    );
}

/** Board/list: heading → stacked rows/cards. */
export function BoardListSkeleton() {
    return (
        <div className={PAGE}>
            <PageHeading />
            <div className='space-y-3'>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className={`${SK} h-24 w-full rounded-xl`} />
                ))}
            </div>
        </div>
    );
}
