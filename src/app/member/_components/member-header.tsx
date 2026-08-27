'use client';

import Image from 'next/image';
import Link from 'next/link';

import { TierBadge } from '@/components/common/tier-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import { logoutAction } from '@/lib/logout-action';
import type { CurrentMember } from '@/types/member';

import { ChevronDown, LogOut, UserCircle } from 'lucide-react';

interface MemberHeaderProps {
    user: { name?: string | null; email?: string | null; image?: string | null } | null;
    member: CurrentMember;
}

export function MemberHeader({ user, member }: MemberHeaderProps) {
    const getInitials = useInitials();
    const email = user?.email ?? '';
    const firstName = member.name.split(' ')[0];

    return (
        <header className='bg-background/80 sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 px-4 backdrop-blur-md md:px-6'>
            <span aria-hidden className='slr-hairline-gold absolute inset-x-0 bottom-0 h-px opacity-70' />
            <SidebarTrigger className='-ml-1' />

            <Link href='/member' prefetch className='md:hidden'>
                <Image
                    src='/images/slr-rewards-logo.webp'
                    alt='SLR Rewards'
                    width={250}
                    height={250}
                    className='h-6 w-auto object-contain'
                />
            </Link>

            <div className='ml-auto flex items-center gap-1.5 sm:gap-2'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type='button'
                            className='hover:border-slr-gold-edge-soft hover:bg-slr-gold-wash flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/3 py-1 pr-2 pl-1 transition-colors'>
                            <Avatar className='size-7'>
                                <AvatarImage src={user?.image ?? ''} alt={member.name} />
                                <AvatarFallback className='bg-card-dark-navy text-sidebar-foreground text-xs font-semibold'>
                                    {getInitials(member.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className='text-sidebar-foreground hidden text-sm font-medium sm:inline'>
                                {firstName}
                            </span>
                            <TierBadge
                                subTier={member.sub_tier}
                                size='sm'
                                showGroup={false}
                                className='hidden sm:inline-flex'
                            />
                            <ChevronDown className='text-slr-muted size-4' />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-56'>
                        <DropdownMenuLabel className='flex flex-col'>
                            <span className='truncate font-medium'>{member.name}</span>
                            {email && <span className='text-slr-muted truncate text-xs font-normal'>{email}</span>}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href='/member/profile'>
                                <UserCircle className='size-4' /> Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => logoutAction()}>
                            <LogOut className='size-4' /> Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
