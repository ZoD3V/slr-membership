import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    trustHost: true,
    pages: {
        signIn: '/sign-in'
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const { pathname } = nextUrl;

            const role = ((auth?.user as { role?: string })?.role ?? '').toLowerCase();
            // admin + super_admin are staff → dashboard only. Everyone else (member:
            // visitor/red/blue) → member area only.
            const isAdmin = role.includes('admin');
            // Signed up on a paid tier but never paid. They must be able to log in
            // and finish, so this gates *where* they land — never *whether* they can.
            const requiresPayment = (auth?.user as { requiresPayment?: boolean })?.requiresPayment === true;
            const home = isAdmin ? '/dashboard' : requiresPayment ? '/complete-payment' : '/member';

            const isDashboard = pathname.startsWith('/dashboard');
            const isMemberArea =
                pathname.startsWith('/member') || pathname.startsWith('/ebooks') || pathname.startsWith('/account');
            const isAuthPage = pathname.startsWith('/sign-in');
            const isCompletePayment = pathname.startsWith('/complete-payment');

            // Not logged in → any protected route → sign-in.
            if (!isLoggedIn && (isDashboard || isMemberArea || isCompletePayment)) {
                return Response.redirect(new URL('/sign-in', nextUrl));
            }

            if (isLoggedIn) {
                // Unpaid members have nothing to see in the member area yet — no
                // cycle, no entries — so send them to finish paying instead.
                if (requiresPayment && (isMemberArea || isDashboard)) {
                    return Response.redirect(new URL('/complete-payment', nextUrl));
                }
                // Everyone else has already paid, so the page would be a dead end.
                if (isCompletePayment && !requiresPayment) {
                    return Response.redirect(new URL(home, nextUrl));
                }
                // Role-based separation: admins can't enter the member area,
                // members can't enter the dashboard.
                if (isDashboard && !isAdmin) {
                    return Response.redirect(new URL('/member', nextUrl));
                }
                if (isMemberArea && isAdmin) {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
                // Already authed on the sign-in page → send to their home.
                if (isAuthPage) {
                    return Response.redirect(new URL(home, nextUrl));
                }
            }

            return true;
        },
        async jwt({ token, user }) {
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
