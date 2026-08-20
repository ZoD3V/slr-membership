import Image from 'next/image';

import { GOLD_GRADIENT } from '@/lib/styles';
import { cn } from '@/lib/utils';

const clubGradient = 'linear-gradient(180deg, #73470A 0%, #FFD44D 30%, #FFFFD9 50%, #F2B32E 70%, #664008 100%)';

const clubGlow =
    'drop-shadow(0px 12px 20px #000000B2) drop-shadow(0px 0px 50px #FFB2338C) drop-shadow(0px 0px 100px #FFB2334D)';

const bars = [
    { members: '100', prize: '$2,100', heightPct: 48 },
    { members: '200', prize: '$3,260', heightPct: 56 },
    { members: '300', prize: '$4,220', heightPct: 64 },
    { members: '400', prize: '$5,760', heightPct: 74 },
    { members: '500', prize: '$6,880', heightPct: 82 },
    { members: '1000', prize: '$12,100', heightPct: 90 },
    { members: '2000', prize: '$24,000', heightPct: 100, sub: 'And Above', highlight: true }
];

const MembershipClubSection = () => {
    return (
        <section className='relative isolate overflow-hidden py-16 md:py-24'>
            <Image
                src='/images/bg-membership-club.webp'
                alt=''
                fill
                className='absolute inset-0 -z-10 object-cover opacity-30'
                priority
            />
            <div className='mx-auto max-w-3xl px-4 text-center relative z-10'>
                <h2 className='font-bebas-neue leading-[0.85] tracking-wide uppercase'>
                    <span className='text-gradient-silver block text-4xl sm:text-5xl md:text-6xl'>Membership</span>
                    <span
                        className='block bg-clip-text text-6xl text-transparent sm:text-7xl md:text-[112px]'
                        style={{ backgroundImage: clubGradient, filter: clubGlow }}>
                        Club
                    </span>
                </h2>

                <div className='mx-auto mt-12 w-full max-w-6xl'>
                    <p className='text-gradient-gold text-sm font-bold tracking-[0.3em] text-center uppercase sm:text-base mb-6'>
                        Prize Pool
                    </p>
                    <div className='relative'>
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
            </div>
        </section>
    );
};

export default MembershipClubSection;
