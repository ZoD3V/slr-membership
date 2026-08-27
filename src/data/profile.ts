import { handleApiAuthError } from '@/lib/api/guard';
import { type MeResult, getMe } from '@/lib/api/resources/auth';
import { getAccessToken } from '@/lib/api/server';
import { subTierCodeOf } from '@/lib/member';
import { getSessionIdentity } from '@/lib/session-member';
import type { MemberProfile } from '@/types/member';

export async function getMemberProfile(): Promise<MemberProfile> {
    const identity = await getSessionIdentity();
    const token = await getAccessToken();

    let me: MeResult | null = null;
    if (token) {
        try {
            me = await getMe(token);
        } catch (error) {
            handleApiAuthError(error);
        }
    }

    return {
        id: me?.user_id ?? identity.id ?? '',
        name: me?.full_name ?? identity.name ?? '',
        email: me?.email ?? identity.email ?? '',
        phone: me?.phone ?? null,

        sub_tier: me?.sub_tier ? subTierCodeOf(me.sub_tier) : (identity.sub_tier ?? 'VISITOR'),
        state: me?.state ?? identity.state ?? '',
        dob: me?.dob ?? null,
        joinedAt: me?.email_verified_at ?? null
    };
}
