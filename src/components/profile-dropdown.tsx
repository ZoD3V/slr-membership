'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/ui/user-menu-content';
import useDialogState from '@/hooks/use-dialog-state';
import { useInitials } from '@/hooks/use-initials';

import { SignOutDialog } from './sign-out-dialog';

export function ProfileDropdown({ user }: { user: any }) {
    const getInitials = useInitials();
    const [open, setOpen] = useDialogState();

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='relative size-8 rounded-full'>
                        <Avatar className='size-8'>
                            <AvatarImage src={user?.avatar ?? ''} alt={user?.name ?? 'User'} />
                            <AvatarFallback className='bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white'>
                                {getInitials(user?.name ?? 'User')}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className='dashboard-theme dark w-56' align='end' forceMount>
                    <UserMenuContent user={user} />
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <SignOutDialog open={!!open} onOpenChange={setOpen} />
        </>
    );
}
