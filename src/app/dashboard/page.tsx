import type { FC, ReactNode } from 'react';

import Link from 'next/link';

import DashboardEmptyState from '@/app/dashboard/_components/dashboard-empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { handleApiAuthError } from '@/lib/api/guard';
import { type AdminDashboardMetrics, getAdminDashboardMetrics } from '@/lib/api/resources/admin';
import { type SubTierCount, getMembershipStats } from '@/lib/api/resources/memberships';
import { getAccessToken } from '@/lib/api/server';
import { formatAdminTierName, subTierCodeOf } from '@/lib/member';

import {
    AlertTriangle,
    ArrowUpRight,
    CircleAlert,
    CreditCard,
    DollarSign,
    Gift,
    type LucideIcon,
    UserCheck,
    UserMinus,
    Users
} from 'lucide-react';

// Cards with an href drill into the list they summarise; the rest stay static.
// `group` drives the hover state on the arrow affordance inside each card.
const CardLink: FC<{ href?: string; children: ReactNode }> = ({ href, children }) =>
    href ? (
        <Link href={href} className='group block h-full cursor-pointer'>
            {children}
        </Link>
    ) : (
        <>{children}</>
    );

/** Persistent "this navigates" cue — visible at rest, brightens on hover. */
const DrillCue: FC<{ label: string }> = ({ label }) => (
    <span className='text-muted-foreground group-hover:text-primary mt-2 flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase transition-colors'>
        {label}
        <ArrowUpRight className='size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
    </span>
);

const StatCard: FC<{ label: string; value: string; icon: LucideIcon; href?: string; drillLabel?: string }> = ({
    label,
    value,
    icon: Icon,
    href,
    drillLabel
}) => (
    <CardLink href={href}>
        <Card
            className={`h-full ${href ? 'group-hover:border-primary/50 transition-colors group-hover:bg-white/4' : ''}`}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>{label}</CardTitle>
                <Icon className='text-muted-foreground size-4 shrink-0' />
            </CardHeader>
            <CardContent>
                <div className='text-3xl font-extrabold text-white tabular-nums sm:text-4xl'>{value}</div>
                {href ? <DrillCue label={drillLabel ?? 'View'} /> : null}
            </CardContent>
        </Card>
    </CardLink>
);

const MiniStatCard: FC<{
    label: string;
    value: string;
    icon: LucideIcon;
    iconColor?: string;
    href?: string;
    drillLabel?: string;
}> = ({ label, value, icon: Icon, iconColor, href, drillLabel }) => (
    <CardLink href={href}>
        <Card
            className={`bg-slr-navy-card/45 border-slr-navy-border h-full py-2 ${href ? 'group-hover:border-primary/50 group-hover:bg-slr-navy-card/70 transition-colors' : ''}`}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pt-1.5 pb-1'>
                <CardTitle className='text-[10px] font-semibold tracking-widest text-slate-400 uppercase sm:text-xs'>
                    {label}
                </CardTitle>
                <Icon className={`size-3.5 shrink-0 ${iconColor ?? 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent className='pb-1'>
                <div className='text-2xl font-extrabold text-white tabular-nums sm:text-3xl'>{value}</div>
                {href ? <DrillCue label={drillLabel ?? 'View'} /> : null}
            </CardContent>
        </Card>
    </CardLink>
);

const SimpleCountsBreakdown: FC<{
    title: string;
    rows: { label: string; count: number }[];
}> = ({ title, rows }) => {
    const sorted = [...rows].sort((a, b) => b.count - a.count);

    return (
        <Card className='border-slr-navy-border bg-slr-navy-card/30 h-full p-5 shadow-xl backdrop-blur-sm sm:p-6'>
            <CardHeader className='border-slr-navy-border/40 border-b px-0 pt-0 pb-4'>
                <CardTitle className='text-xs font-semibold tracking-wider text-slate-400 uppercase'>{title}</CardTitle>
            </CardHeader>
            <CardContent className='px-0 pt-4'>
                {sorted.length === 0 ? (
                    <p className='text-muted-foreground py-4 text-center text-xs italic'>No data.</p>
                ) : (
                    <div className='grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2'>
                        {sorted.map((r) => (
                            <div
                                key={r.label}
                                className='border-slr-navy-border/25 bg-slr-navy/35 hover:border-slr-navy-border/50 flex min-h-24 flex-col justify-between rounded-xl border p-4 transition-colors'>
                                <span
                                    className='truncate text-xs font-bold tracking-widest text-slate-400 uppercase'
                                    title={r.label}>
                                    {r.label}
                                </span>
                                <div className='mt-2 text-2xl font-extrabold text-white tabular-nums sm:text-3xl'>
                                    {r.count.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const formatMrr = (cents: number) => `$${Math.round(cents / 100).toLocaleString('en-AU')}`;

// The API can return several rows sharing a label (e.g. r4 and b4 both map to
// tier "Plus"). Merge them so counts sum and each row key stays unique.
const aggregateByLabel = (rows: { label: string; count: number }[]) => {
    const totals = new Map<string, number>();
    for (const { label, count } of rows) {
        const key = label || '-';
        totals.set(key, (totals.get(key) ?? 0) + (count || 0));
    }

    return Array.from(totals, ([label, count]) => ({ label, count }));
};

export default async function DashboardHome() {
    const token = await getAccessToken();

    // `members_by_tier` sends only marketing names, so r4 and b4 both arrive as
    // "Plus" and merge into one meaningless row. /memberships/stats groups by
    // sub-tier id instead, which keeps Red and Blue distinguishable — fetched
    // alongside the metrics so the breakdown survives a metrics failure.
    const [metricsResult, statsResult] = await Promise.allSettled([
        token ? getAdminDashboardMetrics(token) : Promise.resolve(null),
        token ? getMembershipStats(token) : Promise.resolve<SubTierCount[]>([])
    ]);

    if (metricsResult.status === 'rejected') handleApiAuthError(metricsResult.reason);
    if (statsResult.status === 'rejected') handleApiAuthError(statsResult.reason);

    const data: AdminDashboardMetrics | null = metricsResult.status === 'fulfilled' ? metricsResult.value : null;
    const subTierCounts: SubTierCount[] = statsResult.status === 'fulfilled' ? statsResult.value : [];

    const tierRows = subTierCounts
        .map((c) => ({ label: formatAdminTierName(subTierCodeOf(c.subTierId)), count: c.count }))
        .sort((a, b) => b.count - a.count);

    if (!data) {
        return (
            <div className='px-4 py-8 md:px-6'>
                <DashboardEmptyState
                    icon={CircleAlert}
                    title='Dashboard unavailable'
                    description='Could not load admin metrics right now. Please try again shortly.'
                />
            </div>
        );
    }

    const pendingAct = data.alerts.pending_beny_activations ?? 0;
    const activeScr = data.alerts.active_beny_subscriptions ?? (data.alerts as any).active_beny ?? 0;
    const pendingDeact =
        data.alerts.pending_beny_deactivations ??
        (data.alerts as any).pending_beny_deactivation ??
        (data.alerts as any).pending_deactivation_beny ??
        0;
    const cancelledScr =
        data.alerts.cancelled_beny_subscriptions ??
        (data.alerts as any).cancelled_beny ??
        (data.alerts as any).canceled_beny ??
        0;

    return (
        <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6'>
            <div>
                <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>Dashboard</h1>
                <p className='text-muted-foreground text-sm'>Platform overview & metrics.</p>
            </div>

            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <StatCard
                    label='Total Members'
                    value={data.total_members.toLocaleString()}
                    icon={Users}
                    href='/dashboard/members'
                    drillLabel='View members'
                />
                <StatCard
                    label='Active Subscriptions'
                    value={data.active_subscriptions.toLocaleString()}
                    icon={CreditCard}
                    href='/dashboard/members'
                    drillLabel='View members'
                />
                {/* No drill-down: MRR is an aggregate with no matching list view. */}
                <StatCard label='Monthly Recurring Revenue' value={formatMrr(data.mrr_cents)} icon={DollarSign} />
                <StatCard
                    label='Failed Payments (30d)'
                    value={data.alerts.failed_payments_30d.toLocaleString()}
                    icon={AlertTriangle}
                    href='/dashboard/members'
                    drillLabel='View members'
                />
            </div>

            <div className='space-y-3'>
                <h2 className='text-xs font-bold tracking-widest text-slate-400 uppercase'>BENY Accounts Overview</h2>
                <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
                    <MiniStatCard
                        label='Pending Activations'
                        value={pendingAct.toLocaleString()}
                        icon={UserCheck}
                        iconColor='text-yellow-400'
                        href='/dashboard/beny?status=pending_activation'
                        drillLabel='Open tab'
                    />
                    <MiniStatCard
                        label='Active Accounts'
                        value={activeScr.toLocaleString()}
                        icon={Users}
                        iconColor='text-green-400'
                        href='/dashboard/beny?status=active'
                        drillLabel='Open tab'
                    />
                    <MiniStatCard
                        label='Pending Deactivations'
                        value={pendingDeact.toLocaleString()}
                        icon={AlertTriangle}
                        iconColor='text-amber-500'
                        href='/dashboard/beny?status=pending_deactivation'
                        drillLabel='Open tab'
                    />
                    <MiniStatCard
                        label='Cancelled Accounts'
                        value={cancelledScr.toLocaleString()}
                        icon={UserMinus}
                        iconColor='text-red-400'
                        href='/dashboard/beny?status=cancelled'
                        drillLabel='Open tab'
                    />
                </div>
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
                <SimpleCountsBreakdown title='Members by Tier' rows={tierRows} />
                <SimpleCountsBreakdown
                    title='Members by State'
                    rows={aggregateByLabel(data.members_by_state.map((s) => ({ label: s.state, count: s.count })))}
                />
            </div>

            <p className='text-muted-foreground flex items-center gap-2 text-xs'>
                <Gift className='size-3.5' /> Draws, winners & TPAL export live under their own admin sections.
            </p>
        </div>
    );
}
