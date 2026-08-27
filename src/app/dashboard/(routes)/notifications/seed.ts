import type { NotificationLogMeta, NotificationTemplate } from '@/types/member';

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
    per_page: 10,
    total: 0,
    total_pages: 0
};

export const NOTIFICATION_LOGS_PER_PAGE = 10;

export const MAX_SEND_RECIPIENTS = 100;

export const RECIPIENT_PAGE_SIZE = 10;
