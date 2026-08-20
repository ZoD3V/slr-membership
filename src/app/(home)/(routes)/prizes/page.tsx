import Image from 'next/image';

import WelcomeSection from '../(membership)/_components/welcome-section';
import MembershipClubSection from './_components/membership-club-section';
import SlrLifeTiersSection from './_components/slr-life-tiers-section';
import VisitorRedBlueSection from './_components/visitor-red-blue-section';

const Page = () => {
    return (
        <main className='bg-slr-ink pt-12'>
            {/* Background wrapper that contains both MembershipClubSection and VisitorRedBlueSection */}
            <div className='relative isolate overflow-hidden'>
                {/* Background image container with fixed height and bottom fade */}
                <div className='absolute top-0 left-0 right-0 h-[650px] -z-20'>
                    <Image
                        src='/images/bg-membership-club.webp'
                        alt=''
                        fill
                        className='object-cover opacity-25 object-top'
                        priority
                    />
                    {/* Fade/blur gradient at the bottom of the background image */}
                    <div className='absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slr-ink via-slr-ink/75 to-transparent' />
                </div>
                
                <MembershipClubSection />
                <VisitorRedBlueSection />
            </div>

            <WelcomeSection />
            <SlrLifeTiersSection />
        </main>
    );
};

export default Page;