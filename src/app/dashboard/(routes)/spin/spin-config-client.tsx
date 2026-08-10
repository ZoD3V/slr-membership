'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SPIN_ELIGIBLE_SUB_TIERS, SUB_TIERS } from '@/constant/tiers';
import type { SpinConfig, SpinSubTierConfig, SubTierCode } from '@/types/member';

import { saveSpinConfigAction } from './actions';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

// Derived from the authoritative constant (also read by the member-side spin
// flow) so admin and member eligibility can't silently drift apart.
const ELIGIBLE_SUB_TIERS = Array.from(SPIN_ELIGIBLE_SUB_TIERS) as SubTierCode[];

function findSubTier(config: SpinConfig, code: SubTierCode): SpinSubTierConfig | undefined {
    return config.sub_tiers.find((t) => t.sub_tier_id === code.toLowerCase());
}

function toEditableRow(config: SpinConfig, code: SubTierCode) {
    const existing = findSubTier(config, code);

    return {
        has_spin: existing?.has_spin ?? false,
        spin_discount_cents: existing?.spin_discount_cents ?? 0
    };
}

export function SpinConfigClient({ config }: { config: SpinConfig }) {
    const [isPending, startTransition] = useTransition();

    // No react-hook-form here: toggles + a small numeric field, no cross-field
    // validation rules worth pulling in RHF+Zod for.
    const [globalEnabled, setGlobalEnabled] = useState(config.global_enabled);
    const [rows, setRows] = useState(() =>
        Object.fromEntries(ELIGIBLE_SUB_TIERS.map((code) => [code, toEditableRow(config, code)]))
    );
    // Raw text per row so a blank/mid-edit discount field doesn't snap to 0
    // while the admin is typing — see Prizes/Safe Hours for the same reasoning
    // applied to a different value.
    const [discountText, setDiscountText] = useState(() =>
        Object.fromEntries(
            ELIGIBLE_SUB_TIERS.map((code) => [code, String(toEditableRow(config, code).spin_discount_cents / 100)])
        )
    );

    const isDirty =
        globalEnabled !== config.global_enabled ||
        ELIGIBLE_SUB_TIERS.some((code) => {
            const original = toEditableRow(config, code);

            return (
                rows[code].has_spin !== original.has_spin ||
                rows[code].spin_discount_cents !== original.spin_discount_cents
            );
        });

    const setHasSpin = (code: SubTierCode, has_spin: boolean) => {
        setRows((prev) => ({ ...prev, [code]: { ...prev[code], has_spin } }));
    };

    const setDiscount = (code: SubTierCode, text: string) => {
        setDiscountText((prev) => ({ ...prev, [code]: text }));

        // A blank/whitespace field is treated the same as an invalid number
        // (NaN, negative): keep the last valid cents value rather than
        // committing $0.00. Number('') === 0 is finite and >= 0, so an empty
        // string must be excluded explicitly — it doesn't fail the numeric
        // checks below on its own.
        const trimmed = text.trim();
        const dollars = Number(trimmed);
        const cents =
            trimmed !== '' && Number.isFinite(dollars) && dollars >= 0
                ? Math.round(dollars * 100)
                : rows[code].spin_discount_cents;

        setRows((prev) => ({ ...prev, [code]: { ...prev[code], spin_discount_cents: cents } }));
    };

    const handleSave = () => {
        // Preserve every sub_tier the last GET returned, even ones this form
        // doesn't render (ineligible codes) — a save must never silently drop
        // them from the document.
        const eligibleIds = new Set(ELIGIBLE_SUB_TIERS.map((code) => code.toLowerCase()));
        const untouched = config.sub_tiers.filter((t) => !eligibleIds.has(t.sub_tier_id));
        const edited: SpinSubTierConfig[] = ELIGIBLE_SUB_TIERS.map((code) => ({
            sub_tier_id: code.toLowerCase() as SpinSubTierConfig['sub_tier_id'],
            marketing_name: SUB_TIERS[code].marketingName,
            has_spin: rows[code].has_spin,
            spin_discount_cents: rows[code].spin_discount_cents
        }));

        startTransition(async () => {
            const result = await saveSpinConfigAction({
                global_enabled: globalEnabled,
                sub_tiers: [...untouched, ...edited]
            });

            if (result.ok) {
                toast.success(result.message);
            } else {
                toast.error(result.message, {
                    description: result.status ? `status ${result.status} · ${result.code ?? 'no code'}` : undefined
                });
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                    <Label htmlFor='spin-enabled'>Spin wheel enabled (all tiers)</Label>
                    <Switch id='spin-enabled' checked={globalEnabled} onCheckedChange={setGlobalEnabled} />
                </div>

                <fieldset className='min-w-0 space-y-4 border-t pt-4'>
                    <legend className='text-sm font-semibold'>Per sub-tier</legend>
                    {ELIGIBLE_SUB_TIERS.map((code) => (
                        <div key={code} className='flex items-center justify-between gap-4'>
                            <Label htmlFor={`spin-tier-${code}`} className='min-w-0 flex-1'>
                                {SUB_TIERS[code].label} · {SUB_TIERS[code].marketingName}
                            </Label>
                            <div className='flex items-center gap-2'>
                                <span className='text-slr-dim text-xs'>$</span>
                                <Input
                                    aria-label={`${SUB_TIERS[code].marketingName} discount, dollars`}
                                    type='number'
                                    min={0}
                                    step='0.01'
                                    className='h-8 w-20'
                                    value={discountText[code]}
                                    onChange={(e) => setDiscount(code, e.target.value)}
                                />
                                <Switch
                                    id={`spin-tier-${code}`}
                                    checked={rows[code].has_spin}
                                    onCheckedChange={(checked) => setHasSpin(code, checked)}
                                />
                            </div>
                        </div>
                    ))}
                </fieldset>

                <Button onClick={handleSave} disabled={isPending || !isDirty}>
                    {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : null}
                    Save changes
                </Button>
            </CardContent>
        </Card>
    );
}
