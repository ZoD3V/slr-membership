'use client';

import { useEffect, useState } from 'react';

const RELOAD_KEY = 'slr_error_reloaded_at';
const RELOAD_COOLDOWN_MS = 15_000;

function Spinner() {
    return (
        <svg width='40' height='40' viewBox='0 0 40 40' fill='none' aria-hidden='true'>
            <circle cx='20' cy='20' r='16' stroke='#FFFFFF22' strokeWidth='4' />
            <path d='M20 4a16 16 0 0 1 16 16' stroke='#E2B42B' strokeWidth='4' strokeLinecap='round'>
                <animateTransform
                    attributeName='transform'
                    type='rotate'
                    from='0 20 20'
                    to='360 20 20'
                    dur='0.8s'
                    repeatCount='indefinite'
                />
            </path>
        </svg>
    );
}

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const [reloading] = useState(() => {
        if (typeof window === 'undefined') return false;
        const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);

        return Date.now() - last > RELOAD_COOLDOWN_MS;
    });

    useEffect(() => {
        console.error(error);
        if (!reloading) return;

        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
        window.location.reload();
    }, [reloading, error]);

    return (
        <html lang='en'>
            <body
                style={{
                    margin: 0,
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#131619',
                    color: '#fff',
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif'
                }}>
                {reloading ? (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 20,
                            padding: 24,
                            textAlign: 'center'
                        }}>
                        <img
                            src='/images/slr-rewards-logo.webp'
                            alt='SLR Rewards'
                            width={160}
                            style={{ height: 32, width: 'auto', opacity: 0.9 }}
                        />
                        <Spinner />
                        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Updating to the latest version…</h1>
                        <p style={{ fontSize: 13, color: '#ADB0B5', margin: 0 }}>This only takes a moment.</p>
                    </div>
                ) : (
                    <div style={{ maxWidth: 420, padding: 24, textAlign: 'center' }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Something went wrong</h1>
                        <p style={{ fontSize: 14, color: '#ADB0B5', margin: '0 0 20px' }}>
                            An unexpected error occurred. Please try again.
                        </p>
                        <button
                            type='button'
                            onClick={() => reset()}
                            style={{
                                height: 44,
                                padding: '0 24px',
                                borderRadius: 12,
                                border: 'none',
                                background: 'linear-gradient(89deg,#F5D78E,#D4AF37 41%,#FFE066 60%,#A07018)',
                                color: '#1a1408',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}>
                            Try again
                        </button>
                    </div>
                )}
            </body>
        </html>
    );
}
