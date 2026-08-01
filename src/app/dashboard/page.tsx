import type { FC } from 'react';

import DashboardEmptyState from '@/app/dashboard/_components/dashboard-empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { handleApiAuthError } from '@/lib/api/guard';
import { type AdminDashboardMetrics, getAdminDashboardMetrics } from '@/lib/api/resources/admin';
import { getAccessToken } from '@/lib/api/server';

import {
    AlertTriangle,
    CircleAlert,
    CreditCard,
    DollarSign,
    Gift,
    type LucideIcon,
    UserCheck,
    UserMinus,
    Users
} from 'lucide-react';

const StatCard: FC<{ label: string; value: string; icon: LucideIcon; hint?: string }> = ({
    label,
    value,
    icon: Icon,
    hint
}) => (
    <Card className='h-full'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{label}</CardTitle>
            <Icon className='text-muted-foreground size-4 shrink-0' />
        </CardHeader>
        <CardContent>
            <div className='text-3xl font-extrabold text-white tabular-nums sm:text-4xl'>{value}</div>
        </CardContent>
    </Card>
);

const MiniStatCard: FC<{ label: string; value: string; icon: LucideIcon; iconColor?: string }> = ({
    label,
    value,
    icon: Icon,
    iconColor
}) => (
    <Card className='bg-slr-navy-card/45 border-slr-navy-border h-full py-2'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pt-1.5 pb-1'>
            <CardTitle className='text-[10px] font-semibold tracking-widest text-slate-400 uppercase sm:text-xs'>
                {label}
            </CardTitle>
            <Icon className={`size-3.5 shrink-0 ${iconColor ?? 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent className='pb-1'>
            <div className='text-2xl font-extrabold text-white tabular-nums sm:text-3xl'>{value}</div>
        </CardContent>
    </Card>
);

const SimpleCountsBreakdown: FC<{
    title: string;
    rows: { label: string; count: number }[];
}> = ({ title, rows }) => {
    const sorted = [...rows].sort((a, b) => b.count - a.count);

    return (
        <Card className='h-full border-slr-navy-border bg-slr-navy-card/30 backdrop-blur-sm shadow-xl p-5 sm:p-6'>
            <CardHeader className='px-0 pb-4 pt-0 border-b border-slr-navy-border/40'>
                <CardTitle className='text-xs font-semibold tracking-wider uppercase text-slate-400'>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className='px-0 pt-4'>
                {sorted.length === 0 ? (
                    <p className='text-muted-foreground text-center py-4 italic text-xs'>No data.</p>
                ) : (
                    <div className='grid gap-3 grid-cols-1 sm:grid-cols-2 pt-1'>
                        {sorted.map((r) => (
                            <div
                                key={r.label}
                                className='flex flex-col justify-between p-4 rounded-xl border border-slr-navy-border/25 bg-slr-navy/35 hover:border-slr-navy-border/50 transition-colors min-h-24'
                            >
                                <span className='text-xs font-bold uppercase tracking-widest text-slate-400 truncate' title={r.label}>
                                    {r.label}
                                </span>
                                <div className='text-2xl sm:text-3xl font-extrabold text-white tabular-nums mt-2'>
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

    let data: AdminDashboardMetrics | null = null;
    try {
        data = token ? await getAdminDashboardMetrics(token) : null;
    } catch (error) {
        handleApiAuthError(error); // expired session → force logout
        data = null;
    }

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
        (data.alerts as any).cancelled_beny_subscriptions ??
        0;

    return (
        <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6'>
            <div>
                <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>Dashboard</h1>
                <p className='text-muted-foreground text-sm'>Platform overview & metrics.</p>
            </div>

            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <StatCard label='Total Members' value={data.total_members.toLocaleString()} icon={Users} />
                <StatCard
                    label='Active Subscriptions'
                    value={data.active_subscriptions.toLocaleString()}
                    icon={CreditCard}
                />
                <StatCard label='Monthly Recurring Revenue' value={formatMrr(data.mrr_cents)} icon={DollarSign} />
                <StatCard
                    label='Failed Payments (30d)'
                    value={data.alerts.failed_payments_30d.toLocaleString()}
                    icon={AlertTriangle}
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
                    />
                    <MiniStatCard
                        label='Active Accounts'
                        value={activeScr.toLocaleString()}
                        icon={Users}
                        iconColor='text-green-400'
                    />
                    <MiniStatCard
                        label='Pending Deactivations'
                        value={pendingDeact.toLocaleString()}
                        icon={AlertTriangle}
                        iconColor='text-amber-500'
                    />
                    <MiniStatCard
                        label='Cancelled Accounts'
                        value={cancelledScr.toLocaleString()}
                        icon={UserMinus}
                        iconColor='text-red-400'
                    />
                </div>
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
                <SimpleCountsBreakdown
                    title='Members by Tier'
                    rows={aggregateByLabel(data.members_by_tier.map((t) => ({ label: t.tier, count: t.count })))}
                />
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
