import type { NextAuthConfig } from 'next-auth';

function isAccessTokenExpired(token: string | undefined): boolean {
    if (!token) return true;

    const payload = token.split('.')[1];
    if (!payload) return true;

    try {
        const base64 = payload
            .replace(/-/g, '+')
            .replace(/_/g, '/')
            .padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
        const { exp } = JSON.parse(atob(base64)) as { exp?: number };

        return typeof exp !== 'number' || exp * 1000 <= Date.now();
    } catch {
        return true;
    }
}

export const authConfig = {
    trustHost: true,
    pages: {
        signIn: '/sign-in'
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const accessToken = (auth?.user as { accessToken?: string } | undefined)?.accessToken;
            const isLoggedIn = !!auth?.user && !isAccessTokenExpired(accessToken);
            const { pathname } = nextUrl;

            const role = ((auth?.user as { role?: string })?.role ?? '').toLowerCase();

            const isAdmin = role.includes('admin');

            const requiresPayment = (auth?.user as { requiresPayment?: boolean })?.requiresPayment === true;
            const home = isAdmin ? '/dashboard' : requiresPayment ? '/complete-payment' : '/member';

            const isDashboard = pathname.startsWith('/dashboard');
            const isMemberArea =
                pathname.startsWith('/member') || pathname.startsWith('/ebooks') || pathname.startsWith('/account');
            const isAuthPage = pathname.startsWith('/sign-in');
            const isCompletePayment = pathname.startsWith('/complete-payment');

            if (!isLoggedIn && (isDashboard || isMemberArea || isCompletePayment)) {
                return Response.redirect(new URL('/sign-in', nextUrl));
            }

            if (isLoggedIn) {
                if (requiresPayment && (isMemberArea || isDashboard)) {
                    return Response.redirect(new URL('/complete-payment', nextUrl));
                }

                if (isCompletePayment && !requiresPayment) {
                    return Response.redirect(new URL(home, nextUrl));
                }

                if (isDashboard && !isAdmin) {
                    return Response.redirect(new URL('/member', nextUrl));
                }
                if (isMemberArea && isAdmin) {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }

                if (isAuthPage) {
                    return Response.redirect(new URL(home, nextUrl));
                }
            }

            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.accessToken = (user as any).accessToken;
                token.refreshToken = (user as any).refreshToken;
                token.role = (user as any).role;
                token.user_id = (user as any).user_id;
                token.tier = (user as any).tier;
                token.sub_tier = (user as any).sub_tier;
                token.state = (user as any).state;
                token.requiresPayment = (user as any).requiresPayment;
            }
            if (trigger === 'update' && session) {
                if (session.requiresPayment !== undefined) {
                    token.requiresPayment = session.requiresPayment;
                }
                if (session.tier !== undefined) {
                    token.tier = session.tier;
                }
                if (session.sub_tier !== undefined) {
                    token.sub_tier = session.sub_tier;
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as any).accessToken = token.accessToken;
                (session.user as any).refreshToken = token.refreshToken;
                (session.user as any).role = token.role;
                (session.user as any).user_id = token.user_id;
                (session.user as any).tier = token.tier;
                (session.user as any).sub_tier = token.sub_tier;
                (session.user as any).state = token.state;
                (session.user as any).requiresPayment = token.requiresPayment;
            }

            return session;
        }
    },
    providers: []
} satisfies NextAuthConfig;
