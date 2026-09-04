import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import useDialogState from '@/hooks/use-dialog-state';
import { useInitials } from '@/hooks/use-initials';
import { useIsMobile } from '@/hooks/use-mobile';

import { SignOutDialog } from '../sign-out-dialog';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { UserInfo } from './user-info';
import { ChevronsUpDown, LogOut } from 'lucide-react';

export function NavUser({ user }) {
    const isMobile = useIsMobile();
    const getInitials = useInitials();
    const [open, setOpen] = useDialogState();

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size='lg'
                                className='group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent'
                                data-test='sidebar-menu-button'>
                                <UserInfo user={user} showEmail={true} />
                                <ChevronsUpDown className='ml-auto size-4' />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className='dashboard-theme dark w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                            side={isMobile ? 'bottom' : 'right'}
                            align='end'
                            sideOffset={4}>
                            <DropdownMenuLabel className='p-0 font-normal'>
                                <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                                    <Avatar className='h-8 w-8 rounded-lg'>
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className='rounded-lg'>
                                            {getInitials(user?.name ?? 'User')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className='grid flex-1 text-start text-sm leading-tight'>
                                        <span className='truncate font-semibold'>{user.name}</span>
                                        <span className='truncate text-xs'>{user.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
                                <LogOut />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
            <SignOutDialog open={!!open} onOpenChange={setOpen} />
        </>
    );
}
