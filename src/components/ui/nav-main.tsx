'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';

import {
    BookOpen,
    ClipboardList,
    Clock,
    Dices,
    FileSpreadsheet,
    Gift,
    LayoutGrid,
    type LucideIcon,
    Sparkles,
    Ticket,
    Trophy,
    UserCheck
} from 'lucide-react';

type NavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
};

// PRD §3.2 (Navigasi Admin), narrowed to the sections that exist as routes today.
// No role filter: the PRD defines a single Admin role, and auth.config already
// keeps non-admins out of /dashboard entirely.
const ITEMS: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { title: 'Members', href: '/dashboard/members', icon: ClipboardList },
    { title: 'Giveaways', href: '/dashboard/giveaways', icon: Gift },
    { title: 'Winners', href: '/dashboard/winners', icon: Trophy },
    { title: 'Prizes', href: '/dashboard/prizes', icon: Sparkles },
    { title: 'Safe Hours', href: '/dashboard/safe-hours', icon: Clock },
    { title: 'Spin Wheel', href: '/dashboard/spin', icon: Dices },
    { title: 'TPAL Exports', href: '/dashboard/draw-exports', icon: FileSpreadsheet },
    { title: 'Discounts', href: '/dashboard/discounts', icon: Ticket },
    { title: 'BENY', href: '/dashboard/beny', icon: UserCheck },
    { title: 'Ebooks', href: '/dashboard/ebooks', icon: BookOpen }
];

export function NavMain() {
    const pathname = usePathname();

    return (
        <SidebarGroup className='px-2 py-0'>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>

            <SidebarMenu>
                {ITEMS.map((item) => {
                    // Exact match for the index route, prefix match for the rest so a
                    // detail page keeps its parent highlighted.
                    const isActive =
                        item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);

                    return (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title, className: 'dashboard-theme dark' }}>
                                <Link href={item.href} prefetch>
                                    <item.icon />
                                    <span className='group-data-[collapsible=icon]:hidden'>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
