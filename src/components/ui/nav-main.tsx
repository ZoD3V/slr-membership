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
    Bell,
    BookOpen,
    ClipboardList,
    Clock,
    Dices,
    FileSpreadsheet,
    Gift,
    LayoutGrid,
    type LucideIcon,
    Megaphone,
    ShieldCheck,
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

const ITEMS: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { title: 'Members', href: '/dashboard/members', icon: ClipboardList },
    { title: 'Giveaways', href: '/dashboard/giveaways', icon: Gift },
    { title: 'Winners', href: '/dashboard/winners', icon: Trophy },
    { title: 'Prizes', href: '/dashboard/prizes', icon: Sparkles },
    { title: 'Safe Hours', href: '/dashboard/safe-hours', icon: Clock },
    { title: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { title: 'Spin Wheel', href: '/dashboard/spin', icon: Dices },
    { title: 'TPAL Exports', href: '/dashboard/draw-exports', icon: FileSpreadsheet },
    { title: 'Discounts', href: '/dashboard/discounts', icon: Ticket },
    { title: 'BENY', href: '/dashboard/beny', icon: UserCheck },
    { title: 'Ebooks', href: '/dashboard/ebooks', icon: BookOpen },
    { title: 'Announcements', href: '/dashboard/announcements', icon: Megaphone },
    { title: 'Consents', href: '/dashboard/consents', icon: ShieldCheck }
];

export function NavMain() {
    const pathname = usePathname();

    return (
        <SidebarGroup className='px-2 py-0'>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>

            <SidebarMenu>
                {ITEMS.map((item) => {
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
