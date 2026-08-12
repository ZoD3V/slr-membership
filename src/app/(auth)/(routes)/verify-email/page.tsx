import Image from 'next/image';
import Link from 'next/link';

import VerifyEmailPanel from './components/verify-email-panel';

const VerifyEmailPage = async ({ searchParams }: { searchParams: Promise<{ token?: string }> }) => {
    const { token } = await searchParams;

    return (
        <div className='relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#131619] p-6 md:p-10'>
            <div
                aria-hidden='true'
                className='pointer-events-none absolute -top-32 -left-32 h-105 w-105 rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.30)_0%,rgba(147,51,234,0.12)_45%,transparent_75%)] mix-blend-screen blur-3xl md:h-140 md:w-140'
            />
            <div
                aria-hidden='true'
                className='pointer-events-none absolute -right-32 -bottom-32 h-105 w-105 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.08)_45%,transparent_75%)] mix-blend-screen blur-3xl md:h-140 md:w-140'
            />

            <div className='relative z-10 w-full max-w-md'>
                <div className='mb-8 flex flex-col items-center gap-3 text-center'>
                    <Link href='/'>
                        <Image
                            src='/images/slr-rewards-logo-color.webp'
                            alt='SLR Rewards'
                            width={120}
                            height={120}
                            priority
                            className='h-16 w-auto md:h-20'
                        />
                    </Link>
                    <p className='text-slr-muted text-xs font-medium tracking-[0.3em] uppercase'>Email verification</p>
                </div>

                <VerifyEmailPanel token={token ?? ''} />
            </div>
        </div>
    );
};

export default VerifyEmailPage;
