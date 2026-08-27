import type { FC, ReactNode } from 'react';

import Link from 'next/link';

import { goldButtonStyle } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { ArrowRightIcon } from 'lucide-react';

type GoldPillButtonProps = {
    href: string;

    children?: ReactNode;

    withArrow?: boolean;

    className?: string;
};

const GoldPillButton: FC<GoldPillButtonProps> = ({ href, children = 'JOIN NOW', withArrow = true, className }) => (
    <Link
        href={href}
        style={goldButtonStyle}
        className={cn(
            'inline-flex items-center justify-center gap-2 rounded-xl px-8 py-2.5 text-base font-bold tracking-wide uppercase shadow-md transition-opacity hover:opacity-90 lg:px-10 lg:py-3 lg:text-lg',
            className
        )}>
        {children}
        {withArrow && <ArrowRightIcon className='h-5 w-5' />}
    </Link>
);

export default GoldPillButton;
