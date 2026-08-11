import Link from 'next/link';

import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import Heading from '@/components/ui/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { handleApiAuthError } from '@/lib/api/guard';
import { getNotificationLogs, getNotificationTemplates } from '@/lib/api/resources/notifications-admin';
import { getAccessToken } from '@/lib/api/server';
import type { NotificationLogMeta, NotificationLogRow, NotificationTemplate } from '@/types/member';
import { KNOWN_NOTIFICATION_TYPES } from '@/types/member';

import { LogsClient } from './logs-client';
import { NOTIFICATION_LOGS_PER_PAGE, NOTIFICATION_LOG_META_SEED, NOTIFICATION_TEMPLATES_SEED } from './seed';
import { SendClient } from './send-client';
import { TemplatesClient } from './templates-client';

const TABS = ['templates', 'logs', 'send'] as const;
type TabValue = (typeof TABS)[number];

const LOG_STATUSES = ['sent', 'failed', 'pending'];

function isTab(value: string): value is TabValue {
    return (TABS as readonly string[]).includes(value);
}

export default async function NotificationsPage({
    searchParams
}: {
    searchParams: Promise<{
        tab?: string;
        type?: string;
        status?: string;
        page?: string;
        user_id?: string;
        email?: string;
        template_id?: string;
    }>;
}) {
    const params = await searchParams;

    const tab: TabValue = params.tab && isTab(params.tab) ? params.tab : 'templates';
    // Only forward filter values the API documents. An unrecognised value is
    // dropped rather than sent: the logs endpoint ignores unknown query
    // parameters silently, which would render as an active filter over
    // unfiltered data.
    const type = params.type && KNOWN_NOTIFICATION_TYPES.includes(params.type as never) ? params.type : 'all';
    const status = params.status && LOG_STATUSES.includes(params.status) ? params.status : 'all';
    const parsedPage = Number(params.page);
    const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    const token = await getAccessToken();

    let templates: NotificationTemplate[] = NOTIFICATION_TEMPLATES_SEED;
    let isTemplatesPlaceholder = true;
    let logs: NotificationLogRow[] = [];
    let logsMeta: NotificationLogMeta = NOTIFICATION_LOG_META_SEED;
    let logsFailed = true;

    if (token) {
        const [templatesResult, logsResult] = await Promise.allSettled([
            getNotificationTemplates(token),
            getNotificationLogs(token, {
                type: type === 'all' ? undefined : type,
                status: status === 'all' ? undefined : status,
                page,
                perPage: NOTIFICATION_LOGS_PER_PAGE
            })
        ]);

        // Inspect rejections before any fallback runs: a 401 (expired admin
        // session) must force a logout, not be swallowed and silently
        // rendered as seed data.
        if (templatesResult.status === 'rejected') handleApiAuthError(templatesResult.reason);
        if (logsResult.status === 'rejected') handleApiAuthError(logsResult.reason);

        if (templatesResult.status === 'fulfilled') {
            templates = templatesResult.value;
            isTemplatesPlaceholder = false;
        }

        if (logsResult.status === 'fulfilled') {
            logs = logsResult.value.data;
            logsMeta = logsResult.value.meta;
            logsFailed = false;
        }
    }

    return (
        <DashboardPageShell>
            <div className='mx-auto w-full'>
                <Heading
                    title='Notifications'
                    description='Email and SMS templates, delivery history, and manual sends.'
                />
            </div>

            <Tabs value={tab} className='space-y-6'>
                <TabsList>
                    <TabsTrigger value='templates' asChild>
                        <Link href='/dashboard/notifications?tab=templates'>Templates</Link>
                    </TabsTrigger>
                    <TabsTrigger value='logs' asChild>
                        <Link href='/dashboard/notifications?tab=logs'>Delivery logs</Link>
                    </TabsTrigger>
                    <TabsTrigger value='send' asChild>
                        <Link href='/dashboard/notifications?tab=send'>Send</Link>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='templates'>
                    <TemplatesClient templates={templates} isPlaceholder={isTemplatesPlaceholder} />
                </TabsContent>
                <TabsContent value='logs'>
                    <LogsClient rows={logs} meta={logsMeta} type={type} status={status} logsFailed={logsFailed} />
                </TabsContent>
                <TabsContent value='send'>
                    <SendClient
                        templates={templates}
                        templatesArePlaceholders={isTemplatesPlaceholder}
                        prefillUserId={params.user_id}
                        prefillEmail={params.email}
                        prefillTemplateId={params.template_id}
                    />
                </TabsContent>
            </Tabs>
        </DashboardPageShell>
    );
}
