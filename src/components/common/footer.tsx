'use client';

import type { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAnchorScroll } from '@/hooks/use-anchor-scroll';

import { useLenis } from 'lenis/react';
import { ArrowUp } from 'lucide-react';

type FooterLink = { name: string; href: string };

const navigationLinks: FooterLink[] = [
    { name: 'Home', href: '/' },
    { name: 'Membership', href: '/membership' },
    { name: 'Prizes', href: '/#current-prizes' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
];

const buildMembershipLinks = (redFrom: number, blueFrom: number): FooterLink[] => [
    { name: 'Join Now', href: '/sign-up' },
    { name: `SLR Red — from $${redFrom}/4 weeks`, href: '/membership' },
    { name: `SLR Blue — from $${blueFrom}/4 weeks`, href: '/membership' },
    { name: 'Compare Tiers', href: '/membership' }
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
    { icon: '/icons/ic-tiktok.png', label: 'TikTok', href: 'https://www.tiktok.com/@smartlife.rewards' }
];

const LinkColumn: FC<{
    heading: string;
    links: FooterLink[];
    onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}> = ({ heading, links, onLinkClick }) => (
    <div>
        <h3 className='text-slr-gold-label text-xs font-bold tracking-widest uppercase'>{heading}</h3>
        <ul className='mt-5 space-y-3.5'>
            {links.map((link) => (
                <li key={link.name}>
                    <Link
                        href={link.href}
                        onClick={(e) => onLinkClick(e, link.href)}
                        className='hover:text-slr-gold text-slr-muted text-sm transition-colors'>
                        {link.name}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
);

const Footer: FC<{ redFrom: number; blueFrom: number }> = ({ redFrom, blueFrom }) => {
    const membershipLinks = buildMembershipLinks(redFrom, blueFrom);
    const pathname = usePathname();
    const lenis = useLenis();
    const scrollToAnchor = useAnchorScroll();

    const scrollToTop = () => {
        if (lenis) {
            lenis.scrollTo(0, {
                duration: 1.2,
                easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) {
            return;
        }

        const [targetPath, targetHash] = href.split('#');
        const isCurrentPath = !targetPath || targetPath === pathname || (targetPath === '/' && pathname === '/');

        if (targetHash) {
            if (isCurrentPath && !document.getElementById(targetHash)) {
                e.preventDefault();
                scrollToTop();
            } else {
                scrollToAnchor(e, href);
            }

            return;
        }

        if (isCurrentPath) {
            e.preventDefault();
            scrollToTop();
        }
    };

    return (
        <footer className='bg-slr-ink relative'>
            <div className='h-px w-full bg-[linear-gradient(90deg,rgba(176,138,32,0)_0%,#B08A20_50%,rgba(176,138,32,0)_100%)]' />

            <div className='mx-auto max-w-7xl px-6 py-14'>
                <div className='grid grid-cols-1 gap-10 lg:grid-cols-12'>
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

                    <div className='grid grid-cols-2 gap-x-6 gap-y-10 lg:col-span-9 lg:grid-cols-7 lg:gap-10'>
                        <div className='lg:col-span-2'>
                            <LinkColumn heading='Navigation' links={navigationLinks} onLinkClick={handleLinkClick} />
                        </div>
                        <div className='lg:col-span-2'>
                            <LinkColumn heading='Membership' links={membershipLinks} onLinkClick={handleLinkClick} />
                        </div>
                        <div className='lg:col-span-2'>
                            <LinkColumn heading='Support' links={supportLinks} onLinkClick={handleLinkClick} />
                        </div>
                    </div>
                </div>
            </div>
            <div className='h-px w-full bg-[linear-gradient(90deg,rgba(176,138,32,0)_0%,#B08A20_50%,rgba(176,138,32,0)_100%)]' />

            <div className='mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row'>
                <p className='text-center text-xs text-[#8A8A8F] sm:text-left'>
                    © {new Date().getFullYear()} SLR Life Pty Ltd. All rights reserved. Australian Owned &amp; Operated.
                </p>

                <button
                    type='button'
                    onClick={scrollToTop}
                    aria-label='Back to top'
                    className='group text-slr-dim hover:border-slr-gold/40 hover:bg-slr-gold/10 hover:text-slr-gold inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-300'>
                    <span>Back to Top</span>
                    <ArrowUp className='group-hover:text-slr-gold h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5' />
                </button>
            </div>
        </footer>
    );
};

export default Footer;
