import {
    BookOpen,
    CreditCard,
    Gift,
    History,
    LayoutDashboard,
    type LucideIcon,
    TicketPercent,
    Trophy,
    UserCircle,
    Users
} from 'lucide-react';

export interface MemberNavItem {
    title: string;
    href: string;
    icon: LucideIcon;
}

export const MEMBER_NAV: MemberNavItem[] = [
    { title: 'Dashboard', href: '/member', icon: LayoutDashboard },
    { title: 'Prizes', href: '/member/prizes', icon: Trophy },
    { title: 'Giveaways', href: '/member/giveaways', icon: Gift },
    { title: 'Discounts', href: '/member/discounts', icon: TicketPercent },
    { title: 'E-Books', href: '/member/ebooks', icon: BookOpen },
    { title: 'Entry History', href: '/member/entry-history', icon: History },
    { title: 'Membership', href: '/member/membership', icon: CreditCard },
    { title: 'Profile', href: '/member/profile', icon: UserCircle }
];
