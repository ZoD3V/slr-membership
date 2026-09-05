import Image from 'next/image';

import SectionHeading from '@/components/common/section-heading';

const MoreMembersSection = () => {
    return (
        <section className='bg-slr-ink relative py-16 md:py-24'>
            <div className='mx-auto max-w-7xl px-4'>
                <div className='text-center'>
                    <SectionHeading className='xl:text-[90px]'>
                        More Members,
                        <br className='block sm:hidden' /> <span className='text-gradient-gold'>Bigger Prizes</span>
                    </SectionHeading>
                    <p className='text-slr-muted mt-3 text-center text-sm leading-relaxed md:text-base'>
                        As our community grows, so do the rewards. We unlock bigger prize pools at every membership
                        milestone!
                    </p>
                </div>

                <div
                    className='relative mx-auto mt-12 flex max-w-4xl flex-col items-start gap-4 py-6 sm:gap-6 md:gap-8 lg:mt-16'
                    style={{ borderLeft: '3px solid #C78C14' }}>
                    <div
                        className='relative z-10 flex min-w-80 items-center justify-between px-3 py-4 sm:px-6 sm:py-5'
                        style={{
                            width: '45%',
                            borderRadius: '0 12px 12px 0',
                            background: '#FFFFFF',
                            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.25)'
                        }}>
                        <div className='flex shrink-0 items-center gap-3 sm:gap-4 md:gap-6'>
                            <div className='flex shrink-0 flex-col items-center justify-center'>
                                <span className='font-bebas-neue text-3xl leading-none text-[#0A0A0A] sm:text-4xl md:text-[50px]'>
                                    Current
                                </span>
                                <span className='mt-1 text-[8px] font-semibold tracking-[0.15em] text-[#3D3D3D] uppercase sm:text-[10px] md:text-xs'>
                                    Members
                                </span>
                            </div>
                            <Image
                                src='/icons/ic-people-gold.png'
                                alt=''
                                width={70}
                                height={48}
                                className='h-10 w-auto shrink-0 object-contain sm:h-12 md:h-16'
                            />
                        </div>

                        <div
                            className='ml-auto flex shrink-0 flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-center sm:px-5 sm:py-3'
                            style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <p className='font-bebas-neue text-lg leading-tight text-white sm:text-xl md:text-2xl'>
                                Current
                                <br />
                                Prize
                            </p>
                        </div>
                    </div>

                    <div
                        className='relative z-10 flex w-full items-center justify-between px-3 py-4 sm:px-6 sm:py-5'
                        style={{
                            borderRadius: '0 12px 12px 0',
                            background: 'linear-gradient(90deg, #FFE066 0%, #F5C22E 50%, #C78C14 100%)',
                            border: '1px solid #8C660D',
                            boxShadow: '0px 10px 18px rgba(0, 0, 0, 0.35), 0px 0px 36px rgba(255, 199, 51, 0.55)'
                        }}>
                        <div className='flex shrink-0 items-center gap-3 sm:gap-4 md:gap-6'>
                            <div className='flex shrink-0 flex-col items-center justify-center'>
                                <span className='font-bebas-neue text-4xl leading-none text-[#0A0A0A] sm:text-5xl md:text-[60px]'>
                                    2000
                                </span>
                                <span className='mt-1 text-center text-[8px] leading-tight font-semibold tracking-[0.15em] text-[#3D3D3D] uppercase sm:text-[10px] md:text-xs'>
                                    And Above
                                    <br />
                                    Members
                                </span>
                            </div>
                            <Image
                                src='/icons/ic-people-black.png'
                                alt=''
                                width={70}
                                height={48}
                                className='h-10 w-auto shrink-0 object-contain sm:h-12 md:h-16'
                            />
                        </div>

                        <div
                            className='ml-auto flex shrink-0 flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-center sm:px-5 sm:py-3'
                            style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <p className='mb-0.5 text-[8px] leading-none font-semibold tracking-[0.18em] text-white/60 uppercase sm:mb-1 sm:text-[10px] md:text-xs'>
                                Target Prize
                            </p>
                            <p className='text-gradient-gold font-bebas-neue text-2xl leading-none sm:text-3xl md:text-4xl'>
                                $29,000
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MoreMembersSection;
