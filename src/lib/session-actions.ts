'use server';

import { unstable_update as updateSession } from '@/auth';
import { getMe } from '@/lib/api/resources/auth';
import { getAccessToken } from '@/lib/api/server';

export async function syncPaymentState(): Promise<{ requiresPayment: boolean } | null> {
    const token = await getAccessToken();
    if (!token) return null;

    try {
        const me = await getMe(token);
        const requiresPayment = me.requires_payment === true;

        await updateSession({
            requiresPayment,
            tier: me.tier,
            sub_tier: me.sub_tier ?? null
        } as never);

        return { requiresPayment };
    } catch {
        return null;
    }
}
