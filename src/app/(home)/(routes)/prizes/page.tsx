import Image from 'next/image';

import { getPublicPrizeContent } from '@/lib/api/resources/prizes';
import type { PrizeContent } from '@/types/member';

import WelcomeSection from '../(membership)/_components/welcome-section';
import MembershipClubSection from './_components/membership-club-section';
import RedBlueSection from './_components/red-blue-section';
import SlrLifeTiersSection from './_components/slr-life-tiers-section';
import { PUBLIC_PRIZE_FALLBACK } from './fallback';

const Page = async () => {
    let content: PrizeContent = PUBLIC_PRIZE_FALLBACK;

    try {
        content = await getPublicPrizeContent();
    } catch {
        void 0;
    }

    return (
        <main className='bg-slr-ink pt-12'>
            <div className='relative isolate overflow-hidden'>
                <div className='absolute top-0 right-0 left-0 -z-20 h-[800px] md:h-[900px]'>
                    <Image
                        src='/images/bg-membership-club.webp'
                        alt=''
                        fill
                        className='object-cover object-top opacity-45'
                        priority
                    />

                    <div className='from-slr-ink via-slr-ink/75 absolute right-0 bottom-0 left-0 h-64 bg-gradient-to-t to-transparent md:h-80' />
                </div>

                <MembershipClubSection content={content} />
                <RedBlueSection content={content} />
            </div>

            <WelcomeSection />
            <SlrLifeTiersSection />
        </main>
    );
};

export default Page;
