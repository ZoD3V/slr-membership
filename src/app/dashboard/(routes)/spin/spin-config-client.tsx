'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SUB_TIERS } from '@/constant/tiers';
import type { SpinConfig, SpinEligibleSubTier } from '@/types/member';

import { saveSpinConfigAction } from './actions';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

const ELIGIBLE_SUB_TIERS: SpinEligibleSubTier[] = ['R4', 'R7', 'B4', 'B7', 'B10'];

export function SpinConfigClient({ config }: { config: SpinConfig }) {
    const [isPending, startTransition] = useTransition();

    // No react-hook-form here: every field is a Switch, so there is nothing to
    // validate — Prizes/Safe Hours use RHF+Zod because they have text/number
    // fields with real validation rules; this form has none.
    const [enabled, setEnabled] = useState(config.enabled);
    const [subTierEnabled, setSubTierEnabled] = useState(config.sub_tier_enabled);

    const isDirty =
        enabled !== config.enabled ||
        ELIGIBLE_SUB_TIERS.some((code) => subTierEnabled[code] !== config.sub_tier_enabled[code]);

    const handleSave = () => {
        startTransition(async () => {
            const result = await saveSpinConfigAction({ enabled, sub_tier_enabled: subTierEnabled });

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
                    <Switch id='spin-enabled' checked={enabled} onCheckedChange={setEnabled} />
                </div>

                <div className='space-y-3 border-t pt-4'>
                    {ELIGIBLE_SUB_TIERS.map((code) => (
                        <div key={code} className='flex items-center justify-between'>
                            <Label htmlFor={`spin-tier-${code}`}>
                                {SUB_TIERS[code].label} · {SUB_TIERS[code].marketingName}
                            </Label>
                            <Switch
                                id={`spin-tier-${code}`}
                                checked={subTierEnabled[code]}
                                onCheckedChange={(checked) =>
                                    setSubTierEnabled((prev) => ({ ...prev, [code]: checked }))
                                }
                            />
                        </div>
                    ))}
                </div>

                <Button onClick={handleSave} disabled={isPending || !isDirty}>
                    {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : null}
                    Save changes
                </Button>
            </CardContent>
        </Card>
    );
}
