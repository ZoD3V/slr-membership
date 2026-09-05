import { ReactNode } from 'react';

import { Metadata } from 'next';
import Link from 'next/link';

import { SUB_TIERS } from '@/constant/tiers';
import { getPublicPrizeContent } from '@/lib/api/resources/prizes';
import { poolLabel } from '@/lib/prize-content';
import { type TierPricing, codesForGroup, getTierPricing } from '@/lib/tier-pricing';
import type { PrizeContent } from '@/types/member';

import LegalDoc, { LegalContactCard, LegalSection, LegalList as List } from '../_components/legal-doc';
import PageHero from '../_components/page-hero';

export const metadata: Metadata = {
    title: 'Competition Rules · SLR Rewards',
    description:
        'Competition Rules for the Smart Life Rewards 28-day Red & Blue member draw cycle — promoter, prize pool, eligibility, entries and draw method.'
};

/** Used only when the prizes CMS is unreachable, so the Rules never render a blank pool. */
const FALLBACK_POOL = '$3,300';

const drawDetails = (pool: string): { label: string; value: string }[] => [
    { label: 'Promotion cycle opens', value: '11 September 2026' },
    { label: 'First draw', value: '18 September 2026' },
    { label: 'Regular draws', value: 'Every Friday, or as announced on the website' },
    { label: 'Entries close each Friday', value: '7:30 PM AEST' },
    { label: 'Draw time each Friday', value: '8:00 PM AEST' },
    { label: 'Combined Red & Blue prize pool', value: `${pool} across the 28-day cycle` },
    { label: 'Eligible area', value: 'Victoria only' }
];

const DrawDetails = ({ pool }: { pool: string }) => (
    <div className='rounded-xl border border-[#FFD147]/30 bg-[#FFD147]/5 p-4 md:p-5'>
        <p className='text-slr-gold-label text-xs font-semibold tracking-widest uppercase'>
            Current draw-cycle details
        </p>
        <dl className='mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2'>
            {drawDetails(pool).map((row) => (
                <div key={row.label}>
                    <dt className='text-slr-dim text-xs tracking-wide uppercase'>{row.label}</dt>
                    <dd className='mt-0.5 text-sm font-semibold text-white'>{row.value}</dd>
                </div>
            ))}
        </dl>
    </div>
);

const Fact = ({ label, children }: { label: string; children: ReactNode }) => (
    <p>
        <span className='text-slr-dim'>{label}:</span> <span className='font-semibold text-white/90'>{children}</span>
    </p>
);

/** "Standard: $6 - 1 Entry; Plus: $12 - 4 Entries" straight from the live tier pricing. */
const allocationLine = (pricing: TierPricing, group: 'red' | 'blue') =>
    codesForGroup(pricing, group)
        .map((code) => {
            const { priceCents, tokens } = pricing[code];

            return `${SUB_TIERS[code].marketingName}: $${priceCents / 100} - ${tokens} ${tokens === 1 ? 'Entry' : 'Entries'}`;
        })
        .join('; ');

const buildSections = (pricing: TierPricing, pool: string): LegalSection[] => [
    {
        heading: 'Promoter',
        body: <p>The Promoter is SLR Life Pty Ltd trading as Smart Life Rewards (SLR), ABN 99 696 467 473.</p>
    },
    {
        heading: 'Promotion',
        body: (
            <>
                <p>
                    The promotion is the Smart Life Rewards Early Stage Red and Blue Member Promotion conducted over a
                    28-day draw cycle.
                </p>
                <p>
                    Participation is available to eligible Victorian Red Members and Blue Members in accordance with
                    these Competition Rules, the Smart Life Rewards{' '}
                    <Link href='/terms' className='text-[#FFDC75] hover:underline'>
                        General Terms &amp; Conditions
                    </Link>{' '}
                    and the applicable published Prize Schedule.
                </p>
            </>
        )
    },
    {
        heading: 'Prize pool',
        body: (
            <>
                <p>
                    3.1 The total Prize Pool for the four regular Friday Promotional Draws in this 28-day cycle is{' '}
                    {pool}.
                </p>
                <p>
                    3.2 The {pool} is a combined Prize Pool made available across eligible Red and Blue Membership
                    tiers. It does not mean that every Member or tier is eligible for every individual prize.
                </p>
                <p>
                    3.3 SLR will publish the applicable Prize Schedule identifying the number, type and value of prizes,
                    the draw to which each prize relates, and whether a prize is available to Red Members, Blue Members
                    or both.
                </p>
                <p>
                    3.4 The value of any separately advertised 1,000-member Bonus Prize is additional to the {pool}{' '}
                    regular Prize Pool unless the relevant advertisement or Bonus Promotion Schedule expressly states
                    that it is included.
                </p>
                <p className='pt-2 font-semibold text-white/90'>3.5 Red and Blue 1,000-member bonuses</p>
                <p>SLR may conduct separate conditional Bonus Promotions for the Red and Blue Membership tiers:</p>
                <List
                    items={[
                        'Red 1,000-Member Bonus: activated only if the Red tier reaches at least 1,000 active eligible Red Memberships by the cut-off published for that Bonus Promotion.',
                        'Blue 1,000-Member Bonus: activated only if the Blue tier reaches at least 1,000 active eligible Blue Memberships by the cut-off published for that Bonus Promotion.'
                    ]}
                />
                <p>
                    The amount of each Bonus Prize will be the amount clearly advertised by SLR for that tier and must
                    be read together with the applicable Bonus Promotion Schedule.
                </p>
                <p>
                    If the relevant tier does not reach the stated 1,000 active eligible Membership threshold by the
                    published cut-off, that tier&rsquo;s Bonus Prize will not be activated, drawn or awarded.
                </p>
                <p>
                    A Member legitimately holding both Red and Blue Memberships may be eligible under each tier, subject
                    to the separate eligibility and Entry rules applying to each Bonus Promotion.
                </p>
                <p>
                    SLR may publish additional conditions for a Bonus Promotion, including its opening and closing time,
                    qualifying Membership status, eligible Entries, Bonus Prize amount, draw date, claim process and any
                    required permit or authority information.
                </p>
            </>
        )
    },
    {
        heading: 'Promotion period & four Friday draws',
        body: (
            <>
                <p>
                    4.1 The initial 28-day promotion cycle commences on 11 September 2026. Following this, new 28-day
                    promotion cycles will automatically commence on a continuous, rolling basis unless otherwise
                    announced by SLR.
                </p>
                <p>
                    4.2 Regular draws take place every Friday or as listed on the website announcement. For regular
                    Friday draws, entries close at 7:30 PM AEST and the draw takes place at 8:00 PM AEST.
                </p>
                <p>
                    4.3 Only valid Entries recorded before the closing time for the relevant Friday draw will be
                    included in that draw.
                </p>
                <p>
                    4.4 Any changes to subsequent 28-day promotion cycles, including variations to draw dates or the
                    Prize Pool, will be separately published by SLR. Otherwise, the cycles will continue automatically
                    under these terms.
                </p>
                <Fact label='First draw'>18 September 2026 @ 8:00 PM AEST</Fact>
            </>
        )
    },
    {
        heading: '28-day membership fee & eligibility period',
        body: (
            <>
                <p>
                    5.1 SLR paid Memberships operate on a recurring 28-day Membership Cycle unless another period is
                    expressly displayed at purchase.
                </p>
                <p>
                    5.2 The Membership fee is paid for access to the applicable SLR membership platform, services,
                    savings, discounts, benefits and features. Promotional Entries and Promotional Draws are ancillary
                    Member benefits and no win is guaranteed.
                </p>
                <p>
                    5.3 A Member must hold an active and eligible Red Membership, Blue Membership or both at the closing
                    time for the relevant draw. Eligibility is assessed separately for each tier.
                </p>
                <p>
                    5.4 Where a Member&rsquo;s paid Membership Cycle starts or ends during the promotion period, that
                    Member is eligible only for draws whose closing-time requirements are satisfied under these Rules
                    and the applicable Prize Schedule.
                </p>
                <p>
                    5.5 Cancellation generally takes effect at the end of the current paid Membership Cycle, subject to
                    the Smart Life Rewards General Terms &amp; Conditions and rights under Australian Consumer Law.
                </p>
            </>
        )
    },
    {
        heading: 'Eligibility',
        body: (
            <>
                <p>To participate, a person must:</p>
                <List
                    items={[
                        'Be aged 18 years or over;',
                        'Be a resident of Victoria;',
                        'Hold an eligible Red Membership, Blue Membership or both;',
                        'Have an active and eligible Membership in the relevant tier at the applicable closing time;',
                        'Have valid Entries recorded for the relevant draw; and',
                        'Comply with these Competition Rules, the Smart Life Rewards General Terms & Conditions and the applicable Prize Schedule.'
                    ]}
                />
                <p>
                    Employees, officers, contractors directly involved in administering the promotion, and other persons
                    excluded under the Smart Life Rewards General Terms &amp; Conditions or applicable Prize Schedule,
                    are not eligible to participate.
                </p>
            </>
        )
    },
    {
        heading: 'Entries',
        body: (
            <>
                <p>
                    7.1 Eligible Members receive Entries according to the applicable SLR Membership tier and Entry
                    allocation published for the draw.
                </p>
                <p>
                    <span className='text-slr-dim'>Red Membership:</span>{' '}
                    <span className='font-semibold text-white/90'>{allocationLine(pricing, 'red')}.</span>
                </p>
                <p>
                    <span className='text-slr-dim'>Blue Membership:</span>{' '}
                    <span className='font-semibold text-white/90'>{allocationLine(pricing, 'blue')}.</span>
                </p>
                <p>
                    7.2 Where a Member holds both Red and Blue Memberships within one SLR Member Account, Entries
                    attributable to each tier will be recorded separately and applied only to the draws for which that
                    tier is eligible.
                </p>
                <p>
                    7.3 Each valid Entry represents one chance in the applicable Promotional Draw unless a published
                    Prize Schedule expressly states otherwise. SLR does not inflate or multiply an Entry after
                    allocation except where a specific promotion expressly provides additional Entries.
                </p>
                <p>
                    7.4 Only valid Entries recorded before 7:30 PM AEST on the relevant Friday will be included in that
                    Friday&rsquo;s draw.
                </p>
            </>
        )
    },
    {
        heading: 'Draw method',
        body: (
            <>
                <p>
                    8.1 Winners will be selected electronically using the TPAL digital draw system or another lawful
                    random-draw system identified by SLR.
                </p>
                <p>
                    8.2 Each draw will be conducted at 8:00 PM AEST in Victoria, Australia, on the applicable Friday
                    stated in clause 4.2.
                </p>
                <p>
                    8.3 Each valid Entry in the applicable draw has an equal opportunity of being randomly selected,
                    subject to the Entry allocation and eligibility rules.
                </p>
                <p>
                    8.4 SLR may postpone or reschedule a draw where reasonably necessary because of technical failure,
                    regulatory requirements, force majeure or circumstances outside its reasonable control, subject to
                    applicable law.
                </p>
            </>
        )
    },
    {
        heading: 'Winner notification & publication',
        body: (
            <>
                <p>9.1 Winners will be contacted using the details registered with Smart Life Rewards.</p>
                <p>
                    9.2 Members are responsible for keeping their name, email address, telephone number, residential
                    address and Membership details accurate and current.
                </p>
                <p>
                    9.3 Winner details will be published on the Smart Life Rewards website and/or official social-media
                    channels where required or permitted, subject to applicable privacy and regulatory requirements.
                </p>
            </>
        )
    },
    {
        heading: 'Prize claim & verification',
        body: (
            <>
                <p>
                    10.1 Winners may be required to verify their identity, age, Victorian residency, Membership status,
                    Entry validity and payment status before receiving a prize.
                </p>
                <p>10.2 Cash prizes will be paid using the method specified by SLR after successful verification.</p>
                <p>
                    10.3 Prizes will be awarded in accordance with the published Prize Schedule, Smart Life Rewards
                    General Terms &amp; Conditions and applicable laws.
                </p>
                <p>
                    10.4 Unclaimed prizes, reserve winners and redraws will be managed only as permitted by the
                    applicable Prize Schedule and law.
                </p>
            </>
        )
    },
    {
        heading: 'Subsequent draws & order of terms',
        body: (
            <>
                <p>
                    11.1 The opening date, Entry closing date and time, draw date and time, eligible tiers, Prize Pool
                    and Prize Schedule will be published for each subsequent Smart Life Rewards draw cycle.
                </p>
                <p>
                    11.2 These Competition Rules must be read together with the Smart Life Rewards{' '}
                    <Link href='/terms' className='text-[#FFDC75] hover:underline'>
                        General Terms &amp; Conditions
                    </Link>{' '}
                    and the Prize Schedule applying to the relevant draw.
                </p>
                <p>
                    11.3 If there is an inconsistency concerning the mechanics of an individual draw, the specific Prize
                    Schedule or Promotion Schedule for that draw applies to the extent of the inconsistency, subject to
                    applicable law.
                </p>
            </>
        )
    },
    {
        heading: 'Contact',
        body: (
            <LegalContactCard title='Smart Life Rewards (SLR)'>
                <p className='mt-1'>
                    SLR Life Pty Ltd
                    <br />
                    ABN 99 696 467 473
                </p>
                <p className='mt-2'>
                    Email:{' '}
                    <a href='mailto:cs@smartliferewards.com.au' className='text-[#FFDC75] hover:underline'>
                        cs@smartliferewards.com.au
                    </a>
                    <br />
                    Support: via the{' '}
                    <Link href='/contact' className='text-[#FFDC75] hover:underline'>
                        Smart Life Rewards contact page
                    </Link>
                </p>
            </LegalContactCard>
        )
    }
];

const GiveawayRulesPage = async () => {
    const [pricing, content] = await Promise.all([
        getTierPricing(),
        getPublicPrizeContent().catch(() => null as PrizeContent | null)
    ]);
    const pool = poolLabel(content?.prize_pool_headline, FALLBACK_POOL);

    return (
        <>
            <PageHero
                eyebrow='Legal'
                title='Competition Rules'
                description='The rules for the 28-day Red & Blue member draw cycle.'
            />
            <LegalDoc
                lastUpdated='2 September 2026'
                intro={
                    <>
                        <LegalContactCard title='SLR Life Pty Ltd t/a Smart Life Rewards'>
                            <p className='mt-1'>
                                ABN 99 696 467 473
                                <br />
                                28 Welcome Parade, Wyndham, Victoria 3024
                            </p>
                            <p className='mt-2'>
                                Email:{' '}
                                <a href='mailto:cs@smartliferewards.com.au' className='text-[#FFDC75] hover:underline'>
                                    cs@smartliferewards.com.au
                                </a>
                            </p>
                        </LegalContactCard>
                        <div className='mt-4'>
                            <DrawDetails pool={pool} />
                        </div>
                    </>
                }
                sections={buildSections(pricing, pool)}
            />
        </>
    );
};

export default GiveawayRulesPage;
