import type { ReactNode } from 'react';

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CountdownBoxes } from '@/components/common/countdown';
import { EntryStatusBadge } from '@/components/common/entry-status-badge';
import { TierGroupBadge } from '@/components/common/tier-badge';
import { TIER_VISUALS } from '@/constant/tiers';
import { getCurrentMember } from '@/data/member-dashboard';
import { handleApiAuthError } from '@/lib/api/guard';
import { getEntryHistory } from '@/lib/api/resources/entries';
import { type ApiGiveaway, getGiveaway, getGiveaways, toGiveawayDetail } from '@/lib/api/resources/giveaways';
import { getAccessToken } from '@/lib/api/server';
import { formatDrawDateTime, formatShortDate, tierGroupOf } from '@/lib/member';
import { goldButtonStyle } from '@/lib/styles';
import type { GiveawayDetail, GiveawayEntryRow, PastWinner } from '@/types/member';

import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    Lock,
    MapPin,
    ShieldCheck,
    Ticket,
    Trophy
} from 'lucide-react';

// getGiveaway is React.cache'd on (id, token) → one network call even though
// metadata + the page both load it. ⚠️ giveaways/{id} is unverifiable while the
// list 500s → any failure degrades to notFound (see SP1 spec / API-INTEGRATION).
async function loadGiveaway(id: string): Promise<GiveawayDetail | null> {
    const member = await getCurrentMember();
    const token = await getAccessToken();

    if (!token) return null;

    try {
        // Detail lacks entry status + token count → pull the list item (entry status)
        // and the cycle tokens (entries-per-giveaway) alongside; both non-fatal.
        const [detail, list, entries] = await Promise.all([
            getGiveaway(id, token),
            getGiveaways(token).catch(() => [] as ApiGiveaway[]),
            getEntryHistory(token).catch(() => null)
        ]);
        const listItem = list.find((g) => g.giveaway_id === id);

        return toGiveawayDetail(
            detail,
            listItem,
            tierGroupOf(member.sub_tier),
            member.state,
            entries?.current_cycle ?? null
        );
    } catch (error) {
        handleApiAuthError(error); // expired session → force logout

        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const giveaway = await loadGiveaway((await params).id);

    return { title: giveaway ? `${giveaway.title} · SLR Giveaways` : 'Giveaway · SLR' };
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className='bg-card-dark-navy border-slr-navy-border rounded-2xl border p-5 md:p-6'>
            <h2 className='font-bebas-neue mb-3 text-xl tracking-wide text-white uppercase'>{title}</h2>
            {children}
        </section>
    );
}

export default async function GiveawayDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const giveaway = await loadGiveaway(id);

    if (!giveaway) notFound();

    const visual = TIER_VISUALS[giveaway.tier_group];

    return (
        <div className='mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8'>
            <Link
                href='/member/giveaways'
                className='text-slr-muted hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors'>
                <ArrowLeft className='size-4' /> Giveaways
            </Link>

            {/* Hero */}
            <div
                className='shadow-card-warm relative isolate overflow-hidden rounded-2xl border p-5 md:p-7'
                style={{ background: visual.badgeBg, borderColor: visual.badgeBorder }}>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                    <TierGroupBadge group={giveaway.tier_group} size='md' />
                    {giveaway.entered ? (
                        <span className='inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400'>
                            <CheckCircle2 className='size-3.5' /> You&apos;re Entered
                        </span>
                    ) : giveaway.locked ? (
                        <span className='text-slr-dim inline-flex items-center gap-1.5 text-xs font-semibold uppercase'>
                            <Lock className='size-3.5' /> Tier locked
                        </span>
                    ) : (
                        <EntryStatusBadge status={giveaway.entry_status} />
                    )}
                </div>

                <h1 className='font-bebas-neue mt-3 text-4xl tracking-wide text-white uppercase md:text-5xl'>
                    {giveaway.title}
                </h1>
                <p className='mt-1 inline-flex items-center gap-2 text-lg font-semibold'>
                    <Trophy className='text-slr-gold-label size-5 shrink-0' />
                    <span className='text-gradient-gold'>{giveaway.prize_label}</span>
                </p>

                <div className='text-slr-muted mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm'>
                    <span className='inline-flex items-center gap-1.5'>
                        <MapPin className='size-4' /> {giveaway.draw_pool}
                    </span>
                    {giveaway.entered && (
                        <span className='inline-flex items-center gap-1.5'>
                            <Ticket className='size-4' />
                            <span className='tabular-nums'>{giveaway.total_entries}</span> entries
                        </span>
                    )}
                    {giveaway.pool_entries > 0 && (
                        <span className='inline-flex items-center gap-1.5'>
                            <span className='tabular-nums'>{giveaway.pool_entries.toLocaleString('en-AU')}</span> in
                            pool
                        </span>
                    )}
                </div>

                <div className='mt-5'>
                    <CountdownBoxes targetIso={giveaway.draws_at} />
                </div>
                <p className='text-slr-dim mt-3 text-xs'>Draws {formatDrawDateTime(giveaway.draws_at)}</p>

                {giveaway.locked && (
                    <div className='mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-4'>
                        <div className='flex items-center gap-3'>
                            {visual.cardArt && (
                                <Image
                                    src={visual.cardArt}
                                    alt=''
                                    width={160}
                                    height={130}
                                    className='w-16 shrink-0 object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)]'
                                />
                            )}
                            <p className='max-w-md text-sm text-white/90'>
                                This draw is exclusive to <span className='font-semibold'>SLR {visual.label}</span>{' '}
                                members. Upgrade to start earning entries.
                            </p>
                        </div>
                        <Link
                            href='/member/membership'
                            className='inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold uppercase'
                            style={goldButtonStyle}>
                            Upgrade to {visual.label} <ArrowRight className='size-4' />
                        </Link>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className='grid gap-5 lg:grid-cols-3'>
                <div className='space-y-5 lg:col-span-2'>
                    <InfoCard title='The Prize'>
                        <p className='text-slr-muted text-sm leading-relaxed'>{giveaway.prize_description}</p>
                    </InfoCard>

                    <InfoCard title='How It Works'>
                        <ul className='space-y-2.5'>
                            {giveaway.rules.map((rule, i) => (
                                <li key={i} className='flex gap-2.5 text-sm text-white/90'>
                                    <ChevronRight className='text-slr-gold-label mt-0.5 size-4 shrink-0' />
                                    <span className='leading-relaxed'>{rule}</span>
                                </li>
                            ))}
                        </ul>
                    </InfoCard>

                    <section className='bg-gold-tint rounded-2xl border border-[#D4AF3759] p-5 md:p-6'>
                        <div className='flex items-center gap-2'>
                            <ShieldCheck className='text-slr-gold-label size-5 shrink-0' />
                            <h2 className='font-bebas-neue text-lg tracking-wide text-white uppercase'>
                                TPAL Certification
                            </h2>
                        </div>
                        <p className='text-slr-muted mt-2 text-sm leading-relaxed'>{giveaway.tpal_note}</p>
                    </section>
                </div>

                <div className='space-y-5'>
                    <InfoCard title='Your Entries'>
                        {giveaway.entry_history.length > 0 ? (
                            <ul className='divide-y divide-white/5'>
                                {giveaway.entry_history.map((row: GiveawayEntryRow) => (
                                    <li key={row.cycle} className='flex items-center justify-between gap-2 py-2.5'>
                                        <div className='text-sm'>
                                            <p className='text-white/90'>{row.cycle}</p>
                                            <p className='text-slr-dim text-xs'>
                                                <span className='tabular-nums'>{row.entries}</span> entries
                                            </p>
                                        </div>
                                        <EntryStatusBadge status={row.status} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className='text-slr-dim text-sm'>
                                You have no entries in this pool yet. Upgrade your tier to take part.
                            </p>
                        )}
                    </InfoCard>

                    <InfoCard title='Past Winners'>
                        <ul className='space-y-3'>
                            {giveaway.past_winners.map((winner: PastWinner, i: number) => (
                                <li key={i} className='flex items-center justify-between gap-2 text-sm'>
                                    <div>
                                        <p className='text-white/90'>
                                            {winner.name} <span className='text-slr-dim'>· {winner.state}</span>
                                        </p>
                                        <p className='text-slr-dim text-xs'>{formatShortDate(winner.drawn_at)}</p>
                                    </div>
                                    <span className='text-gradient-gold text-right text-xs font-semibold'>
                                        {winner.prize}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </InfoCard>
                </div>
            </div>
        </div>
    );
}
