export const TABS = [
    { id: 'pending_activation', label: 'Pending Activation' },
    { id: 'active', label: 'Active' },
    { id: 'pending_deactivation', label: 'Pending Deactivation' },
    { id: 'cancelled', label: 'Cancelled' }
] as const;

const SUPPORTED: ReadonlySet<string> = new Set(['pending_activation', 'active', 'pending_deactivation', 'cancelled']);

export const isTabSupported = (tab: BenyTab): boolean => SUPPORTED.has(tab);

export type BenyTab = (typeof TABS)[number]['id'];

export const DEFAULT_BENY_TAB: BenyTab = 'pending_activation';

export function toBenyTab(raw: string | undefined): BenyTab {
    return TABS.some((t) => t.id === raw) ? (raw as BenyTab) : DEFAULT_BENY_TAB;
}
