import type { FC, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type SectionHeadingProps = {
    children: ReactNode;
    className?: string;

    as?: 'h1' | 'h2' | 'h3';
};

const SectionHeading: FC<SectionHeadingProps> = ({ children, className, as = 'h2' }) => {
    const Tag = as;

    return (
        <Tag
            className={cn(
                'font-bebas-neue text-center text-[56px] leading-[0.90] font-medium tracking-wider text-white uppercase md:text-[72px] md:leading-none',
                className
            )}>
            {children}
        </Tag>
    );
};

export default SectionHeading;
