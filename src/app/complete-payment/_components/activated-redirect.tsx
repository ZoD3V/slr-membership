'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { syncPaymentState } from '@/lib/session-actions';

import { Loader2 } from 'lucide-react';

// The backend already marks this member as paid, but the JWT still says
// otherwise — refresh the token first, or the middleware sends them right back.
const ActivatedRedirect = () => {
    const router = useRouter();

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            await syncPaymentState();
            if (cancelled) return;
            router.replace('/member');
            router.refresh();
        })();

        return () => {
            cancelled = true;
        };
    }, [router]);

    return (
        <div className='border-slr-navy-border bg-slr-navy-card mx-auto flex max-w-md flex-col items-center rounded-2xl border px-6 py-12 text-center'>
            <div className='bg-gold-tint mb-4 flex size-14 items-center justify-center rounded-2xl border border-[#D4AF3759]'>
                <Loader2 className='text-slr-gold-label size-7 animate-spin' />
            </div>
            <h3 className='font-bebas-neue text-2xl tracking-wider text-white uppercase'>Membership Active</h3>
            <p className='text-slr-muted mt-2 text-sm leading-relaxed'>Taking you to your dashboard…</p>
        </div>
    );
};

export default ActivatedRedirect;
