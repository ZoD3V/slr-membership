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
    sub_tier: SubTierCode;
    state: string; // AU state code, e.g. 'NSW'
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

// ── Notifications (member bell panel) ────────────────────────────────────────

export type NotificationType =
    | 'draw_win'
    | 'draw_result'
    | 'renewal'
    | 'spin'
    | 'referral'
    | 'tier_change'
    | 'beny'
    | 'system';

export interface MemberNotification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    created_at: string; // ISO
    read_at: string | null; // null = unread
    href?: string; // optional navigation target on click
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
// Informational, CMS-editable page. Every field below is a plain text/number
// the admin edits per stage — no system logic. Prize pool figures are marketing
// language; actual draws happen externally at TPAL. Stage figures (label,
// current stage, thresholds) are derived from `current_members` in `@/lib/prizes`
// rather than stored — see that module for the derivation.

export interface PrizeTierBreakdown {
    tier_group: TierGroup;
    tier_label: string; // e.g. 'SLR RED'
    price_label: string; // e.g. '$10/month' / 'Free to join'
    weekly: string; // weekly reward copy
    monthly: string | null; // monthly bonus copy, or null when none
}

export interface PrizePool {
    headline: string; // CMS text, e.g. '$2,100'
    prizes_sublabel: string; // e.g. '@ 22 Prizes • One Month'
    current_members: number; // paid members, typed by admin (PRD §3.2 "total members")
    odds_label: string; // e.g. '9 in 10 wins yearly'
    tiers: PrizeTierBreakdown[];
}

// ── Admin Prize Content (real API, 2026-08-09) ───────────────────────────────
// Flat CMS document returned by GET/PUT /admin/prizes. Distinct from PrizePool
// above, which models a still-unconfirmed public/member document on a
// different, still-404 endpoint (Phase 2, not touched by this rewire).
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

// ── Safe Hours (PRD §5.8 "Safe Hours Management") ────────────────────────────
// Admin-edited window during which sign-up/upgrade/downgrade are locked. The
// member-facing advisory check in src/lib/safe-hours.ts is a separate, static
// constant — there is no public endpoint for it to read this document from
// (see docs/superpowers/specs/2026-08-08-admin-safe-hours-design.md §2).

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface SafeHoursConfig {
    weekday: Weekday;
    start_hour: number; // 0-23
    end_hour: number; // 0-23, strictly greater than start_hour
}

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
    name: string;
    email: string;
    phone: string | null; // "-" in UI when null
    sub_tier: SubTierCode;
    state: string;
    dob: string | null; // ISO date, "-" in UI when null
}

// ── Spin Wheel Admin (PRD §5.7 "Spin Wheel Management") ──────────────────────
// First-release scope only: on/off + history. Discount amount and probability
// are explicitly deferred by PRD's PO decision — never add fields for them here.

export type SpinEligibleSubTier = 'R4' | 'R7' | 'B4' | 'B7' | 'B10';

export interface SpinConfig {
    enabled: boolean;
    sub_tier_enabled: Record<SpinEligibleSubTier, boolean>;
}

export interface SpinHistoryRow {
    id: string;
    member_name: string;
    tier: SubTierCode;
    moment: 'registration' | 'renewal';
    result: 'win' | 'lose';
    discount_cents: number;
    spun_at: string; // ISO 8601
}
