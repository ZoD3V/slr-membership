import { authConfig } from '@/auth.config';
import { login as apiLogin, getMe } from '@/lib/api/resources/auth';
import { ApiError } from '@/lib/api/types';

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { auth, handlers, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: { email: {}, password: {} },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const email = String(credentials.email);
                const password = String(credentials.password);

                // Dev-only bypass while integrating (gated by env).
                const devLoginEnabled = process.env.NEXT_PUBLIC_ALLOW_DEV_LOGIN === 'true';
                if (devLoginEnabled && email === 'SLRadmin' && password === 'SLRadmin') {
                    return {
                        id: 'dev-admin',
                        user_id: 'dev-admin',
                        name: 'SLR Admin',
                        email: 'admin@slr.dev',
                        role: 'ROLE_ADMIN',
                        tier: 'admin',
                        sub_tier: null,
                        state: '',
                        accessToken: 'dev-token',
                        refreshToken: null
                    };
                }

                try {
                    // Login returns the token + minimal user; /auth/me fills name/email/state.
                    const session = await apiLogin(email, password);
                    const me = await getMe(session.access_token);

                    return {
                        id: me.user_id,
                        user_id: me.user_id,
                        name: me.full_name,
                        email: me.email,
                        role: session.user.role,
                        tier: session.user.tier,
                        sub_tier: session.user.sub_tier ?? null,
                        state: me.state,
                        // Signed up but never paid → the app routes them to
                        // /complete-payment instead of the member area.
                        requiresPayment: session.user.requires_payment === true,
                        accessToken: session.access_token,
                        refreshToken: session.refresh_token ?? null
                    };
                } catch (error) {
                    throw new Error(error instanceof ApiError ? error.message : 'Login failed');
                }
            }
        })
    ],
    session: { strategy: 'jwt' }
});
