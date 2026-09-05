import Image from 'next/image';
import Link from 'next/link';

import AnchorLink from '@/components/common/anchor-link';
import GoldCtaButton from '@/components/common/gold-cta-button';
import SectionEyebrow from '@/components/common/section-eyebrow';
import SectionHeading from '@/components/common/section-heading';
import { Button } from '@/components/ui/button';

const MembershipCtaSection = () => {
    return (
        <section id='join' className='bg-slr-navy-deep relative overflow-hidden'>
            <Image src='/images/pattern-cta-background.png' alt='SLR Hero Background' fill className='object-cover' />
            <div className='sm:140 md:150 lg:160 relative mx-auto flex h-130 max-w-4xl flex-col items-center justify-center px-4 text-center xl:h-170.5'>
                <div className='text-center'>
                    <SectionEyebrow label='LIFETIME OPTION' color='#E2B42B' className='mt-4' />

                    <SectionHeading className='mt-2 text-[42px] leading-none tracking-widest md:text-[50px] lg:text-[60px]'>
                        <span className='text-gradient-gold font-extrabold'>SMART LIFE REWARDS</span>
                        <br />
                        Membership <span className='text-gradient-gold font-extrabold'>4</span> LIFE
                    </SectionHeading>
                </div>

                <div className='mt-8 flex w-full flex-col items-center justify-center gap-4 md:flex-row'>
                    <GoldCtaButton className='w-full md:w-fit' href='/sign-up'>
                        JOIN NOW - IT`S FREE TO START
                    </GoldCtaButton>

                    <AnchorLink href='#tiers' className='w-full md:w-fit'>
                        <Button
                            variant='outline'
                            className='h-11 w-full rounded-xl border border-[#FFD147] bg-[#FFD1471A] font-semibold text-[#FFDC75] shadow-[inset_0px_8px_12px_0px_#FFFFFF14,inset_16px_24px_64px_-24px_#FFFFFF14,0px_24px_24px_-16px_#0000001F] transition-all hover:bg-[#FFD14726] hover:text-[#FFDC75] active:scale-[0.98]'>
                            View All Plans
                        </Button>
                    </AnchorLink>
                </div>
            </div>
        </section>
    );
};

export default MembershipCtaSection;
