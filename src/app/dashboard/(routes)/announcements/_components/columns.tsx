import { Column } from '@/components/data-table';

export const announcementsColumns: Column[] = [
    { key: 'type', label: 'Type' },
    { key: 'title', label: 'Title' },
    { key: 'content', label: 'Content' },
    { key: 'active', label: 'Active' },
    { key: 'order', label: 'Order' },
    { key: 'action', label: 'Action' }
];
