import { handleApiAuthError } from '@/lib/api/guard';
import { type MeResult, getMe } from '@/lib/api/resources/auth';
import { getAccessToken } from '@/lib/api/server';
import { subTierCodeOf } from '@/lib/member';
import { getSessionIdentity } from '@/lib/session-member';
import type { MemberProfile } from '@/types/member';

/**
 * Member profile for /member/profile (PRD §4.7), sourced from `GET /auth/me`.
 * The NextAuth session is the fallback for the fields it carries — it is written
 * at login, so it survives a failed read but can be stale.
 */
export async function getMemberProfile(): Promise<MemberProfile> {
    const identity = await getSessionIdentity();
    const token = await getAccessToken();

    let me: MeResult | null = null;
    if (token) {
        try {
            me = await getMe(token);
        } catch (error) {
            handleApiAuthError(error); // expired session → force logout; otherwise fall back to the session
        }
    }

    return {
        name: me?.full_name ?? identity.name ?? '',
        email: me?.email ?? identity.email ?? '',
        phone: me?.phone ?? null,
        // /auth/me carries the live sub-tier; the session copy is the
        // registration-time value and goes stale after a plan change.
        sub_tier: me?.sub_tier ? subTierCodeOf(me.sub_tier) : (identity.sub_tier ?? 'VISITOR'),
        state: me?.state ?? identity.state ?? '',
        dob: me?.dob ?? null
    };
}
