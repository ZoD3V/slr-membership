'use client';

import { useState, useTransition } from 'react';

import { Switch } from '@/components/ui/switch';
import {
    CONSENT_LABELS,
    type ConsentRecord,
    type ConsentType,
    LEGAL_CONSENTS,
    MARKETING_CONSENTS,
    consentMap
} from '@/lib/api/resources/consents';
import { formatShortDate } from '@/lib/member';

import { updateConsentAction } from '../actions';
import { Check, Loader2Icon, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const DESCRIPTIONS: Record<ConsentType, string> = {
    TERMS_OF_SERVICE: 'Accepted when you created your account.',
    PRIVACY_POLICY: 'Accepted when you created your account.',
    MARKETING_EMAIL: 'Weekly winner announcements, member offers and merchant reward updates.',
    MARKETING_SMS: 'Draw reminders and winner alerts by text message.'
};

export function CommunicationPreferences({ consents }: { consents: ConsentRecord[] }) {
    const [state, setState] = useState(() => consentMap(consents));
    const [saving, setSaving] = useState<ConsentType | null>(null);
    const [, startTransition] = useTransition();

    const latest = (type: ConsentType) => consents.find((c) => c.consent_type === type);

    const toggle = (type: ConsentType, next: boolean) => {
        setState((s) => ({ ...s, [type]: next }));
        setSaving(type);
        startTransition(async () => {
            const res = await updateConsentAction(type, next);
            setSaving(null);
            if (res.ok) {
                toast.success(next ? `${CONSENT_LABELS[type]} turned on.` : `${CONSENT_LABELS[type]} turned off.`);

                return;
            }
            // Roll back so the switch never claims a preference the server rejected.
            setState((s) => ({ ...s, [type]: !next }));
            toast.error(res.message);
        });
    };

    return (
        <section className='bg-card-dark-navy border-slr-navy-border rounded-2xl border p-5 md:p-6'>
            <h2 className='font-bebas-neue text-xl tracking-wide text-white uppercase'>Communication preferences</h2>
            <p className='text-slr-muted mt-1 text-sm'>
                Choose how we contact you. You can change this at any time — it never affects your draw entries.
            </p>

            <div className='mt-5 space-y-3'>
                {MARKETING_CONSENTS.map((type) => (
                    <div
                        key={type}
                        className='border-slr-navy-border flex items-start justify-between gap-4 rounded-xl border bg-white/2 p-4'>
                        <div className='min-w-0'>
                            <label htmlFor={type} className='text-sm font-semibold text-pretty text-white select-none'>
                                {CONSENT_LABELS[type]}
                            </label>
                            <p className='text-slr-muted mt-0.5 text-xs text-pretty'>{DESCRIPTIONS[type]}</p>
                        </div>
                        <div className='flex shrink-0 items-center gap-2'>
                            {saving === type ? <Loader2Icon className='text-slr-dim size-4 animate-spin' /> : null}
                            <Switch
                                id={type}
                                checked={state[type] ?? false}
                                disabled={saving !== null}
                                onCheckedChange={(next) => toggle(type, next)}
                                aria-label={CONSENT_LABELS[type]}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className='mt-5 border-t border-white/10 pt-4'>
                <p className='text-slr-dim text-[10px] font-semibold tracking-widest uppercase'>Legal acceptance</p>
                <ul className='mt-2 space-y-1.5'>
                    {LEGAL_CONSENTS.map((type) => {
                        const record = latest(type);

                        return (
                            <li key={type} className='flex items-center gap-2 text-xs text-white/80'>
                                {record?.agreed ? (
                                    <Check className='size-3.5 shrink-0 text-emerald-400' />
                                ) : (
                                    <ShieldCheck className='text-slr-dim size-3.5 shrink-0' />
                                )}
                                <span>{CONSENT_LABELS[type]}</span>
                                <span className='text-slr-dim'>
                                    {record
                                        ? `v${record.version ?? '—'} · ${formatShortDate(record.updated_at)}`
                                        : 'Not recorded'}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
