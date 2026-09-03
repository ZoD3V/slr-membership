'use client';

import { useEffect, useState, useTransition } from 'react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { Input } from '@/components/ui/input';
import { BENY_MONTHLY_PRICE } from '@/constant/tiers';
import { BENY_CATEGORIES } from '@/data/discounts';
import { type BenyStatusValue, isBenyCancelled, isBenyWindingDown } from '@/lib/api/resources/beny';
import { goldButtonStyle, inputClassName } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { MemberProfile } from '@/types/member';

import { cancelBenyAction, subscribeBenyAction } from '../beny-actions';
import { Check, Clock, Fuel, Heart, Loader2Icon, type LucideIcon, ShoppingBag, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_ICON: Record<string, LucideIcon> = {
    'Petrol Saving': Fuel,
    'Retail Partner Discounts': ShoppingBag,
    'Lifestyle Offers': Sparkles,
    'Health & Wellbeing': Heart
};

function formatExpiryLongDate(iso: string | null | undefined): string {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';

    const day = d.toLocaleString('en-US', { day: 'numeric', timeZone: 'Australia/Sydney' });
    const month = d.toLocaleString('en-US', { month: 'long', timeZone: 'Australia/Sydney' });
    const year = d.toLocaleString('en-US', { year: 'numeric', timeZone: 'Australia/Sydney' });

    return `${day} ${month} ${year}`;
}

export function BenySection({
    status: initialStatus,
    userProfile,
    cancelledAt = null,
    expiresAt = null
}: {
    status: BenyStatusValue;
    userProfile?: MemberProfile | null;
    cancelledAt?: string | null;
    expiresAt?: string | null;
}) {
    const [status, setStatus] = useState<BenyStatusValue>(
        initialStatus === 'active' && cancelledAt ? 'pending_deactivation' : initialStatus
    );
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: userProfile?.name ?? '',
        email: userProfile?.email ?? '',
        phone: userProfile?.phone ?? ''
    });
    const [isPending, startTransition] = useTransition();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setForm({
                name: userProfile.name ?? '',
                email: userProfile.email ?? '',
                phone: userProfile.phone ?? ''
            });
        }
    }, [userProfile]);

    const canSubscribe = status === 'inactive' || isBenyCancelled(status);

    const handleSubmitAttempt = (e: React.FormEvent) => {
        e.preventDefault();
        setConfirmOpen(true);
    };

    const handleConfirmSubscribe = () => {
        setConfirmOpen(false);
        startTransition(async () => {
            const res = await subscribeBenyAction(form);
            if (res.ok) {
                setStatus(res.status);
                setShowForm(false);
                setForm({
                    name: userProfile?.name ?? '',
                    email: userProfile?.email ?? '',
                    phone: userProfile?.phone ?? ''
                });
                if (res.checkoutUrl) {
                    window.open(res.checkoutUrl, '_blank', 'noopener,noreferrer');
                    toast.success(
                        `Complete your $${BENY_MONTHLY_PRICE}/month payment in the new tab to finish adding BENY.`
                    );
                } else {
                    toast.success('BENY requested — pending admin activation.');
                }
            } else {
                toast.error(res.code ? `${res.message} (${res.code})` : res.message);
            }
        });
    };

    const handleConfirmCancel = () => {
        setConfirmCancelOpen(false);
        startTransition(async () => {
            const res = await cancelBenyAction();
            if (res.ok) {
                setStatus(res.status);
                toast.success(res.message);
            } else {
                if (process.env.NODE_ENV === 'development') {
                    console.error('[Cancel BENY Error]', {
                        endpoint: 'DELETE /api/v1/beny/subscribe',
                        error: res
                    });
                }
                toast.error(res.code ? `${res.message} (${res.code})` : res.message);
            }
        });
    };

    return (
        <section className='bg-card-dark-navy border-slr-navy-border rounded-2xl border p-5 md:p-6'>
            <div className='flex flex-wrap items-start justify-between gap-2'>
                <div>
                    <h2 className='font-bebas-neue text-xl tracking-wide text-white uppercase md:text-2xl'>
                        Extra Saving with BENY
                    </h2>
                    <p className='text-slr-muted mt-1 max-w-xl text-sm leading-relaxed'>
                        Optional add-on unlocking premium brand discounts through the BENY app. Billed separately,
                        cancel anytime.
                    </p>
                </div>
                <span
                    className='text-slr-gold-label shrink-0 rounded-md border border-[#D4AF3759] px-2.5 py-1 text-sm font-semibold'
                    style={{ background: '#291F0A' }}>
                    {`$${BENY_MONTHLY_PRICE}/month`}
                </span>
            </div>

            <div className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4'>
                {BENY_CATEGORIES.map((c) => {
                    const Icon = CATEGORY_ICON[c] ?? Sparkles;
                    const isActive = status === 'active';

                    return (
                        <div
                            key={c}
                            className={cn(
                                'flex items-center gap-2 rounded-lg border px-3 py-2 transition-all duration-300',
                                isActive
                                    ? 'border-[#FFD147] bg-[#FFD1471A] font-semibold text-[#FFDC75] shadow-[0_0_12px_rgba(254,209,71,0.15)]'
                                    : 'border-slr-navy-border bg-black/20 text-white/90'
                            )}>
                            <Icon className='text-slr-gold-label size-4 shrink-0' />
                            <span className='text-xs'>{c}</span>
                        </div>
                    );
                })}
            </div>

            <div className='mt-5 border-t border-white/5 pt-4'>
                {status === 'active' || status === 'pending_activation' ? (
                    <div className='flex flex-wrap items-center justify-between gap-3'>
                        {status === 'active' ? (
                            <span className='inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400'>
                                <Check className='size-4' /> BENY is active on your account
                            </span>
                        ) : (
                            <span className='inline-flex items-start gap-2 text-sm text-white/90'>
                                <Clock className='text-slr-gold-label mt-0.5 size-4 shrink-0' />
                                Pending activation — you&apos;ll receive access details by email shortly, then download
                                the BENY app to start saving.
                            </span>
                        )}
                        <button
                            type='button'
                            onClick={() => setConfirmCancelOpen(true)}
                            disabled={isPending}
                            className='inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/15 px-4 py-1.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-60'>
                            {isPending ? <Loader2Icon className='size-4 animate-spin' /> : null}
                            Cancel BENY
                        </button>
                    </div>
                ) : null}

                {isBenyWindingDown(status) ? (
                    <span className='inline-flex items-start gap-2 text-sm text-white/90'>
                        <Clock className='text-slr-gold-label mt-0.5 size-4 shrink-0' />
                        Deactivate on {formatExpiryLongDate(expiresAt)}
                    </span>
                ) : null}

                {canSubscribe &&
                    (showForm ? (
                        <form onSubmit={handleSubmitAttempt} className='space-y-3'>
                            <p className='text-slr-muted text-sm'>
                                Enter your details to add BENY. You&apos;ll be redirected to secure checkout for the
                                {`$${BENY_MONTHLY_PRICE}/month`} subscription.
                            </p>
                            <div className='grid gap-3 sm:grid-cols-3'>
                                <Input
                                    required
                                    className={inputClassName}
                                    placeholder='Full name'
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                                <Input
                                    required
                                    type='email'
                                    className={inputClassName}
                                    placeholder='Email'
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                                <Input
                                    required
                                    type='tel'
                                    className={inputClassName}
                                    placeholder='Phone'
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                            <div className='flex items-center gap-2'>
                                <button
                                    type='submit'
                                    disabled={isPending}
                                    className='inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold uppercase disabled:opacity-60'
                                    style={goldButtonStyle}>
                                    {isPending ? <Loader2Icon className='size-4 animate-spin' /> : null}
                                    Continue to checkout
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setShowForm(false)}
                                    className='text-slr-dim px-3 py-2 text-sm hover:text-white'>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className='flex flex-wrap items-center justify-between gap-3'>
                            <span className='text-slr-muted text-sm'>
                                {isBenyCancelled(status)
                                    ? 'BENY canceled — you can re-add it anytime.'
                                    : 'Not subscribed yet.'}
                            </span>
                            <button
                                type='button'
                                onClick={() => setShowForm(true)}
                                className={cn(
                                    'inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-bold uppercase'
                                )}
                                style={goldButtonStyle}>
                                Add BENY — {`$${BENY_MONTHLY_PRICE}/mo`}
                            </button>
                        </div>
                    ))}
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title='Add BENY Add-on?'
                confirmText={isPending ? 'Adding...' : 'Yes, add addon'}
                cancelBtnText='Keep membership only'
                isLoading={isPending}
                handleConfirm={handleConfirmSubscribe}
                desc={`This will add the helper BENY savings addon. Confirming this will charge an extra $${BENY_MONTHLY_PRICE.toFixed(2)} AUD per month recursively on Stripe.`}
            />

            <ConfirmDialog
                open={confirmCancelOpen}
                onOpenChange={setConfirmCancelOpen}
                title='Cancel BENY Add-on?'
                destructive
                confirmText={isPending ? 'Cancelling...' : 'Yes, cancel addon'}
                cancelBtnText='Keep BENY addon'
                isLoading={isPending}
                handleConfirm={handleConfirmCancel}
                desc={`Are you sure you want to cancel your BENY savings add-on? Your $${BENY_MONTHLY_PRICE.toFixed(2)} AUD monthly charge will stop at the end of the paid period.`}
            />
        </section>
    );
}
