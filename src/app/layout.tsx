import type { ReactNode } from 'react';

import type { Metadata } from 'next';
import { Bebas_Neue, Montserrat } from 'next/font/google';
import { headers } from 'next/headers';

import '@/app/globals.css';
import { VersionWatcher } from '@/components/common/version-watcher';
import { Toaster } from '@/components/ui/sonner';
import { getOrganizationSchema, getWebSiteSchema } from '@/lib/seo/structured-data';
import { GoogleAnalytics } from '@next/third-parties/google';

const montserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-montserrat',
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

const bebasNeue = Bebas_Neue({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-bebas-neue',
    weight: '400'
});

const siteName = 'Smart Life Rewards';
const siteDescription =
    "Australia's best-value rewards club. Weekly state-based draws, partner discounts, e-books and digital offers — Visitor (free), SLR Red ($10/mo) and SLR Premium ($26/mo).";
const ogImage = '/images/background-metadata.webp';

export async function generateMetadata(): Promise<Metadata> {
    const headersList = await headers();
    const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'smartliferewards.com.au';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';

    const dynamicSiteUrl = `${protocol}://${host}`;

    return {
        metadataBase: new URL(dynamicSiteUrl),
        title: {
            default: `${siteName} — Australia's Best Value Rewards Club`,
            template: `%s · ${siteName}`
        },
        description: siteDescription,
        applicationName: siteName,
        keywords: ['Smart Life Rewards', 'SLR', 'rewards club', 'membership', 'weekly draws', 'discounts', 'Australia'],
        alternates: { canonical: '/' },
        openGraph: {
            type: 'website',
            siteName,
            locale: 'en_AU',
            url: '/',
            title: `${siteName} — Australia's Best Value Rewards Club`,
            description: siteDescription,
            images: [
                {
                    url: ogImage,
                    width: 2730,
                    height: 1186,
                    alt: `${siteName} — membership rewards club`
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title: `${siteName} — Australia's Best Value Rewards Club`,
            description: siteDescription,
            images: [ogImage]
        },
        verification: {
            google: 'google-site-verification-placeholder-code'
        }
    };
}

const Layout = ({ children }: Readonly<{ children: ReactNode }>) => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;

    return (
        <html suppressHydrationWarning lang='en'>
            <head>
                <script
                    type='application/ld+json'
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(getOrganizationSchema())
                    }}
                />
                <script
                    type='application/ld+json'
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(getWebSiteSchema())
                    }}
                />
            </head>
            <body
                suppressHydrationWarning
                className={`${montserrat.variable} ${bebasNeue.variable} text-foreground bg-slr-ink overscroll-none antialiased`}>
                {children}
                <Toaster />
                <VersionWatcher />
                {gaId && <GoogleAnalytics gaId={gaId} />}
            </body>
        </html>
    );
};

export default Layout;
