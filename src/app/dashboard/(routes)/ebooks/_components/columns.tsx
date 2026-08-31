import { Column } from '@/components/data-table';

export const ebooksColumns: Column[] = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'type', label: 'Type' },
    { key: 'reading', label: 'Reading (min)' },
    { key: 'chapters', label: 'Chapters' },
    { key: 'locked', label: 'Locked' },
    { key: 'action', label: 'Action' }
];
