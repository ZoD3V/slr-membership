import Link from 'next/link';

import { ArrowLeft, Clock } from 'lucide-react';

export function ComingSoon({ title, description }: { title: string; description?: string }) {
    return (
        <div className='mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8'>
            <header>
                <h1 className='font-bebas-neue text-3xl tracking-wide uppercase sm:text-4xl'>{title}</h1>
            </header>

            <div className='flex flex-col items-center px-6 py-16 text-center'>
                <span className='bg-gold-tint mb-4 flex size-14 items-center justify-center rounded-2xl border border-[#D4AF3759]'>
                    <Clock className='text-slr-gold-label size-7' />
                </span>
                <h2 className='font-bebas-neue text-2xl tracking-wide text-white uppercase'>Coming Soon</h2>
                <p className='text-slr-muted mt-2 max-w-md text-sm leading-relaxed'>
                    {description ?? `The ${title} page is on its way. Check back soon.`}
                </p>
                <Link
                    href='/member'
                    className='text-slr-gold-label mt-5 inline-flex items-center gap-1.5 text-sm font-semibold uppercase transition-opacity hover:opacity-80'>
                    <ArrowLeft className='size-4' /> Back to dashboard
                </Link>
            </div>
        </div>
    );
}
