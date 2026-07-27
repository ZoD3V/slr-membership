'use client';
import Link from 'next/link';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail
} from '@/components/ui/sidebar';

import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { Gem } from 'lucide-react';

export function AppSidebar({ user }) {
    return (
        <Sidebar collapsible='icon' variant='sidebar'>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size='lg' asChild className='data-[state=open]:bg-sidebar-accent'>
                            <Link href={'/dashboard'} prefetch>
                                <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                                    <Gem className='size-4' />
                                </div>
                                <div className='grid flex-1 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden'>
                                    <span className='truncate font-semibold'>Smart Life Rewards</span>
                                    <span className='text-muted-foreground truncate text-xs'>Admin</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain />
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
