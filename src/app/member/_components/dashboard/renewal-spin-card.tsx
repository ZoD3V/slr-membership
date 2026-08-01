'use client';

import { useEffect, useState } from 'react';

import { type SpinOutcome, SpinWheel } from '@/components/common/spin-wheel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { goldButtonStyle } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { runRenewalSpin } from '../../spin-actions';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

type RenewalSpinCardProps = {
    /** Prize on offer for this sub-tier, in dollars. */
    discount: number;
    /** ISO — the spin is forfeited at renewal time if unused (PRD §4.5 moment 2). */
    expiresAt: string | null;
    className?: string;
};

/** "2h 15m" until the deadline, or null once it has passed. */
function timeLeft(expiresAt: string | null): string | null {
    if (!expiresAt) return null;
    const ms = Date.parse(expiresAt) - Date.now();
    if (Number.isNaN(ms) || ms <= 0) return null;

    const hours = Math.floor(ms / 3_600_000);
    const minutes = Math.floor((ms % 3_600_000) / 60_000);

    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/**
 * PRD §4.5 moment 2 — the spin offered 24h before auto-renewal. A win discounts
 * that one renewal invoice; losing or letting it expire renews at full price.
 */
export function RenewalSpinCard({ discount, expiresAt, className }: RenewalSpinCardProps) {
    const [open, setOpen] = useState(false);
    const [outcome, setOutcome] = useState<SpinOutcome | null>(null);
    const [remaining, setRemaining] = useState<string | null>(null);

    // Rendered on the client only so the server and client agree on "now".
    useEffect(() => {
        const tick = () => setRemaining(timeLeft(expiresAt));
        tick();
        const id = setInterval(tick, 60_000);

        return () => clearInterval(id);
    }, [expiresAt]);

    const spin = async (): Promise<SpinOutcome | null> => {
        const res = await runRenewalSpin();
        if (!res.ok) {
            toast.error(res.message);

            return null;
        }

        return { won: res.won, discount: res.discount };
    };

    return (
        <>
            <section className={cn('relative isolate rounded-2xl p-px', className)}>
                <div aria-hidden className='bg-frame-gold absolute inset-0 -z-10 rounded-2xl' />
                <div className='bg-card-gold shadow-card-warm relative isolate overflow-hidden rounded-[calc(1rem-1px)] p-5 md:p-6'>
                    <div
                        aria-hidden
                        className='slr-stars-overlay pointer-events-none absolute inset-0 -z-10 opacity-40'
                    />
                    <div
                        aria-hidden
                        className='bg-slr-gold-metal/10 pointer-events-none absolute -top-16 -right-16 -z-10 size-56 rounded-full blur-3xl'
                    />
                    <div className='flex flex-wrap items-start justify-between gap-3'>
                        <div>
                            <p className='text-slr-gold-label text-xs font-semibold tracking-widest uppercase'>
                                Renewal spin
                            </p>
                            <h2 className='font-bebas-neue mt-1 text-2xl tracking-wide text-white uppercase md:text-3xl'>
                                {outcome
                                    ? outcome.won
                                        ? `You won $${outcome.discount} off`
                                        : 'No prize this time'
                                    : `Win up to $${discount} off`}
                            </h2>
                            <p className='text-slr-muted mt-1 text-sm'>
                                {outcome
                                    ? outcome.won
                                        ? 'Your discount is applied to the upcoming renewal invoice.'
                                        : 'Your membership renews at the usual price. You can spin again before your next renewal.'
                                    : 'One spin before your renewal. A win discounts that invoice only.'}
                            </p>
                            {outcome || !remaining ? null : (
                                <p className='text-slr-dim mt-1 text-xs'>
                                    Expires in {remaining} — unused spins are forfeited.
                                </p>
                            )}
                        </div>

                        {outcome ? null : (
                            <Button
                                className='h-11 rounded-xl font-bold uppercase'
                                style={goldButtonStyle}
                                onClick={() => setOpen(true)}>
                                <Sparkles className='size-4' />
                                Spin now
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            <Dialog
                open={open}
                onOpenChange={(next) => {
                    // Keep it open while the wheel is mid-flight so the result is seen.
                    setOpen(next);
                }}>
                <DialogContent className='border-slr-navy-border bg-card-dark-navy sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='font-bebas-neue text-2xl tracking-wider text-white uppercase'>
                            Your renewal spin
                        </DialogTitle>
                        <DialogDescription className='text-slr-muted text-sm'>
                            {outcome
                                ? outcome.won
                                    ? `$${outcome.discount} comes off your next invoice.`
                                    : 'No prize — your renewal stays at the usual price.'
                                : `One spin, ${discount > 0 ? `$${discount} off` : 'a discount'} if you win.`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='py-2'>
                        <SpinWheel winDiscount={discount} onSpin={spin} onSettled={setOutcome} spinLabel='Spin' />
                    </div>

                    {outcome ? (
                        <Button
                            className='h-11 w-full rounded-xl font-bold uppercase'
                            style={goldButtonStyle}
                            onClick={() => setOpen(false)}>
                            Done
                        </Button>
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
}
