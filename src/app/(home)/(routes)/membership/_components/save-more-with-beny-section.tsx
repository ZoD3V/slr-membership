import type { CSSProperties } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { BENY_MONTHLY_PRICE } from '@/constant/tiers';

const goldPillStyle: CSSProperties = {
    background: 'linear-gradient(119.74deg, #FFE8A3 16.57%, #F1C94F 94.27%)'
};

const apps = [
    { icon: '/icons/ic-apple.png', tagline: 'Download on the', name: 'App Store', href: '#' },
    { icon: '/icons/ic-play-store.png', tagline: 'Get it on', name: 'Google Play', href: '#' }
];

const SaveMoreWithBenySection = () => {
    return (
        <section className='bg-slr-ink relative isolate overflow-hidden py-16 md:py-24'>
            <div
                aria-hidden='true'
                className='pointer-events-none absolute top-1/2 left-1/2 -z-10 h-105 w-105 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(190,40,120,0.35)_0%,transparent_70%)] blur-3xl'
            />

            <div className='mx-auto max-w-7xl px-4'>
                <div className='grid grid-cols-1 items-center gap-10 lg:grid-cols-2'>
                    <div>
                        <div className='flex items-center gap-3'>
                            <span className='text-sm font-semibold tracking-[0.25em] text-white uppercase'>
                                Save More With
                            </span>
                            <span
                                style={goldPillStyle}
                                className='rounded-full px-3 py-1 text-[11px] font-bold tracking-wider text-[#0C1132] uppercase'>
                                Add-ons {`$${BENY_MONTHLY_PRICE}`}
                            </span>
                        </div>

                        <div className='relative mt-5 inline-block'>
                            <span className='block bg-[linear-gradient(91deg,#F4A6C0_0%,#ED5C97_45%,#E0309A_100%)] bg-clip-text text-[88px] leading-none font-extrabold text-transparent sm:text-[112px] lg:text-[128px]'>
                                Beny
                            </span>
                            <span
                                aria-hidden='true'
                                className='absolute top-1 -right-5 h-5 w-7 rotate-[-50deg] rounded-[50%] bg-[#FFD52E] md:top-3 md:-right-5 md:h-6 md:w-8'
                            />
                        </div>

                        <p className='mt-4 max-w-md text-sm leading-relaxed text-white md:text-base'>
                            Beny is a benefits app that provides you access to thousands of exclusive perks and insights
                            that enhance your physical, mental, social, and financial wellbeing.
                        </p>

                        <h2 className='font-bebas-neue mt-10 text-2xl tracking-wide text-white uppercase md:text-3xl'>
                            Start Redeeming Benefits Today
                        </h2>
                        <p className='text-slr-muted mt-3 max-w-md text-sm leading-relaxed'>
                            Ready to meet your new friend with benefits? Download Beny on your smartphone and enjoy
                            instant access to thousands of valuable perks and insightful content, available for all
                            tiers except Standard.
                        </p>

                        <div className='mt-6 flex flex-wrap gap-3'>
                            {apps.map((app) => (
                                <Link
                                    key={app.name}
                                    href={app.href}
                                    className='inline-flex items-center gap-3 rounded-xl border border-[#2A2D31] bg-[#16191D] px-5 py-3 transition-colors hover:border-[#403314]'>
                                    <Image src={app.icon} alt='' width={24} height={24} className='h-6 w-6 shrink-0' />
                                    <span className='leading-tight'>
                                        <span className='text-slr-muted block text-[10px] tracking-wider uppercase'>
                                            {app.tagline}
                                        </span>
                                        <span className='block text-sm font-bold text-white'>{app.name}</span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className='flex justify-center lg:justify-end'>
                        <Image
                            src='/images/slr-handphone.webp'
                            alt='Beny benefits app on a smartphone'
                            width={601}
                            height={712}
                            className='h-auto w-full max-w-150.25'
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SaveMoreWithBenySection;
