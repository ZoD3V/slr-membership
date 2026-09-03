import { auth } from '@/auth';
import Footer from '@/components/common/footer';
import { Navbar } from '@/components/common/navbar';
import { getTierPricing, minPriceOf } from '@/lib/tier-pricing';

import ReactLenis from 'lenis/react';

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
    const [session, pricing] = await Promise.all([auth(), getTierPricing()]);

    return (
        <ReactLenis root>
            <Navbar user={session} />
            {children}
            <Footer redFrom={minPriceOf(pricing, 'red') / 100} blueFrom={minPriceOf(pricing, 'blue') / 100} />
        </ReactLenis>
    );
}
