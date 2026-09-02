import { notFound } from 'next/navigation';

import { getAdminAnnouncement } from '@/lib/api/resources/announcements';
import { getAccessToken } from '@/lib/api/server';

import { AnnouncementForm } from '../_components/announcement-form';

interface EditAnnouncementPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditAnnouncementPage({ params }: EditAnnouncementPageProps) {
    const { id } = await params;
    const token = await getAccessToken();

    if (!token) notFound();

    try {
        const announcement = await getAdminAnnouncement(id, token);

        return (
            <AnnouncementForm
                initialData={{
                    id: announcement.id,
                    type: announcement.type || 'RUNNING_TEXT',
                    title: announcement.title ?? '',
                    content: announcement.content ?? '',
                    linkUrl: announcement.link_url ?? '',
                    isActive: announcement.is_active,
                    sortOrder: announcement.sort_order ?? 0
                }}
            />
        );
    } catch (error) {
        console.error('Failed to fetch announcement:', error);
        notFound();
    }
}
