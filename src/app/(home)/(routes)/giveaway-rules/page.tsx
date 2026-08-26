import { ReactNode } from 'react';

import { Metadata } from 'next';
import Link from 'next/link';

import LegalDoc, { LegalContactCard, LegalSection, LegalList as List } from '../_components/legal-doc';
import PageHero from '../_components/page-hero';

export const metadata: Metadata = {
    title: 'Competition Rules · SLR Rewards',
    description:
        'Competition Rules for the Smart Life Rewards Early Stage Member Promotion — promoter, prize pool, eligibility, entries and draw method.'
};

/**
 * The draw-specific figures at the top of the document. These change every
 * 28-day cycle, so they are grouped here rather than scattered through the
 * clauses — clause 10 covers subsequent draws.
 */
const DRAW_DETAILS: { label: string; value: string }[] = [
    { label: 'Promotion opens', value: '24 August 2026' },
    { label: 'Entries close', value: '4 September 2026 @ 7:30 PM AEST' },
    { label: 'Draw date', value: '4 September 2026' },
    { label: 'Draw time', value: '8:00 PM AEST' },
    { label: 'Prize pool', value: '$2,100' },
    { label: 'Eligible area', value: 'Victoria only' }
];

const DrawDetails = () => (
    <div className='rounded-xl border border-[#FFD147]/30 bg-[#FFD147]/5 p-4 md:p-5'>
        <p className='text-slr-gold-label text-xs font-semibold tracking-widest uppercase'>Current draw details</p>
        <dl className='mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2'>
            {DRAW_DETAILS.map((row) => (
                <div key={row.label}>
                    <dt className='text-slr-dim text-xs tracking-wide uppercase'>{row.label}</dt>
                    <dd className='mt-0.5 text-sm font-semibold text-white'>{row.value}</dd>
                </div>
            ))}
        </dl>
    </div>
);

/** Label/value pair used inside clauses 4 and 7. */
const Fact = ({ label, children }: { label: string; children: ReactNode }) => (
    <p>
        <span className='text-slr-dim'>{label}:</span> <span className='font-semibold text-white/90'>{children}</span>
    </p>
);

const sections: LegalSection[] = [
    {
        heading: 'Promoter',
        body: <p>The Promoter is SLR Life Pty Ltd trading as Smart Life Rewards (SLR).</p>
    },
    {
        heading: 'Promotion',
        body: (
            <>
                <p>The promotion is the Smart Life Rewards Early Stage Member Promotion.</p>
                <p>
                    Participation in this draw is available to eligible Victorian members in accordance with these
                    Competition Rules and the Smart Life Rewards{' '}
                    <Link href='/terms' className='text-[#FFDC75] hover:underline'>
                        Terms &amp; Conditions
                    </Link>
                    .
                </p>
            </>
        )
    },
    {
        heading: 'Prize pool',
        body: (
            <>
                <Fact label='Total prize pool'>$2,100</Fact>
                <p>
                    The individual prizes making up the $2,100 prize pool will be published by Smart Life Rewards for
                    the applicable draw.
                </p>
                <p>The published prize schedule will identify the number, type and value of prizes available.</p>
            </>
        )
    },
    {
        heading: 'Promotion period',
        body: (
            <>
                <Fact label='Promotion commences'>24 August 2026</Fact>
                <Fact label='Entries close'>4 September 2026 @ 7:30 PM AEST</Fact>
                <Fact label='Draw date'>4 September 2026</Fact>
                <Fact label='Draw time'>8:00 PM AEST</Fact>
                <p>Only valid entries received before the closing time will be included in the draw.</p>
                <Fact label='Next draw cycle commences'>2 October 2026, for a 28-day cycle</Fact>
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
                        'Hold an eligible Smart Life Rewards membership;',
                        'Have an active and eligible membership at the applicable closing time; and',
                        'Comply with these Competition Rules and the Smart Life Rewards Terms & Conditions.'
                    ]}
                />
                <p>
                    Employees, officers and other persons excluded under the Smart Life Rewards Terms &amp; Conditions
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
                    Eligible members receive the applicable number of entries/chances according to their Smart Life
                    Rewards membership tier and the entry allocation applying to the draw.
                </p>
                <p>Only valid entries recorded before 7:30 PM AEST on 4 September 2026 will be included.</p>
            </>
        )
    },
    {
        heading: 'Draw method',
        body: (
            <>
                <p>Winners will be selected electronically using the TPAL digital draw system.</p>
                <p>
                    The draw will be conducted in accordance with these Competition Rules and applicable regulatory
                    requirements.
                </p>
                <Fact label='Draw date'>4 September 2026</Fact>
                <Fact label='Draw time'>8:00 PM AEST</Fact>
                <Fact label='Location'>Victoria, Australia</Fact>
                <p>
                    Each valid entry has an equal opportunity of being randomly selected, subject to the applicable
                    entry allocation and draw rules.
                </p>
            </>
        )
    },
    {
        heading: 'Winner notification & publication',
        body: (
            <>
                <p>Winners will be contacted using the details registered with Smart Life Rewards.</p>
                <p>
                    Members are responsible for keeping their name, email address, telephone number and membership
                    details accurate and up to date.
                </p>
                <p>
                    Winner details will be published on the Smart Life Rewards website and/or official social media
                    channels, subject to applicable privacy and regulatory requirements.
                </p>
            </>
        )
    },
    {
        heading: 'Prize claim & verification',
        body: (
            <>
                <p>
                    Winners may be required to verify their identity and membership eligibility before receiving a
                    prize.
                </p>
                <p>Prizes will be awarded in accordance with the published prize conditions and applicable laws.</p>
            </>
        )
    },
    {
        heading: 'Subsequent draws',
        body: (
            <>
                <p>
                    The applicable opening date, entry closing date/time, draw date/time and prize schedule will be
                    published for each subsequent Smart Life Rewards draw cycle.
                </p>
                <p>
                    These Competition Rules are to be read together with the Smart Life Rewards{' '}
                    <Link href='/terms' className='text-[#FFDC75] hover:underline'>
                        Terms &amp; Conditions
                    </Link>{' '}
                    and the prize schedule applying to the relevant draw.
                </p>
            </>
        )
    }
];

const GiveawayRulesPage = () => {
    return (
        <>
            <PageHero
                eyebrow='Legal'
                title='Competition Rules'
                description='The rules that apply to the current Smart Life Rewards prize draw.'
            />
            <LegalDoc
                lastUpdated='24 August 2026'
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
                            <DrawDetails />
                        </div>
                    </>
                }
                sections={sections}
            />
        </>
    );
};

export default GiveawayRulesPage;
