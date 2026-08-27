'use client';

import { useState } from 'react';

import type { ReferralStatus } from '@/lib/api/resources/referral';
import { formatShortDate } from '@/lib/member';
import { cn } from '@/lib/utils';

import { Check, Copy, Gift, Share2, Users } from 'lucide-react';
import { toast } from 'sonner';

const GIFT_STATUS_LABEL: Record<string, string> = {
    pending: 'Pending',
    sent: 'Sent',
    fulfilled: 'Fulfilled'
};

export function ReferralSection({ referral }: { referral: ReferralStatus }) {
    const [copied, setCopied] = useState(false);
    const { referral_code, tier_type, total_referrals, progress_to_next, bonus_history, gift_history } = referral;
    const progressPct =
        progress_to_next.target > 0
            ? Math.min(100, Math.round((progress_to_next.current / progress_to_next.target) * 100))
            : 0;

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(referral_code);
            setCopied(true);
            toast.success('Referral code copied');
            setTimeout(() => setCopied(false), 1500);
        } catch {
            toast.error('Could not copy code');
        }
    };

    const shareCode = async () => {
        const text = `Join Smart Life Rewards with my referral code ${referral_code} and start earning rewards!`;

        if (navigator.share) {
            try {
                await navigator.share({ title: 'Smart Life Rewards', text });
            } catch {
                void 0;
            }

            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            toast.success('Referral message copied to clipboard');
        } catch {
            toast.error('Could not copy referral message');
        }
    };

    const history =
        tier_type === 'paid'
            ? (bonus_history ?? [])
            : [...(gift_history ?? [])].sort((a, b) => Date.parse(b.triggered_at) - Date.parse(a.triggered_at));

    return (
        <div className='space-y-6'>
            <section className='bg-card-dark-navy border-slr-navy-border rounded-2xl border p-5 md:p-6'>
                <p className='text-slr-gold-label text-xs font-semibold uppercase md:text-sm'>Your Referral Code</p>
                <div className='mt-3 flex flex-wrap items-center gap-3'>
                    <span className='font-bebas-neue rounded-xl border border-[#D4AF3759] bg-[#291F0A] px-5 py-2.5 text-2xl tracking-[0.2em] text-white uppercase md:text-3xl'>
                        {referral_code}
                    </span>
                    <button
                        type='button'
                        onClick={copyCode}
                        className='border-slr-navy-border inline-flex h-10 items-center gap-2 rounded-xl border bg-white/5 px-4 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10'>
                        {copied ? <Check className='size-4 text-emerald-400' /> : <Copy className='size-4' />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                        type='button'
                        onClick={shareCode}
                        className='border-slr-navy-border inline-flex h-10 items-center gap-2 rounded-xl border bg-white/5 px-4 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10'>
                        <Share2 className='size-4' />
                        Share
                    </button>
                </div>
                <p className='text-slr-muted mt-3 text-sm leading-relaxed'>
                    {tier_type === 'paid'
                        ? 'Share your code with friends. Every 10 successful referrals earns you +3 bonus tokens.'
                        : 'Share your code with friends. Referral milestones are gifted manually by our team.'}
                </p>
            </section>

            <section className='bg-card-dark-navy border-slr-navy-border rounded-2xl border p-5 md:p-6'>
                <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                        <Users className='text-slr-gold-label size-5' />
                        <h2 className='font-bebas-neue text-xl tracking-wide text-white uppercase'>
                            Referral Progress
                        </h2>
                    </div>
                    <span className='text-sm font-semibold text-white tabular-nums'>{total_referrals} total</span>
                </div>
                <div className='mt-4'>
                    <div className='bg-slr-navy-border h-2 w-full overflow-hidden rounded-full'>
                        <div
                            className='bg-gradient-gold h-full rounded-full transition-all'
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    <p className='text-slr-dim mt-2 text-xs tabular-nums'>
                        {progress_to_next.current} / {progress_to_next.target} referrals to next{' '}
                        {tier_type === 'paid' ? 'bonus' : 'gift'}
                    </p>
                </div>
            </section>

            <section className='bg-card-dark-navy border-slr-navy-border rounded-2xl border p-5 md:p-6'>
                <div className='mb-4 flex items-center gap-2'>
                    <Gift className='text-slr-gold-label size-5' />
                    <h2 className='font-bebas-neue text-xl tracking-wide text-white uppercase'>
                        {tier_type === 'paid' ? 'Bonus History' : 'Gift History'}
                    </h2>
                </div>
                {history.length === 0 ? (
                    <p className='text-slr-dim text-sm'>No rewards yet — keep sharing your code.</p>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='text-slr-dim border-b border-white/5 text-left text-xs uppercase'>
                                    <th className='py-2 pr-4 font-medium'>Date</th>
                                    <th className='py-2 pr-4 font-medium'>Referrals</th>
                                    <th className='py-2 pr-4 font-medium'>{tier_type === 'paid' ? 'Bonus' : 'Note'}</th>
                                    <th className='py-2 font-medium'>Status</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-white/5'>
                                {tier_type === 'paid'
                                    ? (bonus_history ?? []).map((entry, i) => (
                                          <tr key={i} className='text-white/90'>
                                              <td className='py-2.5 pr-4'>{formatShortDate(entry.triggered_at)}</td>
                                              <td className='py-2.5 pr-4 tabular-nums'>{entry.referral_count}</td>
                                              <td className='py-2.5 pr-4 tabular-nums'>+{entry.bonus_token} tokens</td>
                                              <td className='py-2.5 capitalize'>{entry.status}</td>
                                          </tr>
                                      ))
                                    : history.map((entry, i) => (
                                          <tr key={i} className='text-white/90'>
                                              <td className='py-2.5 pr-4'>{formatShortDate(entry.triggered_at)}</td>
                                              <td className='py-2.5 pr-4 tabular-nums'>{entry.referral_count}</td>
                                              <td className='text-slr-dim py-2.5 pr-4'>{entry.admin_note ?? '-'}</td>
                                              <td className='py-2.5'>
                                                  <span
                                                      className={cn(
                                                          'font-semibold',
                                                          entry.gift_status === 'fulfilled'
                                                              ? 'text-emerald-400'
                                                              : 'text-slr-gold-label'
                                                      )}>
                                                      {GIFT_STATUS_LABEL[entry.gift_status] ?? entry.gift_status}
                                                  </span>
                                              </td>
                                          </tr>
                                      ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
