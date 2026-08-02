// Shared between the server page (validating ?status=) and the client tab bar.
export const TABS = [
    { id: 'pending_activation', label: 'Pending Activation' },
    { id: 'active', label: 'Active' },
    { id: 'pending_deactivation', label: 'Pending Deactivation' },
    { id: 'cancelled', label: 'Cancelled' }
] as const;

/**
 * Statuses the API actually accepts today. Verified live 2026-08-02:
 * `?status=pending_deactivation` → 400 "Allowed values: PENDING_ACTIVATION,
 * ACTIVE, CANCELLED". The PRD §2.3 four-state flow is not implemented yet, so
 * that tab renders a notice instead of firing a request that can only fail.
 * Delete this set once the backend adds the status.
 */
const SUPPORTED: ReadonlySet<string> = new Set(['pending_activation', 'active', 'pending_deactivation', 'cancelled']);

export const isTabSupported = (tab: BenyTab): boolean => SUPPORTED.has(tab);

export type BenyTab = (typeof TABS)[number]['id'];

export const DEFAULT_BENY_TAB: BenyTab = 'pending_activation';

export function toBenyTab(raw: string | undefined): BenyTab {
    return TABS.some((t) => t.id === raw) ? (raw as BenyTab) : DEFAULT_BENY_TAB;
}
