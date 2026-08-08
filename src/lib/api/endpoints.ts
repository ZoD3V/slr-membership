export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.smartliferewards.com.au';

// Central endpoint map. Add a namespace per domain as modules are integrated.
export const API = {
    auth: {
        login: '/api/v1/auth/login',
        me: '/api/v1/auth/me',
        refresh: '/api/v1/auth/refresh',
        logout: '/api/v1/auth/logout',
        register: '/api/v1/auth/register',
        verifyOtp: '/api/v1/auth/verify-otp',
        resendOtp: '/api/v1/auth/resend-otp',
        forgotPassword: '/api/v1/auth/forgot-password',
        resetPassword: '/api/v1/auth/reset-password',
        changePassword: '/api/v1/auth/change-password'
    },
    memberships: {
        tiers: '/api/v1/memberships/tiers',
        me: '/api/v1/memberships/me',
        changeTier: '/api/v1/memberships/change-tier',
        stats: '/api/v1/memberships/stats',
        upgrade: '/api/v1/memberships/upgrade',
        // Sign-up + "change plan" while pending payment. NOT `upgrade` — that one
        // is for members with an active subscription.
        checkout: '/api/v1/membership/checkout'
    },
    admin: {
        members: '/api/v1/admin/members',
        dashboard: '/api/v1/admin/dashboard',
        memberDetail: (userId: string) => `/api/v1/admin/members/${userId}`,
        deleteMember: (userId: string) => `/api/v1/admin/members/${userId}`,
        updateMemberStatus: (userId: string) => `/api/v1/admin/members/${userId}/status`,
        benyPending: '/api/v1/admin/beny/pending',
        benyActivate: (id: string) => `/api/v1/admin/beny/${id}/activate`,
        benyList: '/api/v1/admin/beny',
        benyDeactivate: (id: string) => `/api/v1/admin/beny/${id}/deactivate`,
        csvGenerate: '/api/v1/admin/csv/generate',
        csvHistory: '/api/v1/admin/csv/history',
        // Verified live 2026-08-02. Update is PUT (PATCH → 404). Winners are a
        // top-level collection, NOT nested under a giveaway.
        giveaways: '/api/v1/admin/giveaways',
        giveawayDetail: (id: string) => `/api/v1/admin/giveaways/${id}`,
        winners: '/api/v1/admin/winners',
        winnerDetail: (id: string) => `/api/v1/admin/winners/${id}`,
        safeHours: '/api/v1/admin/safe-hours'
    },
    discounts: {
        list: '/api/v1/discounts/',
        public: '/api/v1/public/discounts/',
        create: '/api/v1/discounts/',
        detail: (id: string) => `/api/v1/discounts/${id}`,
        update: (id: string) => `/api/v1/discounts/${id}`,
        remove: (id: string) => `/api/v1/discounts/${id}`,
        presignedUrl: '/api/v1/discounts/presigned-url'
    },
    beny: {
        status: '/api/v1/beny/status',
        subscribe: '/api/v1/beny/subscribe'
    },
    ebooks: {
        list: '/api/v1/ebooks/',
        detail: (id: string) => `/api/v1/ebooks/${id}`,
        create: '/api/v1/ebooks/',
        update: (id: string) => `/api/v1/ebooks/${id}`,
        remove: (id: string) => `/api/v1/ebooks/${id}`,
        presignedUrl: '/api/v1/ebooks/presigned-url',
        createChapter: (id: string) => `/api/v1/ebooks/${id}/chapters`,
        updateChapter: (id: string, chapterId: string) => `/api/v1/ebooks/${id}/chapters/${chapterId}`,
        deleteChapter: (id: string, chapterId: string) => `/api/v1/ebooks/${id}/chapters/${chapterId}`
    },
    giveaways: {
        list: '/api/v1/giveaways/',
        detail: (id: string) => `/api/v1/giveaways/${id}`,
        winners: '/api/v1/giveaways/winners'
    },
    entries: {
        history: '/api/v1/entries/'
    },
    notifications: {
        list: '/api/v1/notifications/',
        read: (id: string) => `/api/v1/notifications/${id}/read`
    },
    // Proposed 2026-08-08 — both routes return 404 today (verified live).
    // See docs/superpowers/specs/2026-08-08-admin-prizes-cms-design.md §4.
    prizes: {
        public: '/api/v1/public/prizes',
        update: '/api/v1/admin/prizes'
    },
    users: {
        me: '/api/v1/users/me',
        update: (id: string) => `/api/v1/users/${id}`
    },
    billing: {
        status: '/api/v1/billing/status',
        invoices: '/api/v1/billing/invoices',
        payManual: '/api/v1/billing/pay-manual'
    },
    stripe: {
        checkout: '/api/v1/stripe/checkout',
        portal: '/api/v1/stripe/portal'
    },
    spin: {
        status: '/api/v1/spin/status',
        execute: '/api/v1/spin/execute'
    },
    subscriptions: { cancel: '/api/v1/subscriptions/me/cancel' }
} as const;
