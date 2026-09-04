export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.smartliferewards.com.au';

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
        changePassword: '/api/v1/auth/change-password',

        verifyEmail: '/api/v1/auth/verify-email',
        resendVerification: '/api/v1/auth/resend-verification'
    },
    contact: {
        submit: '/api/v1/contact'
    },
    memberships: {
        tiers: '/api/v1/memberships/tiers',
        me: '/api/v1/memberships/me',
        changeTier: '/api/v1/memberships/change-tier',
        stats: '/api/v1/memberships/stats',
        upgrade: '/api/v1/memberships/upgrade',

        checkout: '/api/v1/membership/checkout'
    },
    admin: {
        members: '/api/v1/admin/members',
        dashboard: '/api/v1/admin/dashboard',
        memberDetail: (userId: string) => `/api/v1/admin/members/${userId}`,
        deleteMember: (userId: string) => `/api/v1/admin/members/${userId}`,

        updateMemberProfile: (userId: string) => `/api/v1/admin/members/${userId}`,
        updateMemberStatus: (userId: string) => `/api/v1/admin/members/${userId}/status`,
        benyPending: '/api/v1/admin/beny/pending',
        benyActivate: (id: string) => `/api/v1/admin/beny/${id}/activate`,
        benyList: '/api/v1/admin/beny',
        consents: '/api/v1/admin/consents',
        benyDeactivate: (id: string) => `/api/v1/admin/beny/${id}/deactivate`,
        csvGenerate: '/api/v1/admin/csv/generate',
        csvHistory: '/api/v1/admin/csv/history',

        giveaways: '/api/v1/admin/giveaways',
        giveawayDetail: (id: string) => `/api/v1/admin/giveaways/${id}`,
        winners: '/api/v1/admin/winners',
        winnerDetail: (id: string) => `/api/v1/admin/winners/${id}`,
        safeHours: '/api/v1/admin/safe-hours',
        spinHistory: '/api/v1/admin/spin/history',
        spinConfig: '/api/v1/admin/spin/config',
        prizes: '/api/v1/admin/prizes',

        notificationTemplates: '/api/v1/admin/notifications/templates',
        notificationTemplateDetail: (templateId: string) => `/api/v1/admin/notifications/templates/${templateId}`,
        notificationLogs: '/api/v1/admin/notifications/logs',
        notificationsSend: '/api/v1/admin/notifications/send'
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
    announcements: {
        // Live path is /public/announcements — the integration guide's /announcements 404s.
        public: (type?: string) =>
            type ? `/api/v1/public/announcements?type=${encodeURIComponent(type)}` : '/api/v1/public/announcements',
        adminList: '/api/v1/admin/announcements',
        adminDetail: (id: string) => `/api/v1/admin/announcements/${id}`
    },
    entries: {
        history: '/api/v1/entries/'
    },
    consents: {
        me: '/api/v1/consents/me',
        update: '/api/v1/consents'
    },
    prizes: {
        member: '/api/v1/prizes/'
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
    subscriptions: { cancel: '/api/v1/subscriptions/me/cancel' },
    referral: {
        status: '/api/v1/referral/',
        validate: '/api/v1/referral/validate'
    }
} as const;
