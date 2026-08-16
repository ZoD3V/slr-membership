import { auth } from '@/auth';
import type { SubTierCode } from '@/types/member';

import 'server-only';

export type SessionIdentity = {
    id?: string;
    name?: string;
    email?: string;
    sub_tier?: SubTierCode;
    state?: string;
};

/**
 * Identity of the logged-in member from the NextAuth session. Used to fill the
 * name/email/tier/state on the (still-mock) member data getters so the UI shows
 * the actual user, not the seed data. API `sub_tier` is lowercase → uppercased
 * to the `SubTierCode` the UI expects.
 */
export async function getSessionIdentity(): Promise<SessionIdentity> {
    const session = await auth();
    const user = session?.user as
        | { id?: string; name?: string | null; email?: string | null; sub_tier?: string | null; state?: string | null }
        | undefined;

    if (!user) return {};

    return {
        id: user.id ?? undefined,
        name: user.name ?? undefined,
        email: user.email ?? undefined,
        sub_tier: user.sub_tier ? (user.sub_tier.toUpperCase() as SubTierCode) : undefined,
        state: user.state ?? undefined
    };
}
