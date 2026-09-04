import type { FC, ReactNode } from 'react';

import Link from 'next/link';

import DashboardEmptyState from '@/app/dashboard/_components/dashboard-empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { handleApiAuthError } from '@/lib/api/guard';
import { type AdminMemberDetail, getAdminMemberDetail } from '@/lib/api/resources/admin';
import { getAccessToken } from '@/lib/api/server';
import { formatAdminTierName, subTierFromGroupAndName } from '@/lib/member';
import type { TierGroup } from '@/types/member';

import { MemberAdminActions } from './_components/member-admin-actions';
import { MemberConsentsCard } from './_components/member-consents-card';
import { MemberProfileForm } from './_components/member-profile-form';
import { ArrowLeft, CircleAlert } from 'lucide-react';

const dash = (v: string | null | undefined) => (v && v.trim() ? v : '-');
const day = (v: string | null | undefined) => (v ? v.slice(0, 10) : '-');

const tierName = (group: string | null | undefined, marketingName: string | null | undefined) => {
    const code = group ? subTierFromGroupAndName(group.toLowerCase() as TierGroup, marketingName) : null;

    return code ? formatAdminTierName(code) : dash(marketingName);
};

const Field: FC<{ label: string; value: ReactNode }> = ({ label, value }) => (
    <div className='grid gap-0.5'>
        <dt className='text-muted-foreground text-xs tracking-wide uppercase'>{label}</dt>
        <dd className='text-sm font-medium'>{value}</dd>
    </div>
);

const InfoCard: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
    <Card>
        <CardHeader className='pb-2'>
            <CardTitle className='text-base'>{title}</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-2 gap-4'>{children}</CardContent>
    </Card>
);

export default async function MemberDetailPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const token = await getAccessToken();

    let member: AdminMemberDetail | null = null;
    let failed = false;
    try {
        member = token ? await getAdminMemberDetail(userId, token) : null;
    } catch (error) {
        handleApiAuthError(error);
        failed = true;
    }

    if (failed || !member) {
        return (
            <div className='p-4'>
                <DashboardEmptyState
                    icon={CircleAlert}
                    title='Could not load member'
                    description='This member profile is unavailable right now. Please try again shortly.'
                />
            </div>
        );
    }

    const { membership, subscription, cycles, wins } = member;
    const consents = member.consents ?? [];

    return (
        <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6'>
            <div className='flex flex-wrap items-center gap-3'>
                <Link
                    href='/dashboard/members'
                    className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm'>
                    <ArrowLeft className='size-4' /> Members
                </Link>
            </div>

            <div className='flex flex-wrap items-center justify-between gap-2'>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight'>{dash(member.full_name)}</h1>
                    <p className='text-muted-foreground text-sm'>{dash(member.email)}</p>
                </div>
                <Badge variant='secondary' className='uppercase'>
                    {dash(member.status)}
                </Badge>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
                <InfoCard title='Profile'>
                    <Field label='Full name' value={dash(member.full_name)} />
                    <Field label='Email' value={dash(member.email)} />
                    <Field label='Phone' value={dash(member.phone)} />
                    <Field label='Date of birth' value={day(member.dob)} />
                    <Field label='State' value={dash(member.state)} />
                    <Field label='Status' value={dash(member.status)} />
                    <Field label='Registered' value={day(member.created_at)} />
                </InfoCard>

                <InfoCard title='Membership'>
                    <Field label='Tier' value={tierName(membership?.tier_code, membership?.tier)} />

                    <Field label='Tier code' value={dash(membership?.tier_code)} />
                    <Field label='Billing status' value={dash(membership?.billing_status)} />
                    <Field label='Renews' value={day(membership?.renew_at)} />
                </InfoCard>
            </div>

            <MemberProfileForm
                userId={member.user_id}
                initial={{
                    full_name: member.full_name ?? '',
                    email: member.email ?? '',
                    phone: member.phone ?? '',
                    state: member.state ?? '',
                    dob: member.dob ?? ''
                }}
            />

            <MemberAdminActions
                userId={member.user_id}
                currentStatus={member.status}
                currentTierCode={membership?.tier_code ?? ''}
            />

            <MemberConsentsCard consents={consents} />

            <InfoCard title='Subscription'>
                {subscription ? (
                    <>
                        <Field label='Stripe ID' value={dash(subscription.stripe_subscription_id)} />
                        <Field label='Status' value={dash(subscription.status)} />
                        <Field label='Period start' value={day(subscription.current_period_start)} />
                        <Field label='Period end' value={day(subscription.current_period_end)} />
                    </>
                ) : (
                    <p className='text-muted-foreground col-span-2 text-sm'>No active subscription.</p>
                )}
            </InfoCard>

            <Card>
                <CardHeader className='pb-2'>
                    <CardTitle className='text-base'>Billing cycles</CardTitle>
                </CardHeader>
                <CardContent>
                    {cycles.length === 0 ? (
                        <p className='text-muted-foreground text-sm'>No cycles yet.</p>
                    ) : (
                        <div className='overflow-x-auto rounded-md border'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='text-muted-foreground font-medium'>Tier</TableHead>
                                        <TableHead className='text-muted-foreground font-medium'>Start</TableHead>
                                        <TableHead className='text-muted-foreground font-medium'>End</TableHead>
                                        <TableHead className='text-muted-foreground font-medium'>Tokens</TableHead>
                                        <TableHead className='text-muted-foreground font-medium'>Entry</TableHead>
                                        <TableHead className='text-muted-foreground font-medium'>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cycles.map((c) => (
                                        <TableRow key={c.cycle_id}>
                                            <TableCell>{dash(c.tier)}</TableCell>
                                            <TableCell>{day(c.start_at)}</TableCell>
                                            <TableCell>{day(c.end_at)}</TableCell>
                                            <TableCell className='tabular-nums'>{c.total_token ?? 0}</TableCell>
                                            <TableCell>
                                                <Badge variant={c.draw_pass > 0 ? 'default' : 'secondary'}>
                                                    {c.draw_pass > 0 ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{dash(c.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className='pb-2'>
                    <CardTitle className='text-base'>Wins</CardTitle>
                </CardHeader>
                <CardContent>
                    {wins.length === 0 ? (
                        <p className='text-muted-foreground text-sm'>No wins recorded.</p>
                    ) : (
                        <ul className='space-y-2 text-sm'>
                            {wins.map((w) => (
                                <li key={w.win_id} className='flex items-center justify-between'>
                                    <span>{dash(w.prize)}</span>
                                    <span className='text-muted-foreground'>{day(w.recorded_at)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
