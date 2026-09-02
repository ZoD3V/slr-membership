import Link from 'next/link';

import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import type { ListError } from '@/components/common/list-error-card';
import { Button } from '@/components/ui/button';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { toListError } from '@/lib/api/list-error';
import { compareAnnouncements, getAllAdminAnnouncements } from '@/lib/api/resources/announcements';
import { getAccessToken } from '@/lib/api/server';

import { type AnnouncementRow, AnnouncementsClient } from './announcements-client';
import { Plus } from 'lucide-react';

// Non-running-text announcements are authored in the rich text editor, so the raw
// column value is HTML. Strip it down to readable text for the table.
function preview(content: string): string {
    const flat = content
        .replace(/<(br|\/p|\/li|\/h[1-6]|\/blockquote)>/gi, ' ')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, ' ')
        .trim();

    if (!flat) return '-';

    return flat.length > 70 ? `${flat.slice(0, 70)}…` : flat;
}

export default async function AnnouncementsPage() {
    const token = await getAccessToken();

    let rows: AnnouncementRow[] = [];
    let listError: ListError | null = null;

    try {
        const announcements = token ? await getAllAdminAnnouncements(token) : [];
        rows = [...announcements].sort(compareAnnouncements).map((a) => ({
            id: a.id,
            type: a.type || '-',
            title: a.title || '-',
            content: preview(a.content ?? ''),
            active: a.is_active ? 'Yes' : 'No',
            order: a.sort_order ?? 0
        }));
    } catch (error) {
        handleApiAuthError(error);
        listError = toListError(error);
    }

    return (
        <DashboardPageShell>
            <div className='flex items-center justify-between'>
                <Heading title='Announcements' description='Running text and announcements shown across the platform' />
                <Button asChild>
                    <Link href='/dashboard/announcements/new'>
                        <Plus className='mr-2 h-4 w-4' />
                        New Announcement
                    </Link>
                </Button>
            </div>

            <AnnouncementsClient initialRows={rows} listError={listError} />
        </DashboardPageShell>
    );
}
