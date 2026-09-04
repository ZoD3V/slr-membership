'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { DataTable } from '@/components/data-table';

import { consentColumns } from './_components/consent-columns';
import { ShieldCheck, TriangleAlert } from 'lucide-react';

export type ConsentRow = {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    consent_type: string;
    agreed: boolean;
    version: string | null;
    updated_at: string;
    ip_address: string | null;
};

export type ConsentQuery = { consent_type?: string; agreed?: string; member?: string };

export function ConsentsClient({
    rows,
    page,
    total,
    perPage,
    query,
    failed
}: {
    rows: ConsentRow[];
    page: number;
    total: number;
    perPage: number;
    query: ConsentQuery;
    failed: boolean;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const goToPage = (next: number) => {
        const params = new URLSearchParams();
        if (query.consent_type) params.set('consent_type', query.consent_type);
        if (query.agreed) params.set('agreed', query.agreed);
        if (query.member) params.set('member', query.member);
        if (next > 1) params.set('page', String(next));

        startTransition(() => {
            router.push(`/dashboard/consents${params.toString() ? `?${params}` : ''}`);
        });
    };

    return (
        <DataTable
            searchKey='email'
            // The member search lives in the filter row above and resolves server-side,
            // so the built-in box would only filter the page already on screen.
            isSearch={false}
            columns={consentColumns}
            data={rows}
            isLoading={isPending}
            serverSide
            alwaysShowPagination={!failed}
            nowrap
            currentPage={page}
            totalItems={total}
            itemsPerPage={perPage}
            onPageChange={goToPage}
            emptyMessage={
                failed ? (
                    <span className='flex flex-col items-center gap-1'>
                        <TriangleAlert className='mb-1 size-8 text-amber-400/70' />
                        <span className='text-foreground text-sm font-semibold'>Couldn&apos;t load consents</span>
                        <span className='max-w-sm text-xs leading-relaxed'>
                            The request failed — this is not a claim that no consents exist. Try reloading the page.
                        </span>
                    </span>
                ) : (
                    <span className='flex flex-col items-center gap-1'>
                        <ShieldCheck className='text-slr-dim mb-1 size-8' />
                        <span className='text-foreground text-sm font-semibold'>No consent records</span>
                        <span className='max-w-sm text-xs leading-relaxed'>Nothing matches these filters.</span>
                    </span>
                )
            }
        />
    );
}
