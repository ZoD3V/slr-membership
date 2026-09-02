import { ChevronRight } from 'lucide-react';

/**
 * Draw rules come from the Announcements CMS (type DRAW_RULES). Until an admin
 * writes that document, the hard-coded list stays as the fallback so members are
 * never shown an empty rules panel.
 */
export function DrawRulesBody({ html, fallback }: { html?: string | null; fallback: string[] }) {
    if (html?.trim()) {
        return (
            <div
                className='tiptap text-slr-muted max-w-none text-sm leading-relaxed'
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    }

    return (
        <ul className='space-y-2.5'>
            {fallback.map((rule, index) => (
                <li key={index} className='flex gap-2.5 text-sm text-white/90'>
                    <ChevronRight className='text-slr-gold-label mt-0.5 size-4 shrink-0' />
                    <span className='leading-relaxed'>{rule}</span>
                </li>
            ))}
        </ul>
    );
}
