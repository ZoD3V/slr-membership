import { handleApiAuthError } from '@/lib/api/guard';
import { getMe } from '@/lib/api/resources/auth';
import { getAccessToken } from '@/lib/api/server';
import { subTierCodeOf } from '@/lib/member';
import { getSessionIdentity } from '@/lib/session-member';
import type { CurrentMember } from '@/types/member';

export async function getCurrentMember(): Promise<CurrentMember> {
    const identity = await getSessionIdentity();
    const token = await getAccessToken();

    if (token) {
        try {
            const me = await getMe(token);

            return {
                name: me.full_name || identity.name || 'Member',
                email: me.email || identity.email || '',
                sub_tier: subTierCodeOf(me.sub_tier ?? undefined),
                state: me.state || identity.state || '-',
                email_verified_at: me.email_verified_at
            };
        } catch (error) {
            handleApiAuthError(error);
        }
    }

    return {
        name: identity.name ?? 'Member',
        email: identity.email ?? '',
        sub_tier: identity.sub_tier ?? 'VISITOR',
        state: identity.state ?? '-',
        email_verified_at: null
    };
}
