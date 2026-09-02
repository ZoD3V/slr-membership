import { type Discount, getPublicDiscounts } from '@/lib/api/resources/discounts';

import CurrentPrizesSection from './_components/current-prizes-section';
import DrawCountdownSection from './_components/draw-countdown-section';
import HeroSection from './_components/hero-section';
import HowItWorksSection from './_components/how-it-works-section';
import MoreMembersSection from './_components/more-members-section';
import PartnersSection from './_components/partners-section';
import SavingTiersSection from './_components/saving-tiers-section';
import SlrRedBlueTiersSpinWheelSection from './_components/slr-red-blue-tiers-spin-wheel-section';
import TrustedSection from './_components/trusted-section';

const MembershipPage = async () => {
    const publicDiscounts = await getPublicDiscounts().catch(() => [] as Discount[]);
    const partnerLogos = publicDiscounts.map((d) => d.logo_url?.trim()).filter((url): url is string => Boolean(url));

    return (
        <main className='bg-slr-ink min-h-screen'>
            <HeroSection />
            <HowItWorksSection />
            <CurrentPrizesSection />
            <PartnersSection logos={partnerLogos} />
            <MoreMembersSection />
            <TrustedSection />
            <SlrRedBlueTiersSpinWheelSection />
            <SavingTiersSection />
            <DrawCountdownSection />
        </main>
    );
};

export default MembershipPage;
