import { TierBadge } from '@/components/common/tier-badge';
import type { CurrentMember } from '@/types/member';

import { MapPin } from 'lucide-react';

export function Greeting({ member }: { member: CurrentMember }) {
    const firstName = member.name.split(' ')[0];

    return (
        <div className='flex flex-wrap items-end justify-between gap-3'>
            <div>
                <div className='flex items-center gap-2'>
                    <p className='text-slr-gold-label text-[10px] font-semibold tracking-[0.2em] uppercase sm:text-xs'>
                        Member Dashboard
                    </p>
                    <span aria-hidden className='slr-hairline-gold h-px w-16' />
                </div>
                <h1 className='font-bebas-neue mt-2 text-4xl leading-none tracking-wider uppercase sm:text-5xl md:text-6xl'>
                    <span className='text-gradient-silver'>Welcome back,</span>{' '}
                    <span className='text-gradient-gold'>{firstName}</span>
                </h1>
                <p className='text-slr-muted mt-2 text-sm md:text-base'>
                    Here&apos;s your membership &amp; draw summary.
                </p>
            </div>
            <div className='flex items-center gap-2'>
                <TierBadge subTier={member.sub_tier} />
                <span className='text-slr-dim inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/3 px-2.5 py-1 text-xs font-medium'>
                    <MapPin className='text-slr-gold-label size-3.5' /> {member.state}
                </span>
            </div>
        </div>
    );
}
