import Link from 'next/link';

import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import type { ListError } from '@/components/common/list-error-card';
import { Button } from '@/components/ui/button';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { toListError } from '@/lib/api/list-error';
import { getDiscounts } from '@/lib/api/resources/discounts';
import { getAccessToken } from '@/lib/api/server';

import { type DiscountRow, DiscountsClient } from './discounts-client';
import { Plus } from 'lucide-react';

export default async function DiscountsPage() {
    const token = await getAccessToken();

    let rows: DiscountRow[] = [];
    let listError: ListError | null = null;

    try {
        const discounts = token ? await getDiscounts(token) : [];
        rows = discounts.map((d) => ({
            id: d.discount_id,
            title: d.title || '-',
            partner: d.partner_name || '-',
            category: d.category || '-',
            featured: d.is_featured ? 'Yes' : 'No'
        }));
    } catch (error) {
        handleApiAuthError(error);
        listError = toListError(error);
    }

    return (
        <DashboardPageShell>
            <div className='flex items-center justify-between'>
                <Heading title='Discounts' description='Create, edit and remove partner discounts' />
                <Button asChild>
                    <Link href='/dashboard/discounts/new'>
                        <Plus className='mr-2 h-4 w-4' />
                        New Discount
                    </Link>
                </Button>
            </div>

            <DiscountsClient initialRows={rows} listError={listError} />
        </DashboardPageShell>
    );
}
