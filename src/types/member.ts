export type TierGroup = 'visitor' | 'red' | 'blue';

export type SubTierCode = 'VISITOR' | 'R1' | 'R4' | 'R7' | 'B1' | 'B4' | 'B7' | 'B10';

export type EntryStatus = 'active' | 'inactive';

export type BillingStatus = 'active' | 'past_due' | 'canceled';

export interface CurrentMember {
    name: string;
    email: string;
    sub_tier: SubTierCode;
    state: string;

    email_verified_at: string | null;
}

export interface MembershipSummary {
    sub_tier: SubTierCode;
    state: string;
    billing_status: BillingStatus | null;
    price_cents: number;
    next_payment_date: string;
    beny_addon: boolean | null;
    cancel_at_period_end?: boolean;
}

export interface DrawStatus {
    giveaway_id: string;
    title: string;
    draw_pool: string;
    prize_label: string;
    entry_status: EntryStatus;
    total_entries: number;
    draws_at: string;
}

export interface FeaturedDiscount {
    id: string;
    brand: string;
    category: string;
    value_label: string;
}

export interface UpcomingGiveaway {
    id: string;
    title: string;
    tier_group: TierGroup;
    draw_type: GiveawayDrawType;
    prize_label: string;
    draws_at: string;
    locked: boolean;
}

export interface MemberDashboard {
    member: CurrentMember;
    summary: MembershipSummary;
    draw: DrawStatus;
    featured_discounts: FeaturedDiscount[];
    upcoming_giveaways: UpcomingGiveaway[];
    notifications_count: number;
}

export type GiveawayPhase = 'upcoming' | 'active' | 'drawn';

export type GiveawayDrawType = 'weekly' | 'monthly' | null;

export interface Giveaway {
    id: string;
    title: string;
    tier_group: TierGroup;
    draw_type: GiveawayDrawType;
    draw_pool: string;
    prize_label: string;
    entered: boolean;
    entry_status: EntryStatus;
    total_entries: number;
    pool_entries: number;
    locked: boolean;
    phase: GiveawayPhase;
    opens_at: string;
    draws_at: string;
}

export interface GiveawayEntryRow {
    cycle: string;
    entries: number;
    status: EntryStatus;
}

export interface PastWinner {
    name: string;
    state: string;
    prize: string;
    drawn_at: string;
}

export interface GiveawayDetail extends Giveaway {
    prize_description: string;
    rules: string[];
    tpal_note: string;
    entry_history: GiveawayEntryRow[];
    past_winners: PastWinner[];
}

export interface PrizeTierBreakdown {
    tier_group: TierGroup;
    tier_label: string;
    price_label: string;
    weekly: string;
    monthly: string | null;
}

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

    updated_at: string | null;
}

export type PrizeContentUpdatePayload = Omit<PrizeContent, 'updated_at'>;

export type SafeHoursDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type SafeHoursOverride = 'NONE' | 'FORCE_LOCK' | 'FORCE_UNLOCK';

export interface SafeHoursConfig {
    day_of_week: SafeHoursDay;
    start_time: string;
    end_time: string;
    is_active: boolean;
    manual_override: SafeHoursOverride;
    is_currently_locked: boolean;

    updated_at: string | null;
}

export type SafeHoursUpdatePayload = Omit<SafeHoursConfig, 'is_currently_locked' | 'updated_at'>;

export interface Discount {
    id: string;
    brand: string;
    category: string;
    value_label: string;
    code: string;
    description: string;
    terms: string;
}

export interface BenyStatus {
    active: boolean;
}

export type TierChange = 'upgrade' | 'downgrade' | null;

export interface EntryHistoryEntry {
    id: string;
    cycle_label: string;
    cycle_range: string;
    sub_tier: SubTierCode;
    base_tokens: number;
    referral_bonus: number;
    total_tokens: number;
    entry_status: EntryStatus;
    inactive_reason?: string;
    tier_change: TierChange;
    changed_from?: SubTierCode;
}

export interface MemberProfile {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    sub_tier: SubTierCode;
    state: string;
    dob: string | null;
    joinedAt: string | null;
}

export type SpinTierId = 'visitor' | 'r1' | 'r4' | 'r7' | 'b1' | 'b4' | 'b7' | 'b10';

export type SpinMoment = 'registration' | 'pre_renewal';

export interface SpinSubTierConfig {
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

export type NotificationChannel = 'email' | 'sms';
export type NotificationLogStatus = 'sent' | 'failed' | 'pending';

export const KNOWN_NOTIFICATION_TYPES = [
    'welcome',
    'otp',
    'password_reset',
    'email_verification',
    'payment_confirmation',
    'payment_failed',
    'referral_bonus',
    'spin_reminder',
    'tier_change',
    'beny_activation',
    'draw_reminder',
    'draw_result'
] as const;
export type KnownNotificationType = (typeof KNOWN_NOTIFICATION_TYPES)[number];

export interface NotificationTemplate {
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
