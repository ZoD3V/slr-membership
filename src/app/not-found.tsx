import type { Metadata } from 'next';

import GoldCtaButton from '@/components/common/gold-cta-button';
import SectionEyebrow from '@/components/common/section-eyebrow';

export const metadata: Metadata = {
    title: 'Page Not Found · SLR Rewards',
    description: 'The page you are looking for does not exist.'
};

export default function NotFound() {
    return (
        <main className='slr-stars-bg bg-slr-navy-deep relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24 text-center'>
            <SectionEyebrow label='Error 404' color='#E2B42B' lineColor='#B08A20' />

            <p className='font-bebas-neue mt-6 bg-[linear-gradient(89.12deg,#F5D78E_3.07%,#D4AF37_41.36%,#FFE066_60.5%,#A07018_98.79%)] bg-clip-text text-[110px] leading-none tracking-wider text-transparent uppercase sm:text-[150px] md:text-[200px]'>
                404
            </p>

            <h1 className='font-bebas-neue mt-2 text-3xl tracking-wider text-white uppercase md:text-5xl'>
                Page Not Found
            </h1>

            <p className='text-slr-muted mt-4 max-w-md text-sm md:text-base'>
                The page you are looking for was moved, removed, or never existed.
            </p>

            <div className='mt-8 w-full max-w-xs'>
                <GoldCtaButton href='/'>Back to Home</GoldCtaButton>
            </div>

            {/* Bottom fade into the deep navy base */}
            <div className='pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(19,22,25,0)_0%,#131619_100%)]' />
        </main>
    );
}
