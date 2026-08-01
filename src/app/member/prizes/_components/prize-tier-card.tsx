import Image from 'next/image';
import Link from 'next/link';

import { TierGroupBadge } from '@/components/common/tier-badge';
import { TIER_VISUALS } from '@/constant/tiers';
import { cn } from '@/lib/utils';
import type { PrizeTierBreakdown } from '@/types/member';

import { ArrowRight, Star } from 'lucide-react';

export function PrizeTierCard({ tier, isYours }: { tier: PrizeTierBreakdown; isYours: boolean }) {
    const visual = TIER_VISUALS[tier.tier_group];

    return (
        <article
            className={cn(
                'relative flex flex-col rounded-2xl border p-5',
                isYours ? 'ring-slr-gold-label/50 ring-2' : 'opacity-90'
            )}
            style={{ background: visual.badgeBg, borderColor: visual.badgeBorder }}>
            {isYours && (
                <span
                    className='text-slr-gold-label absolute -top-2.5 left-5 inline-flex items-center gap-1 rounded-full border border-[#D4AF3759] px-2 py-0.5 text-xs font-semibold uppercase'
                    style={{ background: '#291F0A' }}>
                    <Star className='size-3' /> Your Tier
                </span>
            )}

            <div className='flex items-start justify-between gap-2'>
                <div>
                    <TierGroupBadge group={tier.tier_group} />
                    <h3 className='font-bebas-neue mt-3 text-2xl tracking-wide text-white uppercase'>
                        {tier.tier_label}
                    </h3>
                    <p className='text-slr-dim text-xs'>{tier.price_label}</p>
                </div>
                {/* Member-card artwork — same asset as the public tier hero cards */}
                {visual.cardArt && (
                    <Image
                        src={visual.cardArt}
                        alt=''
                        width={160}
                        height={130}
                        className='w-18 shrink-0 object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)]'
                    />
                )}
            </div>

            <div className='mt-4 space-y-3 border-t border-white/10 pt-4'>
                <div>
                    <p className='text-slr-gold-label text-xs font-semibold tracking-widest uppercase'>Weekly</p>
                    <p className='mt-0.5 text-sm text-white/90'>{tier.weekly}</p>
                </div>
                <div>
                    <p className='text-slr-gold-label text-xs font-semibold tracking-widest uppercase'>Monthly</p>
                    <p className='mt-0.5 text-sm text-white/90'>{tier.monthly ?? '—'}</p>
                </div>
            </div>

            {isYours && (
                <Link
                    href='/member/giveaways'
                    className='text-slr-gold-label mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase transition-opacity hover:opacity-80'>
                    View your giveaways <ArrowRight className='size-3.5' />
                </Link>
            )}
        </article>
    );
}
