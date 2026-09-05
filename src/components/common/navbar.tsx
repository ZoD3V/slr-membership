'use client';

import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button as ButtonShadcn } from '@/components/ui/button';
import { menuItems } from '@/constant/menu-items';
import { useAnchorScroll } from '@/hooks/use-anchor-scroll';
import { useInitials } from '@/hooks/use-initials';
import { logoutAction } from '@/lib/logout-action';
import { goldButtonStyle } from '@/lib/styles';
import { cn } from '@/lib/utils';
import { Transition } from '@headlessui/react';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { UserInfo } from '../ui/user-info';
import Container from './container';
import { Menu, X } from 'lucide-react';

type NavbarProps = {
    user?: any;
};

export function Navbar({ user }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeHash, setActiveHash] = useState<string>('');
    const [scrolled, setScrolled] = useState<boolean>(false);
    const scrollToAnchor = useAnchorScroll();
    const pathname = usePathname();
    const getInitials = useInitials();

    if (pathname.startsWith('/ebooks') && !user) return null;

    const toggleMenu = () => setIsOpen(!isOpen);

    const visibleMenuItems = menuItems.filter((item) => !item.authRequired || !!user);

    const role = String((user?.user as { role?: string })?.role ?? '').toLowerCase();
    const homeHref = role.includes('admin') ? '/dashboard' : '/member';

    useEffect(() => {
        const updateHash = () => setActiveHash(window.location.hash || '');
        updateHash();
        window.addEventListener('hashchange', updateHash);

        return () => window.removeEventListener('hashchange', updateHash);
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const glassStyle: React.CSSProperties = {
        background:
            'linear-gradient(117.58deg, rgba(215, 237, 237, 0.16) -47.79%, rgba(204, 235, 235, 0) 100%), #000000',
        backgroundClip: 'padding-box',
        border: '1px solid #FFFFFF14',
        backdropFilter: 'blur(50px)',
        WebkitBackdropFilter: 'blur(50px)',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.4)'
    };

    const transparentStyle: React.CSSProperties = {
        background: 'transparent',
        border: '1px solid transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        boxShadow: 'none'
    };

    const navStyle: React.CSSProperties = scrolled || isOpen ? glassStyle : transparentStyle;

    const isActive = (url: string) => {
        if (!url) return false;

        if (url.startsWith('#')) {
            if (url === '#') return activeHash === '' || activeHash === '#';

            return activeHash === url;
        }

        return pathname === url;
    };

    return (
        <header
            className={cn(
                'fixed top-0 right-0 left-0 z-50 mx-auto max-w-7xl bg-transparent lg:px-4',
                scrolled ? 'lg:pt-0' : 'lg:pt-1'
            )}>
            <Container className='px-0!'>
                <nav
                    style={navStyle}
                    className={cn(
                        'relative mx-auto flex items-center justify-between px-5 py-4 transition-all duration-300 lg:mt-5 xl:py-3',
                        isOpen ? '' : 'rounded-b-2xl lg:rounded-[20px]'
                    )}>
                    <Link href='/' className='flex items-center gap-2'>
                        <Image
                            src='/images/slr-rewards-logo.webp'
                            alt='SLR Rewards Logo'
                            width={250}
                            height={250}
                            priority
                            className='h-5 w-auto lg:h-7'
                        />
                        <span className='sr-only'>SLR Rewards</span>
                    </Link>

                    <ul className='hidden items-center gap-1 xl:absolute xl:left-1/2 xl:flex xl:-translate-x-1/2'>
                        {visibleMenuItems.map((item) => {
                            const active = isActive(item.url);

                            return (
                                <li key={item.text}>
                                    <Link
                                        href={item.url}
                                        onClick={(event) => scrollToAnchor(event, item.url)}
                                        className={cn(
                                            'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                                            active ? 'text-white' : 'text-slr-muted hover:text-white'
                                        )}>
                                        {item.text}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className='flex items-center gap-3 justify-self-end'>
                        {user ? (
                            <div className='dark hidden text-white xl:flex'>
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <UserInfo user={user?.user} showEmail={true} />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className='dark'>
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href={homeHref}>Dashboard</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => logoutAction()}>Log Out</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <div className='hidden items-center gap-2 xl:flex'>
                                <Link href='/sign-in' className='flex-1'>
                                    <ButtonShadcn
                                        type='button'
                                        variant='outline'
                                        className='h-10 w-full rounded-xl border border-[#FFD147] bg-[#FFD1471A] font-semibold text-[#FFDC75] shadow-[inset_0px_8px_12px_0px_#FFFFFF14,inset_16px_24px_64px_-24px_#FFFFFF14,0px_24px_24px_-16px_#0000001F] transition-all hover:bg-[#FFD14726] hover:text-[#FFDC75] active:scale-[0.98]'>
                                        Login
                                    </ButtonShadcn>
                                </Link>
                                <Link
                                    href='/sign-up'
                                    style={goldButtonStyle}
                                    className='rounded-xl px-4 py-2 text-sm font-bold shadow-md transition-opacity hover:opacity-90'>
                                    Join Now
                                </Link>
                            </div>
                        )}

                        {user ? (
                            <div className='dark xl:hidden'>
                                <DropdownMenu>
                                    <DropdownMenuTrigger aria-label='Open account menu' className='cursor-pointer'>
                                        <Avatar className='h-8 w-8 rounded-lg'>
                                            <AvatarImage
                                                src={(user?.user as { avatar?: string })?.avatar}
                                                alt={(user?.user as { name?: string })?.name ?? 'User'}
                                            />
                                            <AvatarFallback className='rounded-lg bg-white/15 text-xs font-semibold text-white'>
                                                {getInitials((user?.user as { name?: string })?.name ?? 'User')}
                                            </AvatarFallback>
                                        </Avatar>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className='dark' align='end'>
                                        <DropdownMenuLabel className='font-normal'>
                                            <UserInfo user={user?.user} showEmail={true} />
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href={homeHref}>Dashboard</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => logoutAction()}>Log Out</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : null}

                        <button
                            onClick={toggleMenu}
                            type='button'
                            className='text-slr-navy-foreground flex cursor-pointer items-center justify-center focus:outline-none xl:hidden'
                            aria-controls='mobile-menu'
                            aria-expanded={isOpen}>
                            {isOpen ? (
                                <X className='h-6 w-6' aria-hidden='true' />
                            ) : (
                                <Menu className='h-6 w-6' aria-hidden='true' />
                            )}
                            <span className='sr-only'>Toggle navigation</span>
                        </button>
                    </div>
                </nav>
            </Container>

            <Transition
                show={isOpen}
                enter='transition ease-out duration-200 transform'
                enterFrom='opacity-0 -translate-y-2'
                enterTo='opacity-100 translate-y-0'
                leave='transition ease-in duration-150 transform'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 -translate-y-2'>
                <div id='mobile-menu' style={glassStyle} className='mx-auto rounded-b-2xl shadow-lg xl:hidden'>
                    <ul className='flex flex-col gap-1 px-4 py-4'>
                        {visibleMenuItems.map((item) => {
                            const active = isActive(item.url);

                            return (
                                <li key={item.text} onClick={toggleMenu}>
                                    <Link
                                        href={item.url}
                                        onClick={(event) => scrollToAnchor(event, item.url)}
                                        className={cn(
                                            'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                            active
                                                ? 'bg-white/5 text-white'
                                                : 'text-slr-muted hover:bg-white/5 hover:text-white'
                                        )}>
                                        {item.text}
                                    </Link>
                                </li>
                            );
                        })}
                        {user ? null : (
                            <li className='flex flex-col gap-2 pt-2'>
                                <Link
                                    href='/sign-in'
                                    onClick={toggleMenu}
                                    className='block w-full rounded-xl border border-[#FFD147] bg-[#FFD1471A] px-5 py-2 text-center text-sm font-semibold text-[#FFDC75] transition-colors hover:bg-[#FFD14726]'>
                                    Login
                                </Link>
                                <Link
                                    href='/sign-up'
                                    style={goldButtonStyle}
                                    className='block w-full rounded-xl px-5 py-2 text-center text-sm font-bold shadow-md transition-opacity hover:opacity-90'
                                    onClick={toggleMenu}>
                                    Join Now
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </Transition>
        </header>
    );
}
