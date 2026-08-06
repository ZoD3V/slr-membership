import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://smartliferewards.com.au';
    
    // Static public routes
    const routes = [
        '',
        '/membership',
        '/prizes',
        '/about',
        '/faq',
        '/contact',
        '/sign-in',
        '/sign-up',
        '/giveaway-rules',
        '/privacy',
        '/terms',
        '/disclaimer'
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString().split('T')[0],
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8
    }));
}
