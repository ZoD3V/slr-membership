# Admin Notifications Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/dashboard/notifications` — templates, delivery logs, and manual send — plus re-enable the Spin tier filter that no longer needs to be disabled.

**Architecture:** Next.js 16 App Router. Server Component `page.tsx` reads the token, fetches concurrently with `Promise.allSettled`, calls `handleApiAuthError` on rejections *before* any fallback, then hands seeded or live data to three `'use client'` tab components. Mutations go through `'use server'` actions returning `ActionResult<T>`. Exactly the shape used by Prizes, Safe Hours and Spin.

**Tech Stack:** Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn/ui (`tabs`, `textarea`, `switch`, `checkbox`, `dialog`, `select`, `tooltip`, `badge` — all already installed) · React Hook Form + Zod 4 · Sonner · existing `DataTable`.

**Spec:** `docs/superpowers/specs/2026-08-11-admin-notifications-panel-design.md`

## Global Constraints

- **All four notification endpoints are unreachable today.** `GET /admin/notifications/templates` and `GET /admin/notifications/logs` both answer `500 INTERNAL_ERROR` (verified 2026-08-11 01:02 UTC). Build against the OpenAPI contract, seed the reads, and never write UI copy claiming an endpoint "is not live yet" or "does not exist" — that claim was wrong once already and shipped to three panels.
- **Never issue a write against production while verifying.** The API holds real member records and live email addresses. `POST /admin/notifications/send` emails real people.
- **`handleApiAuthError` must run on every rejection before any seed fallback**, and outside the `Promise.allSettled` promises. It calls `redirect()` on 401, which throws `NEXT_REDIRECT`; swallowing it renders an expired session as placeholder data.
- **Template identity is `id`, not `template_id`.** The list/update response uses `id`; only the URL path parameter is called `template_id`.
- **A failed fetch must never render as an empty state.** "No notifications sent yet" is a factual claim; a rejected request has not established it.
- **Never render the `draw_pass` number in any UI** — API exposes `entry_status`. `AdminMemberListItem` carries `draw_pass`; do not surface it in the recipient picker.
- **Prettier:** 4-space indent, single quotes, JSX single quotes, semicolons, width 120, no trailing comma. Imports sorted by `@trivago/prettier-plugin-sort-imports`; Tailwind classes by `prettier-plugin-tailwindcss`.
- **Tooling:** `npm run lint` is broken in this repo — use `npx eslint <paths>`. `npm run format` reformats the whole repo — use `npx prettier --write <own files>`. `tests/sprint1/helpers.ts` has 3 pre-existing `newline-before-return` errors; exclude them from any "clean" claim.
- **Dark surfaces:** dialog and select content need `className='dashboard-theme dark'`, matching every existing dashboard dialog.

---

### Task 1: Types, endpoints, and the admin resource module

**Files:**
- Modify: `src/types/member.ts` (append a new section)
- Modify: `src/lib/api/endpoints.ts:48` (inside `admin`)
- Create: `src/lib/api/resources/notifications-admin.ts`

**Interfaces:**
- Consumes: `apiFetch`, `apiFetchPaginated` from `../http`; `API` from `../endpoints`
- Produces: the types listed below; `getNotificationTemplates(token)`, `updateNotificationTemplate(token, templateId, payload)`, `getNotificationLogs(token, filters)`, `sendNotifications(token, payload)`

- [ ] **Step 1: Append the types to `src/types/member.ts`**

Append at the end of the file. Do not modify or remove any existing export.

```ts
/* --- Admin notifications (real contract, OpenAPI 2026-08-11) --- */

export type NotificationChannel = 'email' | 'sms';
export type NotificationLogStatus = 'sent' | 'failed' | 'pending';

// The API types `type` as a bare string with no enum. These are the three
// values production has actually emitted across 44 log rows; unknown values
// must still render rather than being dropped.
export const KNOWN_NOTIFICATION_TYPES = ['welcome', 'otp', 'password_reset'] as const;
export type KnownNotificationType = (typeof KNOWN_NOTIFICATION_TYPES)[number];

export interface NotificationTemplate {
    // `id`, not `template_id` — only the PUT path parameter uses that name.
    id: string;
    type: string;
    channel: string;
    subject: string;
    body: string;
    is_active: boolean;
    updated_at: string;
}

export interface NotificationTemplateUpdatePayload {
    subject: string;
    body: string;
    is_active: boolean;
}

export interface NotificationLogRow {
    id: string;
    user_id: string;
    email: string;
    channel: string;
    type: string;
    template_id: string | null;
    status: string;
    provider: string;
    error: string | null;
    sent_at: string;
}

export interface NotificationLogMeta {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
}

export interface NotificationSendPayload {
    user_ids: string[];
    template_id: string;
    channel: NotificationChannel;
}

export interface NotificationSendResult {
    queued: number;
    skipped: number;
}
```

- [ ] **Step 2: Add the four paths to `src/lib/api/endpoints.ts`**

Inside the `admin` object, immediately after `prizes: '/api/v1/admin/prizes'`, add a comma and:

```ts
        // Renamed by the backend between 2026-08-10 and 2026-08-11 (was
        // /admin/notification-templates and /admin/notification-logs). Both
        // GETs answer 500 as of 2026-08-11 — see docs/BACKEND-ISSUES.md.
        notificationTemplates: '/api/v1/admin/notifications/templates',
        notificationTemplateDetail: (templateId: string) =>
            `/api/v1/admin/notifications/templates/${templateId}`,
        notificationLogs: '/api/v1/admin/notifications/logs',
        notificationsSend: '/api/v1/admin/notifications/send'
```

- [ ] **Step 3: Create `src/lib/api/resources/notifications-admin.ts`**

```ts
import type {
    NotificationLogMeta,
    NotificationLogRow,
    NotificationSendPayload,
    NotificationSendResult,
    NotificationTemplate,
    NotificationTemplateUpdatePayload
} from '@/types/member';

import { API } from '../endpoints';
import { apiFetch, apiFetchPaginated } from '../http';

/**
 * Admin-only notification functions (OpenAPI 2026-08-11). Kept separate from
 * notifications.ts, which is the member-facing bell panel — different
 * audience, different auth, no shared code. Mirrors spin-admin.ts / spin.ts.
 */

export interface NotificationLogFilters {
    userId?: string;
    type?: string;
    status?: string;
    page?: number;
    perPage?: number;
}

function logsQuery(filters?: NotificationLogFilters): string {
    const params = new URLSearchParams();
    if (filters?.userId) params.set('user_id', filters.userId);
    if (filters?.type) params.set('type', filters.type);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.perPage) params.set('per_page', String(filters.perPage));

    const query = params.toString();

    return query ? `?${query}` : '';
}

export function getNotificationTemplates(token: string) {
    return apiFetch<NotificationTemplate[]>(API.admin.notificationTemplates, { token, cache: 'no-store' });
}

export function updateNotificationTemplate(
    token: string,
    templateId: string,
    payload: NotificationTemplateUpdatePayload
) {
    return apiFetch<NotificationTemplate>(API.admin.notificationTemplateDetail(templateId), {
        method: 'PUT',
        token,
        body: payload
    });
}

/** Server-paginated — the API returns `meta.total_pages`, not the full set. */
export function getNotificationLogs(token: string, filters?: NotificationLogFilters) {
    return apiFetchPaginated<NotificationLogRow[], NotificationLogMeta>(
        `${API.admin.notificationLogs}${logsQuery(filters)}`,
        { token, cache: 'no-store' }
    );
}

export function sendNotifications(token: string, payload: NotificationSendPayload) {
    return apiFetch<NotificationSendResult>(API.admin.notificationsSend, {
        method: 'POST',
        token,
        body: payload
    });
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS with no new errors.

- [ ] **Step 5: Lint and format the changed files**

Run: `npx prettier --write src/types/member.ts src/lib/api/endpoints.ts src/lib/api/resources/notifications-admin.ts && npx eslint src/types/member.ts src/lib/api/endpoints.ts src/lib/api/resources/notifications-admin.ts`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/types/member.ts src/lib/api/endpoints.ts src/lib/api/resources/notifications-admin.ts
git commit -m "feat(api): add the admin notifications contract — templates, logs, send"
```

---

### Task 2: Page shell, seed, tab routing, sidebar entry

**Files:**
- Create: `src/app/dashboard/(routes)/notifications/seed.ts`
- Create: `src/app/dashboard/(routes)/notifications/loading.tsx`
- Create: `src/app/dashboard/(routes)/notifications/page.tsx`
- Modify: `src/components/ui/nav-main.tsx:38-50`

**Interfaces:**
- Consumes: Task 1's types and resource functions
- Produces: `NOTIFICATION_TEMPLATES_SEED`, `NOTIFICATION_LOG_META_SEED`; the page passes `templates`, `isTemplatesPlaceholder`, `logs`, `logsMeta`, `logsFailed`, and the parsed filters into the three tab clients created in Tasks 3–5. Until those exist, render placeholder `<div>`s so the page compiles at the end of this task.

- [ ] **Step 1: Create `seed.ts`**

```ts
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
```

- [ ] **Step 2: Create `loading.tsx`**

```tsx
import { DetailSkeleton } from '@/components/common/skeletons';

export default function Loading() {
    return <DetailSkeleton />;
}
```

- [ ] **Step 3: Create `page.tsx`**

```tsx
import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import Heading from '@/components/ui/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { handleApiAuthError } from '@/lib/api/guard';
import { getNotificationLogs, getNotificationTemplates } from '@/lib/api/resources/notifications-admin';
import { getAccessToken } from '@/lib/api/server';
import type { NotificationLogMeta, NotificationLogRow, NotificationTemplate } from '@/types/member';
import { KNOWN_NOTIFICATION_TYPES } from '@/types/member';

import { NOTIFICATION_LOGS_PER_PAGE, NOTIFICATION_LOG_META_SEED, NOTIFICATION_TEMPLATES_SEED } from './seed';

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
            <Heading
                title='Notifications'
                description='Email and SMS templates, delivery history, and manual sends.'
            />

            <Tabs value={tab} className='space-y-6'>
                <TabsList>
                    <TabsTrigger value='templates' asChild>
                        <a href='/dashboard/notifications?tab=templates'>Templates</a>
                    </TabsTrigger>
                    <TabsTrigger value='logs' asChild>
                        <a href='/dashboard/notifications?tab=logs'>Delivery logs</a>
                    </TabsTrigger>
                    <TabsTrigger value='send' asChild>
                        <a href='/dashboard/notifications?tab=send'>Send</a>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='templates'>
                    <div>Templates tab — implemented in Task 3.</div>
                </TabsContent>
                <TabsContent value='logs'>
                    <div>Logs tab — implemented in Task 4.</div>
                </TabsContent>
                <TabsContent value='send'>
                    <div>Send tab — implemented in Task 5.</div>
                </TabsContent>
            </Tabs>
        </DashboardPageShell>
    );
}
```

- [ ] **Step 4: Add the sidebar entry**

In `src/components/ui/nav-main.tsx`, add `Bell` to the existing `lucide-react` import (keep the list alphabetical — it goes before `BookOpen`), then insert this line into `ITEMS` immediately after the `Safe Hours` entry:

```ts
    { title: 'Notifications', href: '/dashboard/notifications', icon: Bell },
```

- [ ] **Step 5: Verify the page renders**

Run: `npm run dev`, open `http://localhost:3000/dashboard/notifications` signed in as an admin.
Expected: the page renders, the sidebar shows **Notifications** highlighted, all three tabs are clickable and change `?tab=`, and no console error appears. Stop the dev server afterwards.

- [ ] **Step 6: Type-check, lint, format**

Run: `npx tsc --noEmit && npx prettier --write "src/app/dashboard/(routes)/notifications/**" src/components/ui/nav-main.tsx && npx eslint "src/app/dashboard/(routes)/notifications" src/components/ui/nav-main.tsx`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add "src/app/dashboard/(routes)/notifications" src/components/ui/nav-main.tsx
git commit -m "feat(admin): scaffold the Notifications page shell, seed and tab routing"
```

---

### Task 3: Templates tab

**Files:**
- Create: `src/app/dashboard/(routes)/notifications/actions.ts`
- Create: `src/app/dashboard/(routes)/notifications/_components/template-edit-dialog.tsx`
- Create: `src/app/dashboard/(routes)/notifications/templates-client.tsx`
- Modify: `src/app/dashboard/(routes)/notifications/page.tsx` (replace the Task 2 placeholder)

**Interfaces:**
- Consumes: `NotificationTemplate`, `NotificationTemplateUpdatePayload`, `updateNotificationTemplate`
- Produces: `ActionError`, `ActionResult<T>`, `toActionError` (Tasks 4–5 import these from the same `actions.ts`); `saveNotificationTemplateAction(templateId, payload)`; `<TemplatesClient templates isPlaceholder />`

- [ ] **Step 1: Create `actions.ts`**

This file is copied structurally from `(routes)/prizes/actions.ts`. Tasks 4 and 5 append to it — do not create a second actions file.

```ts
'use server';

import { revalidatePath } from 'next/cache';

import { handleApiAuthError } from '@/lib/api/guard';
import { updateNotificationTemplate } from '@/lib/api/resources/notifications-admin';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';
import type { NotificationTemplate, NotificationTemplateUpdatePayload } from '@/types/member';

export type ActionError = {
    ok: false;
    message: string;
    status?: number;
    code?: string | null;
    requestId?: string | null;
};

export type ActionResult<T> = { ok: true; data: T; message: string } | ActionError;

function toActionError(error: unknown): ActionError {
    // 401 (expired/invalid session) → redirect('/api/auth/logout'), never returns.
    handleApiAuthError(error);

    if (error instanceof ApiError) {
        const payload = error.payload as { code?: string; requestId?: string } | undefined;

        return {
            ok: false,
            message: error.message,
            status: error.status,
            code: payload?.code ?? null,
            requestId: payload?.requestId ?? null
        };
    }

    return { ok: false, message: 'Something went wrong. Please try again.' };
}

export async function saveNotificationTemplateAction(
    templateId: string,
    payload: NotificationTemplateUpdatePayload
): Promise<ActionResult<NotificationTemplate>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await updateNotificationTemplate(token, templateId, payload);
        revalidatePath('/dashboard/notifications');

        return { ok: true, data, message: 'Template saved.' };
    } catch (error) {
        return toActionError(error);
    }
}
```

- [ ] **Step 2: Create `_components/template-edit-dialog.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { NotificationTemplate } from '@/types/member';

import { saveNotificationTemplateAction } from '../actions';

const schema = z.object({
    subject: z.string().trim().min(1, 'Subject is required.').max(255, 'Subject must be 255 characters or fewer.'),
    body: z.string().trim().min(1, 'Body is required.'),
    is_active: z.boolean()
});

type FormValues = z.infer<typeof schema>;

function toFormValues(template: NotificationTemplate): FormValues {
    return { subject: template.subject, body: template.body, is_active: template.is_active };
}

export function TemplateEditDialog({
    template,
    open,
    onOpenChange
}: {
    template: NotificationTemplate | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [isSaving, setIsSaving] = useState(false);
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        values: template ? toFormValues(template) : { subject: '', body: '', is_active: true }
    });

    useEffect(() => {
        if (template) form.reset(toFormValues(template));
    }, [template, form]);

    const onSubmit = async (values: FormValues) => {
        if (!template) return;

        setIsSaving(true);
        const result = await saveNotificationTemplateAction(template.id, values);
        setIsSaving(false);

        if (result.ok) {
            // Re-seed from the server's own copy so a clamped or normalised
            // value can't leave the form permanently dirty.
            form.reset(toFormValues(result.data));
            toast.success(result.message);
            onOpenChange(false);

            return;
        }

        toast.error(result.message);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='dashboard-theme dark sm:max-w-2xl'>
                <DialogHeader>
                    <DialogTitle className='text-white'>Edit template</DialogTitle>
                    <DialogDescription>
                        {template ? `${template.type} · ${template.channel}` : ''}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='subject'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input {...field} maxLength={255} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='body'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Body</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} rows={12} className='font-mono text-xs' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='is_active'
                            render={({ field }) => (
                                <FormItem className='border-slr-navy-border flex items-center justify-between rounded-lg border p-3'>
                                    <div className='space-y-0.5'>
                                        <FormLabel>Active</FormLabel>
                                        <p className='text-muted-foreground text-xs'>
                                            Turning this off stops this notification from being sent at all.
                                        </p>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type='submit' disabled={isSaving || !form.formState.isDirty}>
                                {isSaving ? 'Saving…' : 'Save template'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
```

- [ ] **Step 3: Create `templates-client.tsx`**

```tsx
'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NotificationTemplate } from '@/types/member';

import { TemplateEditDialog } from './_components/template-edit-dialog';
import { Pencil, TriangleAlert } from 'lucide-react';

export function TemplatesClient({
    templates,
    isPlaceholder
}: {
    templates: NotificationTemplate[];
    isPlaceholder: boolean;
}) {
    const [editing, setEditing] = useState<NotificationTemplate | null>(null);

    return (
        <div className='space-y-4'>
            {isPlaceholder ? (
                <p className='text-muted-foreground flex items-start gap-2 text-sm'>
                    <TriangleAlert className='mt-0.5 size-4 shrink-0 text-amber-400/70' />
                    <span>
                        Couldn&apos;t load the notification templates — showing placeholders. Saving will fail until
                        the endpoint recovers.
                    </span>
                </p>
            ) : null}

            <div className='grid gap-4 lg:grid-cols-2'>
                {templates.map((template) => (
                    <Card key={template.id}>
                        <CardHeader className='flex flex-row items-start justify-between gap-3 space-y-0'>
                            <div className='space-y-1'>
                                <CardTitle className='text-base'>{template.subject || '—'}</CardTitle>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <Badge variant='outline'>{template.type}</Badge>
                                    <Badge variant='outline'>{template.channel}</Badge>
                                    <Badge
                                        className={
                                            template.is_active
                                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                                                : 'border-slate-500/40 bg-slate-500/10 text-slate-300'
                                        }>
                                        {template.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                            <Button
                                type='button'
                                size='sm'
                                variant='outline'
                                onClick={() => setEditing(template)}
                                disabled={isPlaceholder}
                                title={
                                    isPlaceholder
                                        ? 'Editing is unavailable while the templates endpoint is failing.'
                                        : undefined
                                }>
                                <Pencil className='size-3.5' />
                                Edit
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <pre className='text-muted-foreground max-h-32 overflow-hidden text-xs whitespace-pre-wrap'>
                                {template.body}
                            </pre>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <TemplateEditDialog
                template={editing}
                open={editing !== null}
                onOpenChange={(open) => {
                    if (!open) setEditing(null);
                }}
            />
        </div>
    );
}
```

- [ ] **Step 4: Wire it into `page.tsx`**

Add `import { TemplatesClient } from './templates-client';` and replace the templates `TabsContent` body with:

```tsx
                <TabsContent value='templates'>
                    <TemplatesClient templates={templates} isPlaceholder={isTemplatesPlaceholder} />
                </TabsContent>
```

- [ ] **Step 5: Verify in the browser**

Run `npm run dev` and open `/dashboard/notifications?tab=templates`.
Expected: the amber "Couldn't load … showing placeholders" line appears (the endpoint 500s), three cards render for `welcome` / `otp` / `password_reset`, and every **Edit** button is disabled with the explanatory tooltip. Stop the dev server.

- [ ] **Step 6: Type-check, lint, format**

Run: `npx tsc --noEmit && npx prettier --write "src/app/dashboard/(routes)/notifications/**" && npx eslint "src/app/dashboard/(routes)/notifications"`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add "src/app/dashboard/(routes)/notifications"
git commit -m "feat(admin): add the Notifications templates tab with an edit dialog"
```

---

### Task 4: Delivery logs tab

**Files:**
- Create: `src/app/dashboard/(routes)/notifications/_components/log-columns.tsx`
- Create: `src/app/dashboard/(routes)/notifications/logs-client.tsx`
- Modify: `src/app/dashboard/(routes)/notifications/page.tsx` (replace the Task 2 placeholder)

**Interfaces:**
- Consumes: `NotificationLogRow`, `NotificationLogMeta`, `KNOWN_NOTIFICATION_TYPES`; `Column` and `DataTable` from `@/components/data-table`
- Produces: `buildLogColumns(onResend)`; `<LogsClient rows meta type status logsFailed />`

- [ ] **Step 1: Create `_components/log-columns.tsx`**

```tsx
'use client';

import type { Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { NotificationLogRow } from '@/types/member';

import { Send } from 'lucide-react';

const STATUS_STYLE: Record<string, string> = {
    sent: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    failed: 'border-red-500/40 bg-red-500/10 text-red-400',
    pending: 'border-amber-500/40 bg-amber-500/10 text-amber-400'
};

function formatSentAt(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value || '—';

    return date.toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });
}

export function buildLogColumns(onResend: (row: NotificationLogRow) => void): Column[] {
    return [
        {
            key: 'email',
            label: 'Recipient',
            render: (row) => (
                <div className='flex flex-col'>
                    <span className='font-medium text-white'>{row.email || '—'}</span>
                    <span className='text-muted-foreground font-mono text-[11px]'>
                        {row.user_id ? `${row.user_id.slice(0, 8)}…` : '—'}
                    </span>
                </div>
            )
        },
        { key: 'type', label: 'Type' },
        { key: 'channel', label: 'Channel' },
        {
            key: 'status',
            label: 'Status',
            render: (row) => {
                const badge = (
                    <span
                        className={cn(
                            'rounded-md border px-2 py-0.5 text-xs font-semibold uppercase',
                            STATUS_STYLE[row.status] ?? 'border-slr-navy-border bg-slr-navy-card text-slr-dim'
                        )}>
                        {row.status || '—'}
                    </span>
                );

                // `error` is only ever populated on a failure. Production has
                // never produced a failed row, so this path is built from the
                // contract and is unverified against live data.
                if (!row.error) return badge;

                return (
                    <Tooltip>
                        <TooltipTrigger asChild>{badge}</TooltipTrigger>
                        <TooltipContent className='max-w-sm'>{row.error}</TooltipContent>
                    </Tooltip>
                );
            }
        },
        { key: 'provider', label: 'Provider' },
        { key: 'sent_at', label: 'Sent at', render: (row) => formatSentAt(row.sent_at) },
        {
            key: 'resend',
            label: '',
            render: (row) => (
                <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    onClick={() => onResend(row as NotificationLogRow)}
                    title={
                        row.template_id
                            ? 'Open the Send tab with this recipient and template filled in.'
                            : 'Open the Send tab with this recipient filled in — this row has no template recorded, so pick one.'
                    }>
                    <Send className='size-3.5' />
                    Resend
                </Button>
            )
        }
    ];
}
```

- [ ] **Step 2: Create `logs-client.tsx`**

```tsx
'use client';

import { useMemo, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { DataTable } from '@/components/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { NotificationLogMeta, NotificationLogRow } from '@/types/member';
import { KNOWN_NOTIFICATION_TYPES } from '@/types/member';

import { buildLogColumns } from './_components/log-columns';
import { Inbox, TriangleAlert } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'sent', label: 'Sent' },
    { value: 'failed', label: 'Failed' },
    { value: 'pending', label: 'Pending' }
];

export function LogsClient({
    rows,
    meta,
    type,
    status,
    logsFailed
}: {
    rows: NotificationLogRow[];
    meta: NotificationLogMeta;
    type: string;
    status: string;
    logsFailed: boolean;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Filters and paging live in the URL so a filtered view is shareable and
    // reloadable, matching (routes)/spin's history table.
    const pushParams = (next: { type?: string; status?: string; page?: number }) => {
        const nextType = next.type ?? type;
        const nextStatus = next.status ?? status;
        const nextPage = next.page ?? 1;

        const params = new URLSearchParams({ tab: 'logs' });
        if (nextType !== 'all') params.set('type', nextType);
        if (nextStatus !== 'all') params.set('status', nextStatus);
        if (nextPage > 1) params.set('page', String(nextPage));

        startTransition(() => {
            router.push(`/dashboard/notifications?${params.toString()}`);
        });
    };

    const columns = useMemo(
        () =>
            buildLogColumns((row) => {
                const params = new URLSearchParams({ tab: 'send', user_id: row.user_id });
                if (row.template_id) params.set('template_id', row.template_id);

                startTransition(() => {
                    router.push(`/dashboard/notifications?${params.toString()}`);
                });
            }),
        [router]
    );

    return (
        <div className='space-y-4'>
            <div className='flex flex-wrap gap-3'>
                <Select value={type} onValueChange={(value) => pushParams({ type: value })}>
                    <SelectTrigger className='w-48'>
                        <SelectValue placeholder='Type' />
                    </SelectTrigger>
                    <SelectContent className='dashboard-theme dark'>
                        <SelectItem value='all'>All types</SelectItem>
                        {KNOWN_NOTIFICATION_TYPES.map((value) => (
                            <SelectItem key={value} value={value}>
                                {value}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={status} onValueChange={(value) => pushParams({ status: value })}>
                    <SelectTrigger className='w-48'>
                        <SelectValue placeholder='Status' />
                    </SelectTrigger>
                    <SelectContent className='dashboard-theme dark'>
                        <SelectItem value='all'>All statuses</SelectItem>
                        {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <DataTable
                searchKey='email'
                isSearch={false}
                columns={columns}
                data={rows}
                isLoading={isPending}
                serverSide
                alwaysShowPagination
                nowrap
                currentPage={meta.page}
                totalItems={meta.total}
                itemsPerPage={meta.per_page}
                onPageChange={(page) => pushParams({ page })}
                emptyMessage={
                    logsFailed ? (
                        <span className='flex flex-col items-center gap-1'>
                            <TriangleAlert className='mb-1 size-8 text-amber-400/70' />
                            <span className='text-foreground text-sm font-semibold'>
                                Couldn&apos;t load delivery logs
                            </span>
                            <span className='max-w-sm text-xs leading-relaxed'>
                                The request failed — this is not a claim that nothing has been sent. Try reloading the
                                page.
                            </span>
                        </span>
                    ) : (
                        <span className='flex flex-col items-center gap-1'>
                            <Inbox className='mb-1 size-8 opacity-40' />
                            <span className='text-foreground text-sm font-semibold'>No notifications sent</span>
                            <span className='max-w-sm text-xs leading-relaxed'>
                                Delivery history will appear here as the platform sends emails and SMS.
                            </span>
                        </span>
                    )
                }
            />
        </div>
    );
}
```

- [ ] **Step 3: Wire it into `page.tsx`**

Add `import { LogsClient } from './logs-client';` and replace the logs `TabsContent` body with:

```tsx
                <TabsContent value='logs'>
                    <LogsClient rows={logs} meta={logsMeta} type={type} status={status} logsFailed={logsFailed} />
                </TabsContent>
```

- [ ] **Step 4: Verify in the browser**

Run `npm run dev` and open `/dashboard/notifications?tab=logs`.
Expected: the table shows the amber **"Couldn't load delivery logs"** state — *not* "No notifications sent". Both filter selects work and rewrite the URL while keeping `tab=logs`. Visiting `?tab=logs&type=bogus` must render with the Type select on "All types". Stop the dev server.

- [ ] **Step 5: Type-check, lint, format**

Run: `npx tsc --noEmit && npx prettier --write "src/app/dashboard/(routes)/notifications/**" && npx eslint "src/app/dashboard/(routes)/notifications"`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add "src/app/dashboard/(routes)/notifications"
git commit -m "feat(admin): add the Notifications delivery-logs tab with filters and resend"
```

---

### Task 5: Send tab

**Files:**
- Create: `src/app/dashboard/(routes)/notifications/_components/recipient-picker-dialog.tsx`
- Create: `src/app/dashboard/(routes)/notifications/send-client.tsx`
- Modify: `src/app/dashboard/(routes)/notifications/actions.ts` (append two exports)
- Modify: `src/app/dashboard/(routes)/notifications/page.tsx` (replace the Task 2 placeholder)

**Interfaces:**
- Consumes: `ActionResult`, `toActionError` from `./actions`; `MAX_SEND_RECIPIENTS` from `./seed`; `getAdminMembers`, `AdminMemberListItem`; `sendNotifications`
- Produces: `RecipientOption` (in `src/types/member.ts`); `searchRecipientsAction(query)`; `sendNotificationsAction(payload)`; `<RecipientPickerDialog />`; `<SendClient templates prefillUserId prefillTemplateId />`

**Constraint:** a `'use server'` module may export *only* async functions. `MAX_SEND_RECIPIENTS` therefore lives in `./seed` (added in Task 2) and `RecipientOption` in `src/types/member.ts` — neither may be declared in `actions.ts`. Type-only exports are erased at compile time and would pass, but keeping the interface with the other domain types is where it belongs.

- [ ] **Step 1: Add `RecipientOption` to `src/types/member.ts`**

Append to the admin-notifications section added in Task 1:

```ts
/** One row of the manual-send recipient picker. Deliberately excludes every
 *  other admin member field — the list row carries draw_pass, which must
 *  never reach any UI. */
export interface RecipientOption {
    user_id: string;
    name: string;
    email: string;
}
```

- [ ] **Step 2: Append the two actions to `actions.ts`**

Add these imports to the existing import block:

```ts
import { getAdminMembers } from '@/lib/api/resources/admin';
import { sendNotifications } from '@/lib/api/resources/notifications-admin';
import type { NotificationSendPayload, NotificationSendResult, RecipientOption } from '@/types/member';

import { MAX_SEND_RECIPIENTS } from './seed';
```

Then append:

```ts
export async function searchRecipientsAction(search: string): Promise<ActionResult<RecipientOption[]>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const members = await getAdminMembers(token, {
            search: search.trim() || undefined,
            perPage: MAX_SEND_RECIPIENTS
        });

        // Deliberately drops every field except identity and contact — the
        // list row carries draw_pass, which must never reach any UI.
        const data = members.map((m) => ({
            user_id: m.user_id,
            name: m.full_name,
            email: m.email
        }));

        return { ok: true, data, message: 'OK' };
    } catch (error) {
        return toActionError(error);
    }
}

export async function sendNotificationsAction(
    payload: NotificationSendPayload
): Promise<ActionResult<NotificationSendResult>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    if (payload.user_ids.length === 0) return { ok: false, message: 'Pick at least one recipient.' };
    if (payload.user_ids.length > MAX_SEND_RECIPIENTS) {
        return { ok: false, message: `A single send is limited to ${MAX_SEND_RECIPIENTS} recipients.` };
    }
    if (!payload.template_id) return { ok: false, message: 'Pick a template.' };

    try {
        const data = await sendNotifications(token, payload);
        revalidatePath('/dashboard/notifications');

        return { ok: true, data, message: `Queued ${data.queued}, skipped ${data.skipped}.` };
    } catch (error) {
        return toActionError(error);
    }
}
```

- [ ] **Step 3: Create `_components/recipient-picker-dialog.tsx`**

Modelled on `winners/_components/member-picker-dialog.tsx` — same debounce and DataTable shape — but multi-select. That component is not reused: it is single-select and coupled to draw-pool eligibility.

```tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

import { type Column, DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import type { RecipientOption } from '@/types/member';

import { searchRecipientsAction } from '../actions';
import { MAX_SEND_RECIPIENTS } from '../seed';
import { Search } from 'lucide-react';

export function RecipientPickerDialog({
    open,
    onOpenChange,
    selected,
    onConfirm
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selected: RecipientOption[];
    onConfirm: (next: RecipientOption[]) => void;
}) {
    const [search, setSearch] = useState('');
    const [rows, setRows] = useState<RecipientOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draft, setDraft] = useState<RecipientOption[]>(selected);

    useEffect(() => {
        if (open) setDraft(selected);
    }, [open, selected]);

    // Debounced so typing a name doesn't fire a request per keystroke.
    useEffect(() => {
        if (!open) return;

        let active = true;
        setIsLoading(true);

        const timer = setTimeout(async () => {
            const res = await searchRecipientsAction(search);
            if (!active) return;

            if (res.ok) {
                setRows(res.data);
                setError(null);
            } else {
                setRows([]);
                setError(res.message);
            }

            setIsLoading(false);
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [open, search]);

    const draftIds = useMemo(() => new Set(draft.map((d) => d.user_id)), [draft]);
    const isFull = draft.length >= MAX_SEND_RECIPIENTS;

    const toggle = (row: RecipientOption) => {
        setDraft((current) => {
            if (current.some((c) => c.user_id === row.user_id)) {
                return current.filter((c) => c.user_id !== row.user_id);
            }
            if (current.length >= MAX_SEND_RECIPIENTS) return current;

            return [...current, row];
        });
    };

    const columns: Column[] = useMemo(
        () => [
            {
                key: 'pick',
                label: '',
                render: (row) => {
                    const checked = draftIds.has(row.user_id);

                    return (
                        <Checkbox
                            checked={checked}
                            // A full selection must not silently swallow a click.
                            disabled={!checked && isFull}
                            onCheckedChange={() => toggle(row as RecipientOption)}
                            aria-label={`Select ${row.email}`}
                        />
                    );
                }
            },
            { key: 'name', label: 'Name', render: (row) => <span className='font-medium text-white'>{row.name}</span> },
            { key: 'email', label: 'Email' }
        ],
        [draftIds, isFull]
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='dashboard-theme dark sm:max-w-3xl'>
                <DialogHeader>
                    <DialogTitle className='text-white'>Choose recipients</DialogTitle>
                    <DialogDescription>
                        {draft.length} of {MAX_SEND_RECIPIENTS} selected
                        {isFull ? ' — the API rejects more than 100 recipients in one send.' : ''}
                    </DialogDescription>
                </DialogHeader>

                <div className='relative'>
                    <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                    <Input
                        placeholder='Search name or email...'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className='pl-10'
                    />
                </div>

                <div className='max-h-[55vh] overflow-y-auto'>
                    <DataTable
                        isSearch={false}
                        searchKey='name'
                        columns={columns}
                        data={rows}
                        isLoading={isLoading}
                        itemsPerPage={10}
                        emptyMessage={error ?? 'No members matched this search.'}
                    />
                </div>

                <DialogFooter>
                    <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type='button'
                        onClick={() => {
                            onConfirm(draft);
                            onOpenChange(false);
                        }}>
                        Use {draft.length} recipient{draft.length === 1 ? '' : 's'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
```

- [ ] **Step 4: Create `send-client.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';

import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { NotificationChannel, NotificationTemplate, RecipientOption } from '@/types/member';

import { RecipientPickerDialog } from './_components/recipient-picker-dialog';
import { sendNotificationsAction } from './actions';
import { MAX_SEND_RECIPIENTS } from './seed';
import { X } from 'lucide-react';

export function SendClient({
    templates,
    prefillUserId,
    prefillTemplateId
}: {
    templates: NotificationTemplate[];
    prefillUserId?: string;
    prefillTemplateId?: string;
}) {
    const [recipients, setRecipients] = useState<RecipientOption[]>([]);
    const [templateId, setTemplateId] = useState<string>(prefillTemplateId ?? '');
    const [channel, setChannel] = useState<NotificationChannel>('email');
    const [pickerOpen, setPickerOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // A Resend click lands here with only an id in the URL. Seed a chip from
    // it so the recipient is visible immediately; the name and email fill in
    // when the admin opens the picker.
    useEffect(() => {
        if (!prefillUserId) return;

        setRecipients((current) =>
            current.some((r) => r.user_id === prefillUserId)
                ? current
                : [...current, { user_id: prefillUserId, name: 'Selected member', email: prefillUserId }]
        );
    }, [prefillUserId]);

    const canSend = recipients.length > 0 && templateId !== '' && !isSending;
    const selectedTemplate = templates.find((t) => t.id === templateId) ?? null;

    const onSend = async () => {
        setIsSending(true);
        const result = await sendNotificationsAction({
            user_ids: recipients.map((r) => r.user_id),
            template_id: templateId,
            channel
        });
        setIsSending(false);
        setConfirmOpen(false);

        if (result.ok) {
            toast.success(result.message);
            if (result.data.skipped > 0) {
                toast.warning(
                    `${result.data.skipped} recipient${result.data.skipped === 1 ? '' : 's'} were skipped. The API does not report why.`
                );
            }
            setRecipients([]);

            return;
        }

        toast.error(result.message);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className='text-base'>Send a notification manually</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
                <div className='space-y-2'>
                    <Label>
                        Recipients ({recipients.length} / {MAX_SEND_RECIPIENTS})
                    </Label>
                    <div className='flex flex-wrap gap-2'>
                        {recipients.map((r) => (
                            <span
                                key={r.user_id}
                                className='border-slr-navy-border bg-slr-navy-card flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs'>
                                {r.email}
                                <button
                                    type='button'
                                    aria-label={`Remove ${r.email}`}
                                    onClick={() =>
                                        setRecipients((current) => current.filter((c) => c.user_id !== r.user_id))
                                    }>
                                    <X className='size-3' />
                                </button>
                            </span>
                        ))}
                    </div>
                    <Button type='button' variant='outline' size='sm' onClick={() => setPickerOpen(true)}>
                        Choose recipients
                    </Button>
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='space-y-2'>
                        <Label>Template</Label>
                        <Select value={templateId} onValueChange={setTemplateId}>
                            <SelectTrigger>
                                <SelectValue placeholder='Pick a template' />
                            </SelectTrigger>
                            <SelectContent className='dashboard-theme dark'>
                                {templates.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.type}
                                        {t.is_active ? '' : ' — inactive'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedTemplate && !selectedTemplate.is_active ? (
                            <p className='text-xs text-amber-400'>
                                This template is inactive. Sending it is probably a mistake.
                            </p>
                        ) : null}
                    </div>

                    <div className='space-y-2'>
                        <Label>Channel</Label>
                        <Select value={channel} onValueChange={(v) => setChannel(v as NotificationChannel)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className='dashboard-theme dark'>
                                <SelectItem value='email'>Email</SelectItem>
                                <SelectItem value='sms'>SMS — not yet verified in production</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button type='button' disabled={!canSend} onClick={() => setConfirmOpen(true)}>
                    {isSending ? 'Sending…' : 'Send'}
                </Button>
            </CardContent>

            <RecipientPickerDialog
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                selected={recipients}
                onConfirm={setRecipients}
            />

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent className='dashboard-theme dark'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Send to {recipients.length} member(s)?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This sends the <strong>{selectedTemplate?.type ?? 'selected'}</strong> template over{' '}
                            {channel} to {recipients.length} real member
                            {recipients.length === 1 ? '' : 's'}. It cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onSend}>Send now</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
```

- [ ] **Step 5: Wire it into `page.tsx`**

Add `import { SendClient } from './send-client';` and replace the send `TabsContent` body with:

```tsx
                <TabsContent value='send'>
                    <SendClient
                        templates={templates}
                        prefillUserId={params.user_id}
                        prefillTemplateId={params.template_id}
                    />
                </TabsContent>
```

- [ ] **Step 6: Verify in the browser**

Run `npm run dev` and open `/dashboard/notifications?tab=send`.
Expected: **Choose recipients** opens the dialog and search returns real members (`/admin/members` answers 200). Selecting members adds chips; the counter tracks them; at 100 the remaining checkboxes go disabled. **Send** stays disabled until a recipient *and* a template are chosen. Clicking **Send** opens the confirm dialog. **Do not confirm** — that would email real members. Cancel instead. Then open `?tab=send&user_id=<any-uuid>` and confirm a chip is pre-seeded. Stop the dev server.

- [ ] **Step 7: Type-check, lint, format**

Run: `npx tsc --noEmit && npx prettier --write "src/app/dashboard/(routes)/notifications/**" && npx eslint "src/app/dashboard/(routes)/notifications"`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add "src/app/dashboard/(routes)/notifications"
git commit -m "feat(admin): add the Notifications send tab with a capped recipient picker"
```

---

### Task 6: Re-enable the Spin tier filter

**Files:**
- Modify: `src/app/dashboard/(routes)/spin/page.tsx:64-104`
- Modify: `src/app/dashboard/(routes)/spin/spin-history-client.tsx:66-86`

**Interfaces:**
- Consumes: `SpinTierId`, `getAdminSpinHistory`'s existing `tier` filter — no signature changes anywhere.
- Produces: nothing new.

**Context:** `?tier=` was hardcoded to `'all'` and the Select shipped `disabled` on 2026-08-10 because every value made the endpoint answer 500. Re-verified 2026-08-11: `r1`→1 row, `r4`→1, `r7`→7, `b1`→2, `b4`→4, `b7`→4, `b10`→10, all 200. An unknown value answers `200 { data: [] }` rather than a validation error, so the page must still reject values outside the known set.

- [ ] **Step 1: Restore tier parsing in `page.tsx`**

Add `SpinTierId` to the existing `@/types/member` type import. Add this constant beside `MOMENT_VALUES`:

```ts
const TIER_VALUES: SpinTierId[] = ['visitor', 'r1', 'r4', 'r7', 'b1', 'b4', 'b7', 'b10'];

function isSpinTierId(value: string): value is SpinTierId {
    return (TIER_VALUES as readonly string[]).includes(value);
}
```

Widen the `searchParams` type to `{ tier?: string; moment?: string; page?: string }`, then replace the destructure and the hardcoded `tier` (the `const tier = 'all';` line plus its comment block) with:

```ts
    const { tier: rawTier = 'all', moment: rawMoment = 'all', page: rawPage } = await searchParams;
    // An unrecognised ?tier= must not be forwarded: the endpoint answers
    // 200 with an empty list for garbage rather than a validation error,
    // which would read as "no spins" for a typo.
    const tier = rawTier === 'all' || isSpinTierId(rawTier) ? rawTier : 'all';
```

- [ ] **Step 2: Forward `tier` to the API in `page.tsx`**

Replace the comment block inside the `getAdminSpinHistory` call with the parameter itself, so the call reads:

```ts
            getAdminSpinHistory(token, {
                tier: tier === 'all' ? undefined : tier,
                moment: moment === 'all' ? undefined : moment,
                page,
                perPage: 20
            })
```

- [ ] **Step 3: Re-enable the Select in `spin-history-client.tsx`**

Delete the `{/* Disabled on purpose: … */}` comment block, the `disabled` prop, and the `title` attribute, so the trigger reads:

```tsx
                <Select value={tier} onValueChange={(value) => pushParams({ tier: value })}>
                    <SelectTrigger className='w-44'>
                        <SelectValue placeholder='Tier' />
                    </SelectTrigger>
```

- [ ] **Step 4: Verify in the browser**

Run `npm run dev` and open `/dashboard/spin`.
Expected: the Tier select is enabled. Picking **BLUE B10 · Elite** rewrites the URL to `?tier=b10` and the table shows 10 rows; **RED R7 · Premium** shows 7. Changing the tier while on page 3 returns to page 1. Visiting `?tier=nonsense` renders "All tiers" with the full unfiltered list. Stop the dev server.

- [ ] **Step 5: Type-check, lint, format**

Run: `npx tsc --noEmit && npx prettier --write "src/app/dashboard/(routes)/spin/page.tsx" "src/app/dashboard/(routes)/spin/spin-history-client.tsx" && npx eslint "src/app/dashboard/(routes)/spin"`
Expected: no errors.

- [ ] **Step 6: Update the backend-issues doc**

In `docs/BACKEND-ISSUES.md`, mark the `?tier=` 500 entry resolved — note it was verified fixed on 2026-08-11 across all seven sub-tier ids, and that the *response body* still returns bare marketing names, which remains open.

- [ ] **Step 7: Commit**

```bash
git add "src/app/dashboard/(routes)/spin" docs/BACKEND-ISSUES.md
git commit -m "feat(admin): re-enable the spin tier filter now that ?tier= answers 200"
```
