import type { FC, ReactNode } from 'react';

import Link from 'next/link';

import { cn } from '@/lib/utils';

type GoldOutlineButtonProps = {
    href: string;
    children: ReactNode;
    className?: string;
};

/** Secondary CTA — pairs with GoldPillButton wherever a hero offers a second action. */
const GoldOutlineButton: FC<GoldOutlineButtonProps> = ({ href, children, className }) => (
    <Link
        href={href}
        className={cn(
            'inline-flex items-center justify-center rounded-xl border border-[#FFD147] bg-[#FFD1471A] px-8 py-2.5 text-base font-bold tracking-wide text-[#FFDC75] uppercase shadow-[inset_0_1px_5px_rgba(255,220,117,0.15)] transition-all hover:bg-[#FFD147]/20 lg:px-10 lg:py-3 lg:text-lg',
            className
        )}>
        {children}
    </Link>
);

export default GoldOutlineButton;
