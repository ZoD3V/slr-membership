import Image from 'next/image';

import { type Discount, getPublicDiscounts } from '@/lib/api/resources/discounts';

import FreeVisitorsSection from './_components/free-visitors-section';
import HeroSection from './_components/hero-section';
import MerchandiseSection from './_components/merchandise-section';
import PartnersSection from './_components/partners-section';
import SavingTiersSection from './_components/saving-tiers-section';
import SlrRedBlueTiersSpinWheelSection from './_components/slr-red-blue-tiers-spin-wheel-section';
import SlrRewardCarsSection from './_components/slr-reward-cars-section';
import TrustedSection from './_components/trusted-section';
import WelcomeSection from './_components/welcome-section';
import WhyJoinSection from './_components/why-join-section';

const MembershipPage = async () => {
    const publicDiscounts = await getPublicDiscounts().catch(() => [] as Discount[]);
    const partnerLogos = publicDiscounts.map((d) => d.logo_url?.trim()).filter((url): url is string => Boolean(url));

    return (
        <main className='bg-slr-ink min-h-screen'>
            <HeroSection />
            <div className='relative'>
                <WelcomeSection />
                <div className='pointer-events-none absolute top-[55%] right-0 z-20 hidden -translate-y-1/2 xl:block'>
                    <Image
                        src='/images/grid-decoration.webp'
                        alt='Grid Decoration'
                        width={550}
                        height={550}
                        className='object-contain'
                    />
                </div>
                <WhyJoinSection />
            </div>
            <SlrRewardCarsSection />
            <FreeVisitorsSection />
            <SlrRedBlueTiersSpinWheelSection />
            <TrustedSection />
            <SavingTiersSection />
            <PartnersSection logos={partnerLogos} />
            <MerchandiseSection />
        </main>
    );
};

export default MembershipPage;
