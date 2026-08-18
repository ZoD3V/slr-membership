import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import LogoMarquee from '@/components/common/logo-marquee';
import SectionEyebrow from '@/components/common/section-eyebrow';
import { Button } from '@/components/ui/button';
import { type Discount, getPublicDiscounts } from '@/lib/api/resources/discounts';
import { goldButtonStyle } from '@/lib/styles';

import PageHero from '../_components/page-hero';
import SavingTodaySection from '../membership/_components/saving-today-section';
import {
    Award,
    CalendarCheck,
    CreditCard,
    HeartHandshake,
    Layers,
    Map,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Ticket,
    Trophy,
    UserPlus
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'About · SLR Rewards',
    description:
        'Smart Life Rewards is an Australian membership club built to help everyday Australians beat the cost of living through weekly draws, partner discounts, and digital offers.'
};

const stats = [
    { icon: Map, label: 'States & territories', value: '8' },
    { icon: CalendarCheck, label: 'Draws per week', value: 'Up to 7' },
    { icon: Layers, label: 'Membership tiers', value: '3' },
    { icon: ShieldCheck, label: 'Backed by', value: 'TPAL' }
];

const howItWorks = [
    {
        icon: UserPlus,
        title: 'Sign up',
        body: 'Pick your tier — free Visitor, $10 Red, or $26 Premium. Tell us your state for the draw pool.'
    },
    {
        icon: Ticket,
        title: 'Get entries',
        body: 'Entries are allocated automatically after each successful monthly payment. Reset every cycle.'
    },
    {
        icon: Trophy,
        title: 'Win prizes',
        body: 'TPAL processes the draw under permit. Winners are notified by email and SMS — no claims needed.'
    },
    {
        icon: RefreshCw,
        title: 'Renew or cancel',
        body: 'Auto-renew each month at the same price, or cancel from your account any time. No fine print.'
    }
];

const values: {
    icon: typeof HeartHandshake;
    title: string;
    body: string;
    accent: 'gold' | 'red' | 'blue';
}[] = [
    {
        icon: HeartHandshake,
        title: 'Made for Australians',
        body: 'Every feature is designed around how Australians actually spend, save, and live — fuel, groceries, dining, and family essentials.',
        accent: 'gold'
    },
    {
        icon: ShieldCheck,
        title: 'Transparent & compliant',
        body: 'Draws are processed by TPAL, an independent authorised provider, so every winner is selected fairly and in line with permit requirements.',
        accent: 'red'
    },
    {
        icon: Sparkles,
        title: 'Real value, every month',
        body: 'Your membership pays for itself through partner discounts alone — prize draws and digital offers are the bonus on top.',
        accent: 'blue'
    },
    {
        icon: Award,
        title: 'No tricks, no fine print',
        body: 'Flat monthly pricing, no hidden fees, no auto-upsells. Cancel any time from your account.',
        accent: 'gold'
    }
];

const accentStyles = {
    gold: {
        wrap: 'border-[#D4AF3759]',
        bg: 'bg-gold-tint',
        text: 'text-[#FFDC75]'
    },
    red: { wrap: 'border-[#C8152E66]', bg: 'bg-[#C8152E1A]', text: 'text-[#E88888]' },
    blue: { wrap: 'border-[#2878E84D]', bg: 'bg-[#2878E81A]', text: 'text-[#6AB0F0]' }
};

const STATIC_PARTNER_LOGOS = Array.from({ length: 10 }, (_, i) => `/images/list-partner-logo-${i + 1}.webp`);

const AboutPage = async () => {
    // Real partner discount logos, same source as the membership page's
    // Community Givebacks marquee. Non-fatal → [] → falls back to the static set.
    const publicDiscounts = await getPublicDiscounts().catch(() => [] as Discount[]);
    const fetchedLogos = publicDiscounts
        .map((d) => d.logo_url?.trim())
        .filter((url): url is string => Boolean(url));
    const partnerLogos = fetchedLogos.length > 0 ? fetchedLogos : STATIC_PARTNER_LOGOS;

    return (
        <main className='bg-slr-ink'>
            <PageHero
                surface='#040404'
                eyebrow='Our Story'
                title={
                    <>
                        About <span className='text-red-600'>Smart Life</span>{' '}
                        <span className='text-gradient-gold'>Rewards</span>
                    </>
                }
                description='A homegrown rewards club, built to help everyday Australians beat the rising cost of living — one cycle at a time.'
            />

            <section className='bg-slr-ink relative py-12 md:py-20'>
                <div className='mx-auto max-w-7xl px-4'>
                    <div className='grid grid-cols-1 items-center gap-10 lg:grid-cols-2'>
                        <div className='order-2 lg:order-1'>
                            <div className='flex items-center gap-2'>
                                <div className='h-px w-12 bg-[linear-gradient(270deg,#B08A20_0%,rgba(255,255,255,0)_100%)]' />
                                <p className='text-slr-gold-label text-xs font-semibold tracking-widest uppercase md:text-sm'>
                                    Our mission
                                </p>
                            </div>
                            <h2 className='font-bebas-neue mt-3 text-3xl tracking-wider text-white uppercase md:text-5xl xl:text-6xl'>
                                Why we built <span className='text-gradient-gold'>SLR</span>
                            </h2>
                            <div className='text-slr-muted mt-5 space-y-4 text-sm leading-relaxed md:text-base'>
                                <p>
                                    Rewards programs in Australia were either tied to a single retailer or buried inside
                                    loyalty schemes nobody could actually use. Meanwhile the cost of living kept rising
                                    — fuel, groceries, energy, everything.
                                </p>
                                <p>
                                    We wanted a membership that worked the other way around. One flat monthly fee. Real
                                    discounts at the brands Australians already shop with. Weekly prize draws backed by
                                    a legally compliant provider. And the option to upgrade — or stay free — without
                                    ever being pressured.
                                </p>
                                <p>
                                    That is SLR today. A growing community of members across every state and territory,
                                    getting more value out of every dollar they already spend.
                                </p>
                            </div>
                            <div className='mt-7 flex flex-wrap gap-3'>
                                <Link href='/sign-up'>
                                    <Button
                                        style={goldButtonStyle}
                                        className='h-11 rounded-xl px-7 font-bold uppercase'>
                                        Join Now
                                    </Button>
                                </Link>
                                <Link href='/membership'>
                                    <Button
                                        variant='outline'
                                        className='h-11 rounded-xl border border-[#FFD147] bg-[#FFD1471A] px-7 font-semibold text-[#FFDC75] hover:bg-[#FFD14726] hover:text-[#FFDC75]'>
                                        Compare Plans
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className='order-1 flex justify-center lg:order-2'>
                            <div className='relative aspect-square w-full max-w-sm overflow-hidden rounded-full sm:max-w-md lg:max-w-full'>
                                <Image
                                    src='/images/smart-life.webp'
                                    alt='Australians enjoying Smart Life Rewards'
                                    fill
                                    sizes='(max-width: 1024px) 400px, 560px'
                                    className='object-cover'
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='bg-slr-ink relative py-8 md:py-12'>
                <div className='mx-auto max-w-7xl px-4'>
                    <div className='bg-card-dark-navy overflow-hidden rounded-2xl border border-[#A0B4D259] shadow-[0px_0px_20px_0px_#776D6D26]'>
                        <div className='grid grid-cols-2 divide-x divide-y divide-white/5 sm:grid-cols-4 sm:divide-y-0'>
                            {stats.map(({ icon: Icon, label, value }) => (
                                <div key={label} className='flex flex-col items-center gap-2 p-6 text-center md:p-8'>
                                    <div className='bg-gold-tint flex h-10 w-10 items-center justify-center rounded-xl border border-[#D4AF3759]'>
                                        <Icon className='h-5 w-5 text-[#FFDC75]' />
                                    </div>
                                    <p className='font-bebas-neue text-gradient-gold text-3xl font-extrabold md:text-4xl'>
                                        {value}
                                    </p>
                                    <p className='text-slr-dim text-[10px] font-semibold tracking-widest uppercase md:text-xs'>
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className='bg-slr-ink relative py-12 md:py-20'>
                <div className='mx-auto max-w-7xl px-4'>
                    <div className='text-center'>
                        <SectionEyebrow label='Member journey' color='#E2B42B' lineColor='#B08A20' />
                        <h2 className='font-bebas-neue mt-3 text-3xl tracking-wider text-white uppercase md:text-5xl'>
                            How SLR works
                        </h2>
                        <p className='text-slr-muted mx-auto mt-3 max-w-xl text-sm md:text-base'>
                            Four steps from signing up to winning. No paperwork, no claim forms — the platform handles
                            it for you.
                        </p>
                    </div>

                    <div className='mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
                        {howItWorks.map(({ icon: Icon, title, body }, idx) => (
                            <div
                                key={title}
                                className='bg-card-dark-navy relative flex flex-col rounded-2xl border border-[#A0B4D259] p-6 shadow-[0px_0px_20px_0px_#776D6D26]'>
                                <span className='font-bebas-neue text-gradient-gold absolute top-4 right-5 text-5xl font-extrabold opacity-30'>
                                    0{idx + 1}
                                </span>
                                <div className='bg-gold-tint flex h-12 w-12 items-center justify-center rounded-xl border border-[#D4AF3759]'>
                                    <Icon className='h-6 w-6 text-[#FFDC75]' />
                                </div>
                                <h3 className='font-bebas-neue mt-5 text-xl tracking-wider text-white uppercase md:text-2xl'>
                                    {title}
                                </h3>
                                <p className='text-slr-muted mt-2 text-sm leading-relaxed'>{body}</p>
                            </div>
                        ))}
                    </div>

                    <div className='text-slr-dim mt-8 flex items-center justify-center gap-2 text-xs'>
                        <CreditCard className='h-3.5 w-3.5' />
                        <span>Payments processed securely by Stripe. Draws conducted under permit by TPAL.</span>
                    </div>
                </div>
            </section>

            <section className='bg-slr-ink relative py-12 md:py-20'>
                <div className='mx-auto max-w-7xl px-4'>
                    <div className='text-center'>
                        <SectionEyebrow label='Our principles' color='#E2B42B' lineColor='#B08A20' />
                        <h2 className='font-bebas-neue mt-3 text-3xl tracking-wider text-white uppercase md:text-5xl'>
                            What we stand for
                        </h2>
                        <p className='text-slr-muted mx-auto mt-3 max-w-xl text-sm md:text-base'>
                            Four principles guide every decision we make about features, pricing, and partnerships.
                        </p>
                    </div>

                    <div className='mt-12 grid grid-cols-1 gap-5 md:grid-cols-2'>
                        {values.map(({ icon: Icon, title, body, accent }) => {
                            const s = accentStyles[accent];

                            return (
                                <div
                                    key={title}
                                    className='bg-card-dark-navy flex items-start gap-4 rounded-2xl border border-[#A0B4D259] p-6 shadow-[0px_0px_20px_0px_#776D6D26] md:p-7'>
                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${s.wrap} ${s.bg}`}>
                                        <Icon className={`h-6 w-6 ${s.text}`} />
                                    </div>
                                    <div>
                                        <h3 className='font-bebas-neue text-xl tracking-wider text-white uppercase md:text-2xl'>
                                            {title}
                                        </h3>
                                        <p className='text-slr-muted mt-1 text-sm leading-relaxed'>{body}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className='bg-slr-ink relative py-12 md:py-16'>
                <div className='mx-auto max-w-7xl px-4'>
                    <div className='text-center'>
                        <SectionEyebrow label='Trusted by' color='#E2B42B' lineColor='#B08A20' />
                        <p className='text-slr-muted mx-auto mt-3 max-w-xl text-sm md:text-base'>
                            Australian brands that work with SLR to bring members real, everyday value.
                        </p>
                    </div>

                    <div className='mt-10'>
                        <LogoMarquee
                            logos={partnerLogos.map((src, idx) => ({ src, alt: `Partner Logo ${idx + 1}` }))}
                        />
                    </div>
                </div>
            </section>

            <SavingTodaySection />
        </main>
    );
};

export default AboutPage;
