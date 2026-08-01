import type { ReactNode } from 'react';

import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

interface SectionTitleProps {
    children: ReactNode;
    viewAllHref?: string;
}

export function SectionTitle({ children, viewAllHref }: SectionTitleProps) {
    return (
        <div className='mb-4 flex items-center gap-3'>
            <h2 className='font-bebas-neue text-xl tracking-wider text-white uppercase md:text-2xl'>{children}</h2>
            <span aria-hidden className='slr-hairline-gold h-px min-w-8 flex-1' />
            {viewAllHref && (
                <Link
                    href={viewAllHref}
                    className='text-slr-gold-label inline-flex shrink-0 items-center gap-1 text-xs font-semibold tracking-widest uppercase transition-opacity hover:opacity-80'>
                    View all <ArrowRight className='size-3.5' />
                </Link>
            )}
        </div>
    );
}
