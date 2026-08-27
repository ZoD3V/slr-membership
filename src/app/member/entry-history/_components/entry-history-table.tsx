import { EntryStatusBadge } from '@/components/common/entry-status-badge';
import { TierBadge } from '@/components/common/tier-badge';
import type { EntryCycle } from '@/lib/api/resources/entries';
import type { SubTierCode } from '@/types/member';

function tokenText(value: number, prefix = ''): string {
    return value > 0 ? `${prefix}${value}` : '-';
}

function tierChangeLabel(entries: EntryCycle[], index: number): string | null {
    const prevTier = entries[index + 1]?.tier;
    const currentTier = entries[index]?.tier;
    if (!prevTier || !currentTier || prevTier.toLowerCase() === currentTier.toLowerCase()) return null;

    return `Changed from ${prevTier.toUpperCase()}`;
}

function formatDateRange(startStr: string | null | undefined, endStr: string | null | undefined): string {
    if (!startStr || !endStr) return '-';

    const start = new Date(startStr);
    const end = new Date(endStr);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '-';

    const fmt = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

    return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export function EntryHistoryTable({ entries }: { entries: EntryCycle[] }) {
    if (!entries.length) return null;

    return (
        <>
            <div className='bg-card-dark-navy border-slr-navy-border hidden overflow-hidden rounded-2xl border md:block'>
                <table className='w-full text-sm'>
                    <thead>
                        <tr className='border-slr-navy-border text-slr-dim border-b text-xs tracking-wider uppercase'>
                            <th className='px-4 py-3 text-left font-medium'>Cycle</th>
                            <th className='px-4 py-3 text-left font-medium'>Tier</th>
                            <th className='px-4 py-3 text-right font-medium'>Base</th>
                            <th className='px-4 py-3 text-right font-medium'>Referral</th>
                            <th className='px-4 py-3 text-right font-medium'>Total</th>
                            <th className='px-4 py-3 text-left font-medium'>Entry Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((e, index) => (
                            <tr key={e.cycle_id} className='border-slr-navy-border/50 border-b last:border-0'>
                                <td className='px-4 py-3'>
                                    <p className='font-medium text-white'>
                                        {index === 0 ? 'Current Cycle' : 'Past Cycle'}
                                    </p>
                                    <p className='text-slr-dim text-xs'>{formatDateRange(e.start_at, e.end_at)}</p>
                                </td>
                                <td className='px-4 py-3'>
                                    <div className='flex items-center gap-2'>
                                        <TierBadge
                                            subTier={((e.tier?.toUpperCase() || 'VISITOR') as SubTierCode) || 'VISITOR'}
                                            size='sm'
                                        />
                                    </div>
                                    {tierChangeLabel(entries, index) && (
                                        <p className='text-slr-gold-label mt-1 text-[10px] uppercase'>
                                            {tierChangeLabel(entries, index)}
                                        </p>
                                    )}
                                </td>
                                <td className='px-4 py-3 text-right text-white/90 tabular-nums'>
                                    {tokenText(e.base_token)}
                                </td>
                                <td className='px-4 py-3 text-right text-white/90 tabular-nums'>
                                    {tokenText(e.referral_bonus, '+')}
                                </td>
                                <td className='px-4 py-3 text-right font-semibold text-white tabular-nums'>
                                    {e.total_token || 0}
                                </td>
                                <td className='px-4 py-3'>
                                    <EntryStatusBadge status={e.entry_status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className='space-y-3 md:hidden'>
                {entries.map((e, index) => (
                    <div key={e.cycle_id} className='bg-card-dark-navy border-slr-navy-border rounded-2xl border p-4'>
                        <div className='flex items-start justify-between gap-2'>
                            <div>
                                <p className='font-medium text-white'>{index === 0 ? 'Current Cycle' : 'Past Cycle'}</p>
                                <p className='text-slr-dim text-xs'>{formatDateRange(e.start_at, e.end_at)}</p>
                            </div>
                            <EntryStatusBadge status={e.entry_status} />
                        </div>

                        <div className='mt-3 flex flex-wrap items-center gap-2'>
                            <TierBadge
                                subTier={((e.tier?.toUpperCase() || 'VISITOR') as SubTierCode) || 'VISITOR'}
                                size='sm'
                            />
                            {tierChangeLabel(entries, index) && (
                                <span className='text-slr-gold-label text-[10px] uppercase'>
                                    {tierChangeLabel(entries, index)}
                                </span>
                            )}
                        </div>

                        <div className='mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-center'>
                            <div>
                                <p className='text-slr-dim text-xs uppercase'>Base</p>
                                <p className='text-white tabular-nums'>{tokenText(e.base_token)}</p>
                            </div>
                            <div>
                                <p className='text-slr-dim text-xs uppercase'>Referral</p>
                                <p className='text-white tabular-nums'>{tokenText(e.referral_bonus, '+')}</p>
                            </div>
                            <div>
                                <p className='text-slr-dim text-xs uppercase'>Total</p>
                                <p className='font-semibold text-white tabular-nums'>{e.total_token || 0}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
