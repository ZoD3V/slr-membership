import type { NotificationLogMeta, NotificationTemplate } from '@/types/member';

/**
 * Defensive fallback the panel renders against when
 * `GET /api/v1/admin/notifications/templates` cannot be read.
 *
 * The route exists — it answers 500 INTERNAL_ERROR, verified 2026-08-11, and
 * a deliberately fake path answers 404 NOT_FOUND in the same run — so reaching
 * this seed means the handler is broken, not that the backend is missing.
 *
 * The three types are the ones production has actually emitted across 44 log
 * rows: welcome, otp, password_reset. Copy is placeholder.
 */
export const NOTIFICATION_TEMPLATES_SEED: NotificationTemplate[] = [
    {
        id: 'seed-welcome',
        type: 'welcome',
        channel: 'email',
        subject: 'Welcome to Smart Life Rewards',
        body: 'Hi {{full_name}},\n\nYour Smart Life Rewards account is ready.\n\nThe SLR Team',
        is_active: true,
        updated_at: ''
    },
    {
        id: 'seed-otp',
        type: 'otp',
        channel: 'email',
        subject: 'Your Smart Life Rewards verification code',
        body: 'Hi {{full_name}},\n\nYour verification code is {{otp_code}}. It expires in 10 minutes.\n\nThe SLR Team',
        is_active: true,
        updated_at: ''
    },
    {
        id: 'seed-password-reset',
        type: 'password_reset',
        channel: 'email',
        subject: 'Reset your Smart Life Rewards password',
        body: 'Hi {{full_name}},\n\nUse the link below to reset your password.\n\n{{reset_url}}\n\nThe SLR Team',
        is_active: true,
        updated_at: ''
    }
];

export const NOTIFICATION_LOG_META_SEED: NotificationLogMeta = {
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0
};

export const NOTIFICATION_LOGS_PER_PAGE = 20;

/**
 * The API caps a manual send at 100 recipients per request.
 * Lives here rather than in actions.ts: a `'use server'` module may only
 * export async functions, so a plain const there is a build error.
 */
export const MAX_SEND_RECIPIENTS = 100;

/** Page size for the recipient picker. Kept well under MAX_SEND_RECIPIENTS so
 *  a single page can never look like "everyone you may select". */
export const RECIPIENT_PAGE_SIZE = 10;
