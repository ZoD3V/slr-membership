'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

import { generateDrawCsvAction } from '../actions';
import { Loader2Icon, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function GenerateCsvButton() {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const generate = () => {
        startTransition(async () => {
            const res = await generateDrawCsvAction();
            if (res.ok) {
                const total = res.data.files.reduce((sum, f) => sum + (f.row_count ?? 0), 0);
                toast.success(`${res.data.files.length} CSV files generated — ${total} rows total.`);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        });
    };

    return (
        <Button onClick={generate} disabled={pending}>
            {pending ? <Loader2Icon className='mr-2 size-4 animate-spin' /> : <RefreshCw className='mr-2 size-4' />}
            Generate CSVs
        </Button>
    );
}
