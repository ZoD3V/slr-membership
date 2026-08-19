import type { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

type FooterLink = { name: string; href: string };

const navigationLinks: FooterLink[] = [
    { name: 'Home', href: '/' },
    { name: 'Membership', href: '/membership' },
    { name: 'Prizes', href: '/prizes' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
];

const membershipLinks: FooterLink[] = [
    { name: 'Join Free', href: '/sign-up' },
    { name: 'SLR Red — $10/mo', href: '/membership' },
    { name: 'SLR Blue — from $26/mo', href: '/membership' },
    { name: 'Membership 4 Life', href: '/membership' },
    { name: 'Compare Tiers', href: '/#tiers' }
];

const supportLinks: FooterLink[] = [
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact Us', href: '/contact' }
];

const socials = [
    {
        icon: '/icons/ic-facebook.png',
        label: 'Facebook',
        href: 'https://www.facebook.com/share/1CcxZ86yHn/?mibextid=wwXIfr'
    },
    { icon: '/icons/ic-instagram.png', label: 'Instagram', href: 'https://www.instagram.com/smartliferewards' },
    { icon: '/icons/ic-tiktok.png', label: 'TikTok', href: 'www.tiktok.com/@smartlife.rewards' }
];

const apps = [
    { icon: '/icons/ic-apple.png', tagline: 'Download on the', name: 'App Store', href: '#' },
    { icon: '/icons/ic-play-store.png', tagline: 'Get it on', name: 'Google Play', href: '#' }
];

const LinkColumn: FC<{ heading: string; links: FooterLink[] }> = ({ heading, links }) => (
    <div>
        <h3 className='text-slr-gold-label text-xs font-bold tracking-widest uppercase'>{heading}</h3>
        <ul className='mt-5 space-y-3.5'>
            {links.map((link) => (
                <li key={link.name}>
                    <Link href={link.href} className='hover:text-slr-gold text-slr-muted text-sm transition-colors'>
                        {link.name}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
);

const Footer: FC = () => {
    return (
        <footer className='bg-slr-ink relative'>
            {/* Gold top hairline */}
            <div className='h-px w-full bg-[linear-gradient(90deg,rgba(176,138,32,0)_0%,#B08A20_50%,rgba(176,138,32,0)_100%)]' />

            <div className='mx-auto max-w-7xl px-6 py-14'>
                <div className='grid grid-cols-1 gap-10 lg:grid-cols-12'>
                    {/* Brand + socials */}
                    <div className='lg:col-span-3'>
                        <Image
                            src='/images/slr-rewards-logo-color.webp'
                            alt='SLR Smart Life Rewards'
                            width={140}
                            height={56}
                            className='h-12 w-auto'
                        />
                        <p className='text-slr-muted mt-5 max-w-sm text-sm leading-relaxed'>
                            Australia&apos;s Best Value Rewards Club — helping Australians beat the cost of living.
                        </p>

                        <h3 className='text-slr-gold-label mt-8 text-xs font-bold tracking-widest uppercase'>
                            Follow Us
                        </h3>
                        <div className='mt-4 flex items-center gap-3'>
                            {socials.map((social) => (
                                <Link target='_blank' key={social.label} href={social.href} aria-label={social.label}>
                                    <Image
                                        src={social.icon}
                                        alt=''
                                        width={44}
                                        height={44}
                                        className='h-11 w-11 transition-opacity hover:opacity-80'
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Navigation: 2 columns on mobile, single row on desktop */}
                    <div className='grid grid-cols-2 gap-x-6 gap-y-10 lg:col-span-9 lg:grid-cols-7 lg:gap-10'>
                        <div className='lg:col-span-2'>
                            <LinkColumn heading='Navigation' links={navigationLinks} />
                        </div>
                        <div className='lg:col-span-3'>
                            <LinkColumn heading='Membership' links={membershipLinks} />
                        </div>
                        <div className='lg:col-span-2'>
                            <LinkColumn heading='Support' links={supportLinks} />
                        </div>
                    </div>
                </div>
            </div>
            <div className='h-px w-full bg-[linear-gradient(90deg,rgba(176,138,32,0)_0%,#B08A20_50%,rgba(176,138,32,0)_100%)]' />

            {/* Copyright */}
            <p className='mx-auto max-w-7xl px-6 py-6 text-center text-xs text-[#8A8A8F]'>
                © {new Date().getFullYear()} Smart Life Rewards Pty Ltd. All rights reserved. Australian Owned &amp;
                Operated.
            </p>
        </footer>
    );
};

export default Footer;
