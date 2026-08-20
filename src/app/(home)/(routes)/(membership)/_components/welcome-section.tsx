import Image from 'next/image';

import SectionEyebrow from '@/components/common/section-eyebrow';
import { cn } from '@/lib/utils';

const bars = [
    { members: '100', prize: '$2,100', heightPct: 48 },
    { members: '200', prize: '$3,260', heightPct: 56 },
    { members: '300', prize: '$4,220', heightPct: 64 },
    { members: '400', prize: '$5,760', heightPct: 74 },
    { members: '500', prize: '$6,880', heightPct: 82 },
    { members: '1000', prize: '$12,100', heightPct: 90 },
    { members: '2000', prize: '$24,000', heightPct: 100, sub: 'And Above', highlight: true }
];

const highlights = [
    { title: 'Visitor, Red, Blue', subtitle: 'Tier separated draw pool' },
    { title: 'Up to $24,000', subtitle: 'Monthly bonus pool' },
    { title: 'Weekly Draw', subtitle: '18 draws per month' }
];

const WelcomeSection = () => {
    return (
        <section className='bg-slr-ink relative py-16 md:py-24'>
            <div className='mx-auto max-w-7xl px-4'>
                <div className='text-center'>
                    <SectionEyebrow
                        label="Australia's Best Value Rewards Club"
                        color='#E2B42B'
                        lineColor='#B08A20'
                        className='mt-5'
                    />
                    <h2 className='font-bebas-neue mt-3 text-center text-[40px] leading-none font-medium tracking-wider text-white uppercase sm:text-[56px] md:text-[72px] xl:text-[90px] xl:leading-22.5'>
                        Members <span className='text-gradient-gold inline-block'>PARTICIPATION LEVELS</span>
                    </h2>
                    <p className='text-slr-muted mt-3 text-center text-sm leading-relaxed md:text-base'>
                        Join thousands of Australians saving more, winning more, and living smarter — every week.
                    </p>
                </div>

                <div className='mx-auto mt-10 grid w-full max-w-6xl grid-cols-3 items-center md:mt-14'>
                    {highlights.map((item, i) => (
                        <div
                            key={item.title}
                            className={cn(
                                'px-2 py-4 text-center sm:px-4 md:px-6 md:py-6',
                                i > 0 && 'border-l border-[#403314]'
                            )}>
                            <h3 className='text-gradient-gold font-bebas-neue text-lg leading-none tracking-wider uppercase sm:text-xl md:text-3xl lg:text-4xl xl:text-[44px]'>
                                {item.title}
                            </h3>
                            <p className='text-slr-muted mt-2 text-[9px] font-semibold tracking-[0.18em] uppercase sm:text-[11px] md:mt-3 md:text-xs lg:text-sm'>
                                {item.subtitle}
                            </p>
                        </div>
                    ))}
                </div>

                <div className='relative mt-12 lg:mt-16'>
                    <div className='mx-auto flex h-80 w-full max-w-6xl items-end justify-center sm:h-110 md:h-140 lg:h-155'>
                        <div className='grid h-full w-full grid-cols-7 items-end gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-4'>
                            {bars.map((bar) => (
                                <div
                                    key={bar.members}
                                    className='flex flex-col items-center justify-between px-1.5 pt-3 pb-2 sm:px-2 sm:pt-4 sm:pb-2.5 md:px-2.5 md:pt-5 md:pb-3 lg:px-2.5 lg:pt-5.5 lg:pb-3.5'
                                    style={{
                                        height: `${bar.heightPct}%`,
                                        borderRadius: '12px 12px 0 0',
                                        ...(bar.highlight
                                            ? {
                                                  background:
                                                      'linear-gradient(180deg, #FFE066 0%, #F5C22E 50%, #C78C14 100%)',
                                                  border: '1px solid #8C660D',
                                                  boxShadow:
                                                      '0px 10px 18px rgba(0, 0, 0, 0.35), 0px 0px 36px rgba(255, 199, 51, 0.55)'
                                              }
                                            : {
                                                  background: '#FFFFFF',
                                                  boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.25)'
                                              })
                                    }}>
                                    <div className='flex flex-col items-center gap-0.5 sm:gap-1.5 md:gap-2'>
                                        <span className='font-bebas-neue text-lg leading-none text-[#0A0A0A] sm:text-3xl md:text-4xl lg:text-5xl'>
                                            {bar.members}
                                        </span>
                                        <span className='text-[5px] font-semibold tracking-[0.15em] text-[#3D3D3D] uppercase sm:text-[7px] md:text-[9px] lg:text-[10px] xl:text-xs'>
                                            {bar.sub ?? 'Members'}
                                        </span>
                                        <Image
                                            src={
                                                bar.highlight
                                                    ? '/icons/ic-people-black.png'
                                                    : '/icons/ic-people-gold.png'
                                            }
                                            alt=''
                                            width={70}
                                            height={48}
                                            className='mt-0.5 h-4 w-6 object-contain sm:mt-1.5 sm:h-5 sm:w-7 md:h-7 md:w-10 lg:h-10 lg:w-14 xl:h-12 xl:w-17.5'
                                        />
                                    </div>
                                    <div className='w-full rounded-md bg-black px-1 py-1.5 text-center sm:rounded-lg sm:px-2 sm:py-2 md:py-2.5'>
                                        <p className='text-[5px] font-semibold tracking-[0.18em] text-white/60 uppercase sm:text-[8px] md:text-[10px]'>
                                            Total Prize /Mo
                                        </p>
                                        <p
                                            className={cn(
                                                'font-bebas-neue mt-0.5 text-[12px] leading-none sm:text-sm md:text-lg lg:text-xl xl:text-2xl',
                                                bar.highlight ? 'text-gradient-gold' : 'text-white'
                                            )}>
                                            {bar.prize}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='absolute right-0 bottom-0 left-0 h-px bg-[#403314]' />
                </div>
            </div>
        </section>
    );
};

export default WelcomeSection;
