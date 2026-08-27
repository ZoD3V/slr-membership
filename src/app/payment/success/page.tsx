import type { Metadata } from 'next';

import { ActivationStatus } from './_components/activation-status';

export const metadata: Metadata = {
    title: 'Payment Successful',
    robots: { index: false }
};

export default function PaymentSuccessPage() {
    return (
        <main className='dark bg-slr-ink flex min-h-svh flex-col items-center justify-center px-4 py-12'>
            <ActivationStatus />
        </main>
    );
}
