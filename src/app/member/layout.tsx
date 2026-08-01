import type { ReactNode } from 'react';

import { auth } from '@/auth';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { getCurrentMember } from '@/data/member-dashboard';
import { handleApiAuthError } from '@/lib/api/guard';
import { type NotificationDto, getNotifications as getApiNotifications } from '@/lib/api/resources/notifications';
import { getAccessToken } from '@/lib/api/server';

import { MemberHeader } from './_components/member-header';
import { MemberSidebar } from './_components/member-sidebar';

export default async function MemberLayout({ children }: { children: ReactNode }) {
    const session = await auth();
    const user = session?.user ?? null;
    const token = await getAccessToken();

    // Member identity (name, tier, state) from the session — state isn't on
    // memberships/me, so it stays session-sourced.
    const member = await getCurrentMember();

    let notifications: NotificationDto[] = [];
    if (token) {
        try {
            notifications = await getApiNotifications(token);
        } catch (error) {
            handleApiAuthError(error);
        }
    }

    return (
        <div className='slr-member dark bg-background text-foreground min-h-screen'>
            <AppShell variant='sidebar'>
                <MemberSidebar user={user} member={member} />
                <AppContent variant='sidebar' className='isolate flex min-h-svh flex-col'>
                    {/* Decorative backdrop — star field + radial glows echoing the home hero */}
                    <div aria-hidden className='absolute inset-0 -z-10 overflow-clip md:rounded-xl'>
                        <div className='slr-stars-overlay absolute inset-0 opacity-60' />
                        <div className='absolute inset-x-0 top-0 h-105 bg-[radial-gradient(ellipse_60%_100%_at_28%_0%,rgba(212,175,55,0.10),transparent_65%)]' />
                        <div className='absolute inset-x-0 top-0 h-105 bg-[radial-gradient(ellipse_50%_90%_at_80%_0%,rgba(40,120,232,0.07),transparent_65%)]' />
                        <div className='bg-slr-gold-metal/6 absolute -top-24 left-1/4 hidden size-96 rounded-full mix-blend-screen blur-3xl xl:block' />
                    </div>
                    <MemberHeader user={user} member={member} notifications={notifications} token={token ?? null} />
                    {children}
                </AppContent>
            </AppShell>
        </div>
    );
}
