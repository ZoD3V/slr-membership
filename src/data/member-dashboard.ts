import { handleApiAuthError } from '@/lib/api/guard';
import { getMe } from '@/lib/api/resources/auth';
import { getAccessToken } from '@/lib/api/server';
import { subTierCodeOf } from '@/lib/member';
import { getSessionIdentity } from '@/lib/session-member';
import type { CurrentMember } from '@/types/member';

/**
 * The logged-in member's identity (name / sub-tier / state), read live from
 * `GET /auth/me` so tier gates react to a plan change immediately. The session is
 * only a fallback: its `sub_tier` is written at login, so a member who upgrades
 * mid-session would keep hitting Visitor gates until signing in again.
 *
 * Consumed by the member header/sidebar and every page that gates on tier + state
 * (dashboard, giveaways, discounts, prizes). `getMe` is request-cached, so the
 * repeated calls collapse into one.
 */
export async function getCurrentMember(): Promise<CurrentMember> {
    const identity = await getSessionIdentity();
    const token = await getAccessToken();

    if (token) {
        try {
            const me = await getMe(token);

            return {
                name: me.full_name || identity.name || 'Member',
                sub_tier: subTierCodeOf(me.sub_tier ?? undefined),
                state: me.state || identity.state || '-'
            };
        } catch (error) {
            handleApiAuthError(error); // expired session → force logout; otherwise fall through
        }
    }

    return {
        name: identity.name ?? 'Member',
        sub_tier: identity.sub_tier ?? 'VISITOR',
        state: identity.state ?? '-'
    };
}
