'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import EmptyState from '@/components/common/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Heading from '@/components/ui/heading';
import type { DrawCsvHistoryItem, DrawCsvTier } from '@/lib/api/resources/admin';
import { cn } from '@/lib/utils';

import { generateDrawCsvAction } from './actions';
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet, Loader2Icon, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const TIER_STYLE: Record<DrawCsvTier, string> = {
    visitor: 'border-[#A0B4D259] text-slr-dim',
    red: 'border-[#C8152E66] text-[#E88888]',
    blue: 'border-[#2878E84D] text-[#2878E8]'
};

function formatDate(value: string): string {
    if (!value) return '-';
    const d = new Date(value);

    return Number.isNaN(d.getTime()) ? value : d.toLocaleString('en-AU');
}

function getPaginationRange(currentPage: number, totalPages: number) {
    const range: (number | '...')[] = [];

    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) range.push(i);
        
return range;
    }

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
        start = 1;
        end = 5;
    } else if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
        end = totalPages;
    }

    for (let i = start; i <= end; i++) {
        range.push(i);
    }

    return range;
}

interface DrawExportsClientProps {
    initialHistory: DrawCsvHistoryItem[];
    failed: boolean;
}

export function DrawExportsClient({ initialHistory, failed }: DrawExportsClientProps) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const [currentPage, setCurrentPage] = useState(1);
    const [jumpPage, setJumpPage] = useState(currentPage.toString());
    const itemsPerPage = 10;
    const totalItems = initialHistory.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    useEffect(() => {
        setJumpPage(currentPage.toString());
    }, [currentPage]);

    const submitJump = () => {
        const page = parseInt(jumpPage);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        } else {
            setJumpPage(currentPage.toString());
        }
    };

    const displayedHistory = initialHistory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const generate = () => {
        startTransition(async () => {
            const res = await generateDrawCsvAction();
            if (res.ok) {
                const total = res.data.files.reduce((sum, f) => sum + (f.row_count ?? 0), 0);
                toast.success(`${res.data.files.length} CSV files generated — ${total} rows total.`);
                setCurrentPage(1);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        });
    };

    return (
        <div className='flex w-full flex-col gap-6 px-4 py-6'>
            <div className='flex flex-wrap items-start justify-between gap-4'>
                <Heading
                    title='Draw Exports'
                    description='Generate the 3 TPAL entry CSVs (Visitor, Red, Blue), then upload them to randomdraws.com/au to run the draw.'
                />
                <Button onClick={generate} disabled={pending}>
                    {pending ? <Loader2Icon className='mr-2 size-4 animate-spin' /> : <RefreshCw className='mr-2 size-4' />}
                    Generate CSVs
                </Button>
            </div>

            {failed ? (
                <EmptyState
                    icon={FileSpreadsheet}
                    title='Export History Unavailable'
                    description='We couldn’t load the CSV generation history right now. Please try again.'
                />
            ) : initialHistory.length === 0 ? (
                <EmptyState
                    icon={FileSpreadsheet}
                    title='No exports yet'
                    description='Generate the entry CSVs to start a draw. Each run produces one file per tier, containing only members with entries in the current cycle.'
                />
            ) : (
                <div className='rounded-xl border border-white/10 bg-white/5 p-6'>
                    {/* The API re-signs each download_url on every read, so links are valid ~1h from page load. */}
                    <p className='text-slr-dim mb-4 text-xs'>
                        Download links stay valid for about an hour — reload this page if one expires. Upload these to
                        randomdraws.com/au to run the draw, then record the winners.
                    </p>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='text-slr-dim border-b border-white/10 text-left text-xs uppercase'>
                                    <th className='px-3 py-3 font-medium'>Tier</th>
                                    <th className='px-3 py-3 font-medium'>Filename</th>
                                    <th className='px-3 py-3 font-medium'>Rows</th>
                                    <th className='px-3 py-3 font-medium'>Generated</th>
                                    <th className='px-3 py-3 text-right font-medium'>Download</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-white/5'>
                                {displayedHistory.map((row) => (
                                    <tr key={row.id} className='transition-colors hover:bg-white/5'>
                                        <td className='px-3 py-4'>
                                            <span
                                                className={cn(
                                                    'rounded-md border px-2 py-0.5 text-xs font-semibold uppercase',
                                                    TIER_STYLE[row.tier]
                                                )}>
                                                {row.tier || '-'}
                                            </span>
                                        </td>
                                        <td className='px-3 py-4 font-medium text-white'>{row.filename || '-'}</td>
                                        <td className='px-3 py-4 text-white/90 tabular-nums'>{row.row_count ?? 0}</td>
                                        <td className='px-3 py-4 text-white/60'>{formatDate(row.generated_at)}</td>
                                        <td className='px-3 py-4 text-right'>
                                            {row.download_url ? (
                                                <Button variant='ghost' size='sm' className='h-8' asChild>
                                                    <a href={row.download_url} download>
                                                        <Download className='mr-1.5 size-3.5' />
                                                        CSV
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className='text-slr-dim'>-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalItems > itemsPerPage && (
                        <div className='mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4'>
                            <div className='text-muted-foreground text-sm'>
                                Total: <span className='text-foreground font-medium text-white'>{totalItems}</span> entries
                            </div>

                            <div className='flex items-center gap-4'>
                                {/* Jump to Page Input */}
                                <div className='flex items-center gap-2'>
                                    <span className='text-muted-foreground text-sm'>Jump to</span>
                                    <Input
                                        type='number'
                                        value={jumpPage}
                                        onChange={(e) => setJumpPage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && submitJump()}
                                        onBlur={submitJump}
                                        className='h-8 w-14 [appearance:textfield] px-2 text-center bg-slr-navy border-slr-navy-border text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                                    />
                                    <span className='text-muted-foreground text-sm'>of {totalPages}</span>
                                </div>

                                <div className='flex items-center gap-1'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        className='h-8 w-8 p-0 border-white/10 hover:bg-white/5 text-white'
                                        disabled={currentPage === 1 || pending}
                                        onClick={() => setCurrentPage(currentPage - 1)}>
                                        <ChevronLeft className='h-4 w-4' />
                                    </Button>

                                    {getPaginationRange(currentPage, totalPages).map((p, idx) => (
                                        <Button
                                            key={idx}
                                            size='sm'
                                            className='h-8 w-8 p-0 border-white/10'
                                            variant={p === currentPage ? 'default' : 'outline'}
                                            disabled={p === '...' || pending}
                                            onClick={() => typeof p === 'number' && setCurrentPage(p)}>
                                            {p}
                                        </Button>
                                    ))}

                                    <Button
                                        variant='outline'
                                        size='sm'
                                        className='h-8 w-8 p-0 border-white/10 hover:bg-white/5 text-white'
                                        disabled={currentPage === totalPages || pending}
                                        onClick={() => setCurrentPage(currentPage + 1)}>
                                        <ChevronRight className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
