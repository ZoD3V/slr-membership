import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://smartliferewards.com.au';
    
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/member/']
        },
        sitemap: `${baseUrl}/sitemap.xml`
    };
}
