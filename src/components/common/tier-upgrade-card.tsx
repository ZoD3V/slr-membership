import type { CSSProperties, FC } from 'react';

import Image from 'next/image';

type TierUpgradeCardProps = {
    iconSrc: string;
    iconAlt: string;

    label: string;

    price: string;

    period?: string;

    badgeLabel: string;

    badgeLabelColor?: string;
    badgeSubColor?: string;
    titleColor?: string;
    entryChanges?: string;

    badgeSub?: string;

    cardStyle: CSSProperties;

    badgeStyle: CSSProperties;
};

const TierUpgradeCard: FC<TierUpgradeCardProps> = ({
    iconSrc,
    iconAlt,
    label,
    price,
    period = '/month',
    badgeLabel,
    badgeLabelColor = '#F5D78E',
    badgeSubColor = '#ADB0B5',
    badgeSub = 'MEMBER ENTRIES',
    titleColor = '#ADB0B5',
    cardStyle,
    entryChanges,
    badgeStyle
}) => (
    <div
        style={cardStyle}
        className='flex flex-1 items-center justify-between gap-2 rounded-xl px-3 py-3 transition-colors sm:gap-3 sm:px-4 sm:py-4 md:px-5'>
        <div className='flex min-w-0 items-center gap-2 sm:gap-3 md:gap-4'>
            <Image
                src={iconSrc}
                alt={iconAlt}
                width={80}
                height={80}
                className='h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16 md:h-20 md:w-20'
            />
            <div className='flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0 sm:gap-x-2'>
                <div className='flex flex-col'>
                    <div className='flex items-center gap-1.5 uppercase' style={{ color: titleColor }}>
                        <span className='text-xs leading-none font-semibold tracking-[0.18em] whitespace-nowrap sm:text-sm sm:tracking-[0.3em]'>
                            {label}
                        </span>
                        <span className='font-bebas-neue text-gradient-gold text-2xl leading-none font-extrabold tracking-normal sm:text-3xl'>
                            {price}
                        </span>
                    </div>
                    {entryChanges && (
                        <span className='text-[10px] font-normal sm:text-xs md:text-sm' style={{ color: titleColor }}>
                            {entryChanges}
                        </span>
                    )}
                </div>
                <span className='text-[10px] font-normal text-white/60 sm:text-xs md:text-sm'>{period}</span>
            </div>
        </div>
        <div
            style={badgeStyle}
            className='flex shrink-0 flex-col items-center justify-center rounded-xl p-2 text-center sm:rounded-2xl sm:p-3 md:p-4'>
            <p
                className='text-sm leading-none font-extrabold whitespace-nowrap uppercase sm:text-base md:text-lg'
                style={{ color: badgeLabelColor }}>
                {badgeLabel}
            </p>
            <p
                className='mt-1 text-[9px] tracking-widest uppercase sm:text-[10px] md:text-xs'
                style={{ color: badgeSubColor }}>
                {badgeSub}
            </p>
        </div>
    </div>
);

export default TierUpgradeCard;
