import Link from 'next/link';

import { SectionTitle } from './section-title';
import { ArrowRight, BookOpen, CreditCard, Gift, type LucideIcon, TicketPercent, UserCircle } from 'lucide-react';

interface QuickAction {
    title: string;
    href: string;
    icon: LucideIcon;
    desc: string;
}

// The four quick actions called out in PRD §4.2.
const ACTIONS: QuickAction[] = [
    { title: 'Discounts', href: '/member/discounts', icon: TicketPercent, desc: 'Partner offers & BENY' },
    { title: 'Giveaways', href: '/member/giveaways', icon: Gift, desc: 'Active draws by tier' },
    { title: 'E-Books', href: '/member/ebooks', icon: BookOpen, desc: 'Digital library' },
    { title: 'Profile', href: '/member/profile', icon: UserCircle, desc: 'Account & membership' }
];

// Discounts are a RED/BLUE benefit — for Visitor the slot upsells the upgrade instead.
const VISITOR_MEMBERSHIP_ACTION: QuickAction = {
    title: 'Membership',
    href: '/member/membership',
    icon: CreditCard,
    desc: 'Upgrade your plan'
};

export function QuickActions({ isVisitor = false }: { isVisitor?: boolean }) {
    const actions = isVisitor
        ? ACTIONS.map((action) => (action.href === '/member/discounts' ? VISITOR_MEMBERSHIP_ACTION : action))
        : ACTIONS;

    return (
        <section>
            <SectionTitle>Quick Actions</SectionTitle>
            <div className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
                {actions.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className='group bg-card-dark-navy shadow-card-warm border-slr-navy-border hover:border-slr-gold-edge relative flex flex-col overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:shadow-[0_0_28px_rgba(212,175,55,0.15)] sm:p-5'>
                        <span aria-hidden className='bg-gradient-gold absolute inset-x-0 top-0 h-0.5 opacity-70' />
                        <span
                            aria-hidden
                            className='bg-slr-gold-metal/0 group-hover:bg-slr-gold-metal/10 pointer-events-none absolute -top-10 -right-10 size-24 rounded-full blur-2xl transition-colors duration-300'
                        />
                        <span className='bg-gold-tint border-slr-gold-edge flex size-11 items-center justify-center rounded-xl border'>
                            <action.icon className='text-slr-gold-label size-5' />
                        </span>
                        <span className='font-bebas-neue mt-4 block text-2xl leading-none tracking-wide text-white uppercase'>
                            {action.title}
                        </span>
                        <span className='text-slr-dim mt-1.5 block text-xs'>{action.desc}</span>
                        <span className='text-slr-gold-label mt-auto inline-flex items-center gap-1 pt-4 text-[10px] font-semibold tracking-[0.18em] uppercase'>
                            Explore
                            <ArrowRight className='size-3 transition-transform duration-200 group-hover:translate-x-0.5' />
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
