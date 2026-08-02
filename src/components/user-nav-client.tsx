'use client';

import Link from 'next/link';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { logoutAction } from '@/lib/logout-action';

import { UserInfo } from './ui/user-info';

type Props = {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
};

export function UserNavClient({ user }: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button type='button'>
                    <UserInfo
                        user={{
                            name: user.name ?? '',
                            email: user.email ?? '',
                            avatar: user.image ?? ''
                        }}
                        showEmail
                    />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end'>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href='/dashboard'>Dashboard</Link>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => logoutAction()}>Log Out</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
