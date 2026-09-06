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

/** Clause 3.1 points at the homepage for the pool, so this shows only when that CMS field is unreachable. */
const FALLBACK_POOL = 'the amount published on the homepage';

const ELIGIBLE_STATES = 'Victoria, Queensland, Western Australia, Tasmania, and the Northern Territory';

const drawDetails = (pool: string): { label: string; value: ReactNode }[] => [
    { label: 'Promotion cycle opens', value: '11 September 2026' },
    { label: 'Regular draws', value: 'Every Friday, or as announced on the website' },
    { label: 'Entries close each Friday', value: '6:30 PM AEST' },
    { label: 'Draw time each Friday', value: '8:00 PM AEST' },
    {
        label: 'Prize pool',
        value: (
            <>
                {pool} —{' '}
                <Link href='/#current-prizes' className='text-[#FFDC75] hover:underline'>
                    see the homepage
                </Link>
            </>
        )
    },
    { label: 'Eligible area', value: 'VIC, QLD, WA, TAS, NT' }
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

/**
 * "Standard - 1 Entry; Plus - 4 Entries" from the live tier data. Clause 7.1 lists entry counts
 * without prices, so only the token allocation is read here.
 */
const allocationLine = (pricing: TierPricing, group: 'red' | 'blue') =>
    codesForGroup(pricing, group)
        .map((code) => {
            const { tokens } = pricing[code];

            return `${SUB_TIERS[code].marketingName} - ${tokens} ${tokens === 1 ? 'Entry' : 'Entries'}`;
        })
        .join('; ');

const buildSections = (pricing: TierPricing): LegalSection[] => [
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
                    Participation is available to eligible Red Members and Blue Members residing in {ELIGIBLE_STATES} in
                    accordance with these Competition Rules, the Smart Life Rewards{' '}
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
                    3.1 The total Prize Pool and all specific prize details for the Promotional Draws will be as
                    published on the current{' '}
                    <Link href='/#current-prizes' className='text-[#FFDC75] hover:underline'>
                        website homepage
                    </Link>{' '}
                    (smartliferewards.com.au).
                </p>
                <p>
                    3.2 The advertised Prize Pool is a combined Prize Pool made available across eligible Red and Blue
                    Membership tiers. It does not mean that every Member or tier is eligible for every individual prize.
                </p>
                <p>
                    3.3 SLR will publish the applicable Prize Schedule identifying the number, type and value of prizes,
                    the draw to which each prize relates, and whether a prize is available to Red Members, Blue Members
                    or both.
                </p>
                <p>
                    3.4 The value of any separately advertised 1,000-member Bonus Prize is additional to the regular
                    Prize Pool unless the relevant advertisement or Bonus Promotion Schedule expressly states that it is
                    included.
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
                    A Member legitimately holding both Red and Blue Memberships across separate accounts may be eligible
                    under each tier, subject to the separate eligibility and Entry rules applying to each Bonus
                    Promotion.
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
                    Friday draws, entries close at 6:30 PM AEST and the draw takes place at 8:00 PM AEST.
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
                <div className='mt-4 space-y-1 rounded-xl border border-white/10 bg-black/20 p-4'>
                    <Fact label='Cycle opens'>11 September 2026</Fact>
                    <Fact label='Regular draws'>Every Friday, or as announced on the website</Fact>
                    <Fact label='Entries close'>6:30 PM AEST</Fact>
                    <Fact label='Draw time'>8:00 PM AEST</Fact>
                </div>
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
                    5.3 A Member must hold an active and eligible Red Membership, Blue Membership, or both across
                    separate accounts at the closing time for the relevant draw. Eligibility is assessed separately for
                    each tier.
                </p>
                <p>
                    5.4 Where a Member&rsquo;s paid Membership Cycle starts or ends during the promotion period, that
                    Member is eligible only for draws whose closing-time requirements are satisfied under these Rules
                    and the applicable Prize Schedule.
                </p>
                <p>
                    5.5 Cancellation generally takes effect at the end of the current paid Membership Cycle, subject to
                    the Smart Life Rewards{' '}
                    <Link href='/terms' className='text-[#FFDC75] hover:underline'>
                        General Terms &amp; Conditions
                    </Link>{' '}
                    and rights under Australian Consumer Law.
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
                        `Be a resident of ${ELIGIBLE_STATES};`,
                        'Hold an eligible Red Membership, Blue Membership, or both across separate accounts;',
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
                <List
                    items={[
                        <>
                            <strong className='text-white/90'>Red Membership:</strong> {allocationLine(pricing, 'red')}.
                        </>,
                        <>
                            <strong className='text-white/90'>Blue Membership:</strong>{' '}
                            {allocationLine(pricing, 'blue')}.
                        </>
                    ]}
                />
                <p>
                    7.2 Members cannot hold both Red and Blue Memberships within a single SLR Member Account. To
                    participate in both tiers, a Member must create separate accounts using different email addresses.
                    Entries attributable to each tier will be recorded separately under their respective accounts.
                </p>
                <p>
                    7.3 Each valid Entry represents one chance in the applicable Promotional Draw unless a published
                    Prize Schedule expressly states otherwise. SLR does not inflate or multiply an Entry after
                    allocation except where a specific promotion expressly provides additional Entries.
                </p>
                <p>
                    7.4 Only valid Entries recorded before 6:30 PM AEST on the relevant Friday will be included in that
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
                    8.1 Winners will be selected electronically using the TPAL digital draw system, SLR&rsquo;s own
                    proprietary provably fair random draw engine, or another lawful random-draw system identified by
                    SLR. All SLR draw announcements are audited in accordance with certified trade promotion standards
                    and utilise cryptographic SHA-256 verification to ensure transparency and fairness.
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
                <p>
                    8.5 A Member who wins a prize remains eligible to win additional prizes in subsequent draws. A
                    Member&rsquo;s Entries remain active and eligible for all regular draws occurring during their paid
                    28-day Membership Cycle, provided their Membership fee is paid and the account remains active.
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
                    10.1 Winners may be required to verify their identity, age, residency, Membership status, Entry
                    validity and payment status before receiving a prize.
                </p>
                <p>10.2 Cash prizes will be paid using the method specified by SLR after successful verification.</p>
                <p>
                    10.3 Prizes will be awarded in accordance with the published Prize Schedule, Smart Life Rewards{' '}
                    <Link href='/terms' className='text-[#FFDC75] hover:underline'>
                        General Terms &amp; Conditions
                    </Link>{' '}
                    and applicable laws.
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
                </p>
                <p className='mt-2'>
                    Support: via the Smart Life Rewards{' '}
                    <Link href='/contact' className='text-[#FFDC75] hover:underline'>
                        Website Contact Page
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
                lastUpdated='4 September 2026'
                intro={
                    <>
                        <LegalContactCard title='SLR Life Pty Ltd t/a Smart Life Rewards'>
                            <p className='mt-1'>
                                ABN 99 696 467 473
                                <br />
                                Effective date: 2 September 2026
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
                sections={buildSections(pricing)}
            />
        </>
    );
};

export default GiveawayRulesPage;
