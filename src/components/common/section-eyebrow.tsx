import type { FC } from 'react';

import { cn } from '@/lib/utils';

type SectionEyebrowProps = {
    label: string;

    color: string;

    lineColor?: string;

    gradient?: string;

    className?: string;

    labelClassName?: string;
};

const SectionEyebrow: FC<SectionEyebrowProps> = ({ label, color, lineColor, gradient, className, labelClassName }) => {
    const line = lineColor ?? color;

    return (
        <div className={cn('flex w-full items-center justify-center gap-2', className)}>
            <div
                className='h-px w-16'
                style={{
                    background: `linear-gradient(270deg, ${line} 0%, rgba(255,255,255,0) 100%)`
                }}
                aria-hidden='true'
            />
            <p
                className={cn('font-semibold uppercase', labelClassName ?? 'text-xs md:text-sm')}
                style={
                    gradient
                        ? {
                              backgroundImage: gradient,
                              WebkitBackgroundClip: 'text',
                              backgroundClip: 'text',
                              color: 'transparent'
                          }
                        : { color }
                }>
                {label}
            </p>
            <div
                className='h-px w-16'
                style={{
                    background: `linear-gradient(90deg, ${line} 0%, rgba(255,255,255,0) 100%)`
                }}
                aria-hidden='true'
            />
        </div>
    );
};

export default SectionEyebrow;
