import type { Metadata } from 'next';

import { TierBadge } from '@/components/common/tier-badge';
import { getMemberProfile } from '@/data/profile';

import { MembershipCardDialog } from './_components/membership-card-dialog';
import { PersonalInfoSection } from './_components/personal-info-section';
import { SecuritySection } from './_components/security-section';
import { SupportLinks } from './_components/support-links';
import { MapPin } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Profile · SLR Member'
};

function initials(name: string): string {
    const letters = name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return letters || '—';
}

export default async function ProfilePage() {
    const profile = await getMemberProfile();

    return (
        <div className='mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8'>
            <header className='flex flex-col items-center gap-3 text-center'>
                <div className='bg-card-dark-navy border-slr-navy-border flex size-20 shrink-0 items-center justify-center rounded-full border text-2xl font-semibold text-white'>
                    {initials(profile.name)}
                </div>
                <div>
                    <h1 className='font-bebas-neue text-3xl leading-none tracking-wide uppercase'>{profile.name}</h1>
                    <div className='mt-2 flex flex-wrap items-center justify-center gap-2'>
                        <TierBadge subTier={profile.sub_tier} size='sm' />
                        <span className='text-slr-dim inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/3 px-2 py-0.5 text-xs font-medium'>
                            <MapPin className='size-3' /> {profile.state}
                        </span>
                    </div>

                    <p className='text-slr-dim mt-1.5 text-xs'>{profile.email || '-'}</p>
                </div>
            </header>

            <MembershipCardDialog
                name={profile.name}
                subTier={profile.sub_tier}
                userId={profile.id}
                state={profile.state}
                joinedAt={profile.joinedAt}
            />

            <PersonalInfoSection profile={profile} />

            <div className='grid gap-6 lg:grid-cols-2'>
                <SecuritySection />
                <SupportLinks />
            </div>
        </div>
    );
}
