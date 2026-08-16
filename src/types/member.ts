// Member-domain types for the SLR member area.
//
// IMPORTANT: draw_pass is INTERNAL-ONLY and must never reach the frontend. The
// API exposes it as `entry_status` (active/inactive). These types deliberately
// omit draw_pass — only `entry_status` is modelled. See CLAUDE.md §1.

export type TierGroup = 'visitor' | 'red' | 'blue';

export type SubTierCode = 'VISITOR' | 'R1' | 'R4' | 'R7' | 'B1' | 'B4' | 'B7' | 'B10';

export type EntryStatus = 'active' | 'inactive';

export type BillingStatus = 'active' | 'past_due' | 'canceled';

export interface CurrentMember {
    name: string;
    email: string;
    sub_tier: SubTierCode;
    state: string; // AU state code, e.g. 'NSW'
    // Visitor never has this set (OTP-verified at signup, no post-payment
    // email-link flow) — only meaningful for RED/BLUE.
    email_verified_at: string | null;
}

export interface MembershipSummary {
    sub_tier: SubTierCode;
    state: string;
    billing_status: BillingStatus | null; // null = membership read failed; never assume 'active'
    price_cents: number; // integer cents AUD, billed per 28-day cycle
    next_payment_date: string; // ISO date — next renewal
    beny_addon: boolean | null; // BENY $4/mo add-on active; null = unknown (row hidden until the BENY endpoint lands)
    cancel_at_period_end?: boolean; // true = membership cancelled, will end at cycle end
}

export interface DrawStatus {
    giveaway_id: string;
    title: string;
    draw_pool: string; // state + tier, e.g. 'SLR Red · NSW'
    prize_label: string;
    entry_status: EntryStatus; // active/inactive only — never draw_pass
    total_entries: number; // member's entries in this draw (token count, safe to render)
    draws_at: string; // ISO datetime — drives the countdown
}

export interface FeaturedDiscount {
    id: string;
    brand: string;
    category: string;
    value_label: string; // e.g. '5% off', '4¢ / L'
}

export interface UpcomingGiveaway {
    id: string;
    title: string;
    tier_group: TierGroup;
    draw_type: GiveawayDrawType;
    prize_label: string;
    draws_at: string; // ISO datetime
    locked: boolean; // true when the giveaway tier is above the member's (upgrade required)
}

export interface MemberDashboard {
    member: CurrentMember;
    summary: MembershipSummary;
    draw: DrawStatus;
    featured_discounts: FeaturedDiscount[];
    upcoming_giveaways: UpcomingGiveaway[];
    notifications_count: number;
}

// ── Giveaways (PRD §4.3) ─────────────────────────────────────────────────────

/** Lifecycle derived from the giveaway window: not yet open / open (countdown) / draw time passed. */
export type GiveawayPhase = 'upcoming' | 'active' | 'drawn';

export type GiveawayDrawType = 'weekly' | 'monthly' | null;

export interface Giveaway {
    id: string;
    title: string;
    tier_group: TierGroup;
    draw_type: GiveawayDrawType; // Weekly/Monthly chip; null when the API sends something else
    draw_pool: string; // state + tier, e.g. 'SLR Red · NSW'
    prize_label: string;
    entered: boolean; // "You're Entered" — member has active entries in this draw
    entry_status: EntryStatus; // active/inactive only — never draw_pass
    total_entries: number; // member's entries in this draw (token count; 0 if not entered)
    pool_entries: number; // aggregate community entries in the pool (odds context)
    locked: boolean; // giveaway tier above the member's → upgrade required
    phase: GiveawayPhase;
    opens_at: string; // ISO datetime — "Opens …" copy for upcoming draws
    draws_at: string; // ISO datetime — drives the countdown
}

export interface GiveawayEntryRow {
    cycle: string; // e.g. 'Cycle 12 · Jun 2026'
    entries: number; // token-based, safe to render
    status: EntryStatus;
}

export interface PastWinner {
    name: string;
    state: string; // AU state code
    prize: string;
    drawn_at: string; // ISO date
}

export interface GiveawayDetail extends Giveaway {
    prize_description: string;
    rules: string[];
    tpal_note: string;
    entry_history: GiveawayEntryRow[];
    past_winners: PastWinner[];
}

// ── Prizes (PRD §"Sistem Stage Prize Pool") ──────────────────────────────────
// Informational, CMS-editable page. Every field is plain text the admin types
// per stage — no system logic, no live member count exposed by the API (the
// old `current_members`-driven progress bar this used to model was never a
// real endpoint; deleted in the 2026-08-12 rewire onto the real flat contract
// below, which admin and member both read).

/** Per-tier-group display row, derived client-side from `PrizeContent` — not
 *  an API shape itself. `tier_label`/`price_label` come from constant/tiers.ts;
 *  `weekly`/`monthly` are the matching CMS fields off `PrizeContent`. */
export interface PrizeTierBreakdown {
    tier_group: TierGroup;
    tier_label: string; // e.g. 'SLR RED'
    price_label: string; // e.g. '$10/month' / 'Free to join'
    weekly: string; // weekly reward copy
    monthly: string | null; // monthly bonus copy, or null when none
}

// Flat CMS document returned by GET/PUT /admin/prizes and member-readable
// GET /prizes (real API, 2026-08-09 admin / 2026-08-12 member).
export interface PrizeContent {
    prize_pool_headline: string;
    prize_count: string;
    stage_label: string;
    visitor_prize: string;
    red_weekly: string;
    red_monthly: string;
    blue_weekly: string;
    blue_monthly: string;
    odds: string;
    // Nullable: the live endpoint returned `null` here on 2026-08-10 even
    // though the API doc's example shows an ISO string.
    updated_at: string | null;
}

export type PrizeContentUpdatePayload = Omit<PrizeContent, 'updated_at'>;

// ── Safe Hours (real API, 2026-08-09) ─────────────────────────────────────────
// Admin-edited lockout window during which sign-up/upgrade/downgrade are
// locked. The member-facing advisory check in src/lib/safe-hours.ts is a
// separate, independent static constant with its own drift-gap comment —
// nothing about this document's shape affects that file.

export type SafeHoursDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type SafeHoursOverride = 'NONE' | 'FORCE_LOCK' | 'FORCE_UNLOCK';

export interface SafeHoursConfig {
    day_of_week: SafeHoursDay;
    start_time: string; // 'HH:MM', 24h
    end_time: string; // 'HH:MM', 24h, strictly after start_time
    is_active: boolean;
    manual_override: SafeHoursOverride;
    is_currently_locked: boolean; // read-only, server-computed
    // The live endpoint answers `null` here (verified 2026-08-11), even though
    // its OpenAPI schema declares a plain string.
    updated_at: string | null;
}

export type SafeHoursUpdatePayload = Omit<SafeHoursConfig, 'is_currently_locked' | 'updated_at'>;

// ── Discounts (PRD §4.4) ─────────────────────────────────────────────────────
// Basic partner discounts: RED/BLUE only (Visitor sees an upgrade gate). BENY is
// a separate $4/mo external add-on — web collects contact details then admin
// activates manually; no system integration.

export interface Discount {
    id: string;
    brand: string;
    category: string; // one of DISCOUNT_CATEGORIES
    value_label: string; // e.g. '5% off', '4¢ / L'
    code: string; // copy-to-clipboard promo code
    description: string;
    terms: string;
}

export interface BenyStatus {
    active: boolean; // member currently subscribed to the BENY add-on
}

// ── Entry History (PRD §"Entry History Page") ────────────────────────────────
// Per-cycle record. Shows token counts (renderable) + entry_status only — the
// internal draw_pass number is NEVER exposed (active = draw_pass > 0).

export type TierChange = 'upgrade' | 'downgrade' | null;

export interface EntryHistoryEntry {
    id: string;
    cycle_label: string; // e.g. 'Cycle 12'
    cycle_range: string; // e.g. '5 Jun – 3 Jul 2026'
    sub_tier: SubTierCode; // tier held during that cycle
    base_tokens: number; // base tokens for the tier
    referral_bonus: number; // bonus tokens from referrals (0 if none)
    total_tokens: number; // active tokens = base + referral
    entry_status: EntryStatus; // active/inactive (draw_pass projection)
    inactive_reason?: string; // shown when inactive (e.g. previous winner / grace)
    tier_change: TierChange; // tier change that took effect this cycle
    changed_from?: SubTierCode; // the previous tier, when tier_change is set
}

// ── Profile & Account (PRD §4.7) ─────────────────────────────────────────────

/**
 * Everything the profile page renders, and nothing else — every field comes from
 * `GET /auth/me` (session as fallback). Billing, plan changes and invoices live
 * on /member/membership off billing/memberships; they are not duplicated here.
 * `member_id` and `joined_at` are absent on purpose: the API exposes neither, and
 * inventing them is what made this page show a stranger's join date.
 */
export interface MemberProfile {
    id: string;
    name: string;
    email: string;
    phone: string | null; // "-" in UI when null
    sub_tier: SubTierCode;
    state: string;
    dob: string | null; // ISO date, "-" in UI when null
    joinedAt: string | null; // ISO date, null if unverified/unavailable
}

// ── Spin Wheel Admin (real API, 2026-08-09) ───────────────────────────────────
// First-release scope: on/off (global + per sub-tier) + per-sub-tier discount +
// history. constant/tiers.ts's SPIN_ELIGIBLE_SUB_TIERS (SubTierCode-keyed,
// uppercase) still gates which sub-tiers the config form renders as editable —
// Visitor/R1/B1 stay permanently ineligible per PRD, regardless of what the
// wire format (SpinTierId, lowercase, all 8 codes) includes.

export type SpinTierId = 'visitor' | 'r1' | 'r4' | 'r7' | 'b1' | 'b4' | 'b7' | 'b10';

export type SpinMoment = 'registration' | 'pre_renewal';

export interface SpinSubTierConfig {
    /**
     * Widened past SpinTierId on purpose: the live endpoint returns a ninth
     * row with `sub_tier_id: 'beny'` and the BENY product name as its
     * marketing_name (verified 2026-08-11). BENY is a $4/mo add-on, not a
     * tier — filed in docs/BACKEND-ISSUES.md. Typing this as SpinTierId would
     * have claimed a shape the API does not honour; the config form carries
     * unknown ids through a save untouched rather than dropping them.
     */
    sub_tier_id: SpinTierId | (string & {});
    marketing_name: string;
    has_spin: boolean;
    spin_discount_cents: number;
}

export interface SpinConfig {
    global_enabled: boolean;
    sub_tiers: SpinSubTierConfig[];
}

export interface SpinHistoryRow {
    spin_id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    /**
     * Display string from the API. The doc's example shows 'Red Plus', but the
     * live endpoint returns bare marketing names ('Plus', 'Premium', 'Elite',
     * 'Standard', 'Visitor') — so 'Plus' is ambiguous between R4 and B4, and a
     * BENY add-on label leaks in as if it were a tier. Rendered verbatim
     * because there is no group field to disambiguate it with; filed in
     * docs/BACKEND-ISSUES.md.
     */
    tier: string;
    moment: SpinMoment;
    result: 'win' | 'lose';
    discount_cents: number;
    applied: boolean;
    expires_at: string | null;
    created_at: string;
}

export interface SpinHistoryMeta {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
}

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

/** One row of the manual-send recipient picker. Deliberately excludes
 *  draw_pass, which must never reach any UI — but keeps `status`, so an admin
 *  can see they are about to email a suspended or deactivated account. */
export interface RecipientOption {
    user_id: string;
    name: string;
    email: string;
    status: string;
}

export interface RecipientSearchResult {
    rows: RecipientOption[];
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
}
