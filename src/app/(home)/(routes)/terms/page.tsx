import { Metadata } from 'next';
import Link from 'next/link';

import { SUB_TIERS } from '@/constant/tiers';
import { getPublicPrizeContent } from '@/lib/api/resources/prizes';
import { GRAND_BONUS, membersCapLabel, poolLabel } from '@/lib/prize-content';
import { type TierPricing, codesForGroup, getTierPricing } from '@/lib/tier-pricing';
import type { PrizeContent } from '@/types/member';

import LegalDoc, {
    LegalContactCard,
    LegalSection,
    LegalList as List,
    LegalSub as Sub,
    LegalTerm as Term
} from '../_components/legal-doc';
import PageHero from '../_components/page-hero';

export const metadata: Metadata = {
    title: 'Terms & Conditions · SLR Rewards',
    description: 'Membership, benefits and promotional draw terms for SLR Life Pty Ltd trading as Smart Life Rewards.'
};

const MailLink = () => (
    <a href='mailto:cs@smartliferewards.com.au' className='text-[#FFDC75] hover:underline'>
        cs@smartliferewards.com.au
    </a>
);

/** Membership options are quoted from the live tier pricing so the Terms cannot drift from checkout. */
const membershipOptions = (pricing: TierPricing, group: 'red' | 'blue') =>
    codesForGroup(pricing, group).map((code) => {
        const { priceCents, tokens, spinDiscountCents } = pricing[code];
        const spin = spinDiscountCents > 0 ? `28-Day Spinwheel — $${spinDiscountCents / 100} discount` : 'No Spin';

        return `${SUB_TIERS[code].marketingName}: $${priceCents / 100}/28 days — ${tokens} ${tokens === 1 ? 'Entry' : 'Entries'} (${spin})`;
    });

/** Used only when the prizes CMS is unreachable, so the Terms never render a blank figure. */
const FALLBACK_POOL = '$2,100';
const FALLBACK_CAP = '100 Members Capped';

const buildSections = (pricing: TierPricing, pool: string, membersCap: string): LegalSection[] => [
    {
        heading: 'About Smart Life Rewards',
        body: (
            <>
                <p>1.1 Smart Life Rewards (&ldquo;SLR&rdquo;) is operated by SLR Life Pty Ltd.</p>
                <p>1.2 SLR operates as a membership, savings and rewards platform.</p>
                <p>1.3 Membership may provide access to benefits including:</p>
                <List
                    items={[
                        'Member and Partner discounts;',
                        'Lifestyle savings;',
                        'Member benefits;',
                        'Promotional rewards and Promotional Draws;',
                        'Grocery-related rewards;',
                        'Digital Member services;',
                        'Spin Wheel promotions;',
                        'Referral, tag-a-friend and promotional codes;',
                        'Community initiatives and local business offers;',
                        'Affiliate and third-party offers;',
                        'Merchandise or promotional products;',
                        'A single SLR Member Account through which an eligible Member may participate in Red Membership, Blue Membership, or both; and',
                        'Other benefits introduced by SLR from time to time.'
                    ]}
                />
                <p>
                    1.4 Membership fees are paid for access to the applicable membership platform, services, benefits,
                    savings, discounts and features.
                </p>
                <p>
                    1.5 Promotional Draws and promotional opportunities are ancillary benefits associated with the SLR
                    platform and may be governed by separate Promotion Terms &amp; Conditions or Promotion Schedules.
                </p>
                <p>
                    1.6 Purchasing or maintaining an SLR Membership does not guarantee that a Member will win a prize.
                </p>
                <p>
                    1.7 SLR does not provide gambling, financial or investment advice and does not promise or guarantee
                    any financial return or profit.
                </p>
            </>
        )
    },
    {
        heading: 'Definitions',
        body: (
            <>
                <p>For these Terms:</p>
                <Term term='SLR”, “we”, “our” or “us'>means SLR Life Pty Ltd trading as Smart Life Rewards.</Term>
                <Term term='Member'>
                    means a registered person holding an eligible Red Membership, Blue Membership, or both, where
                    applicable.
                </Term>
                <Term term='Member Account'>
                    means the single personal SLR account established for an individual and identified by the
                    Member&rsquo;s registered details and unique SLR Member ID.
                </Term>
                <Term term='Membership Cycle'>
                    means the applicable 28-day recurring Membership period, unless another period is expressly
                    displayed at the time of purchase.
                </Term>
                <Term term='Entry'>
                    means a promotional entry or chance allocated through an eligible SLR Membership level or
                    promotional activity. Where a Promotion Schedule provides for participation in a Promotional Draw,
                    each valid Entry represents one chance in that Promotional Draw unless the Promotion Schedule
                    expressly states otherwise.
                </Term>
                <p>Entries:</p>
                <List
                    items={[
                        'Have no independent cash value;',
                        'Cannot ordinarily be sold or transferred;',
                        'Cannot be redeemed for cash; and',
                        'May only be used in accordance with the applicable SLR Promotion Schedule.'
                    ]}
                />
                <Term term='Promotional Draw'>
                    means an SLR daily, weekly, monthly, bonus or special promotional game-of-chance activity.
                </Term>
                <Term term='Promotion Schedule'>means the specific terms applying to an individual SLR promotion.</Term>
                <Term term='Prize Pool'>
                    means the stated total value of prizes allocated to the promotion, period, Membership categories or
                    combination of promotional activities expressly identified by SLR.
                </Term>
                <Term term='Spin Wheel'>
                    means an optional promotional feature through which an eligible Member may receive a Membership
                    reduction, promotional benefit, bonus or other displayed outcome.
                </Term>
                <Term term='Partner'>
                    means an independent business or service provider whose product, discount, service or benefit may be
                    made available through SLR.
                </Term>
            </>
        )
    },
    {
        heading: 'Acceptance of terms',
        body: (
            <>
                <p>3.1 These Terms apply to SLR Members, account holders and promotional participants.</p>
                <p>
                    3.2 By registering an account, purchasing or renewing an SLR Membership, accessing Member services
                    or participating in an SLR promotion, the person agrees to be bound by:
                </p>
                <List
                    items={[
                        'These General Terms & Conditions;',
                        'Applicable Membership Rules;',
                        'Applicable Promotion Schedules;',
                        'Subscription and Billing Terms;',
                        'Privacy Policy;',
                        'Website Terms of Use; and',
                        'Any additional conditions clearly disclosed for a particular benefit or promotion.'
                    ]}
                />
                <p>
                    3.3 If there is an inconsistency between these General Terms and the specific Promotion Schedule for
                    a particular Promotional Draw, the Promotion Schedule applies to that promotion to the extent of the
                    inconsistency, subject to applicable law.
                </p>
            </>
        )
    },
    {
        heading: 'Membership eligibility',
        body: (
            <>
                <p>
                    4.1 Paid SLR Membership and Promotional Draw participation is intended for persons aged 18 years or
                    older, unless expressly stated otherwise.
                </p>
                <p>4.2 Individual promotions may contain additional:</p>
                <List
                    items={[
                        'Age restrictions;',
                        'Australian residency requirements;',
                        'State or territory restrictions;',
                        'Permit conditions;',
                        'Geographic restrictions; or',
                        'Other eligibility requirements.'
                    ]}
                />
                <p>4.3 Members must provide accurate, complete and current registration information.</p>
                <p>
                    4.4 SLR may request reasonable evidence of identity, age, residential address, Membership status or
                    other eligibility information.
                </p>
                <p>
                    4.5 Membership accounts are personal and must not be sold, transferred, shared or assigned without
                    SLR&rsquo;s written approval.
                </p>
                <p>4.6 Members are responsible for maintaining the security of their account and login credentials.</p>
                <Sub>4.7 State and territory eligibility &amp; misrepresentation</Sub>
                <p>
                    Where SLR restricts Membership or Promotional Draw participation to residents of specific Australian
                    States or Territories (such as Victoria only), Members are strictly prohibited from misrepresenting
                    their state of residence to gain access. By selecting a specific State or Territory during
                    registration, the Member warrants that they genuinely and legally reside in that jurisdiction. SLR
                    accepts no liability or regulatory responsibility for users who intentionally circumvent geographic
                    restrictions. Any Membership created, Entries allocated, or prizes won by a person providing false
                    residential information will be immediately void, cancelled, and forfeited without refund.
                </p>
            </>
        )
    },
    {
        heading: 'SLR membership levels',
        body: (
            <>
                <p>SLR may currently offer the following Membership structures.</p>
                <Sub>5.1 Red Membership</Sub>
                <p>Current Red Membership options may include:</p>
                <List items={membershipOptions(pricing, 'red')} />
                <Sub>5.2 Blue Membership</Sub>
                <p>Current Blue Membership options may include:</p>
                <List items={membershipOptions(pricing, 'blue')} />
                <p>
                    5.3 Current Membership prices, inclusions and benefits displayed on the SLR website at the time of
                    purchase form part of the applicable Membership offering.
                </p>
                <p>
                    5.4 Membership structures, benefits and prices may be changed from time to time subject to these
                    Terms and applicable law.
                </p>
                <Sub>5.5 One person = one SLR Member Account</Sub>
                <p>5.5.1 One person may hold one personal SLR Member Account.</p>
                <p>
                    5.5.2 The Member Account may be identified through the Member&rsquo;s registered email address,
                    registered mobile number and unique SLR Member ID.
                </p>
                <p>
                    5.5.3 Subject to eligibility, the same SLR Member Account may hold Red Membership only, Blue
                    Membership only, or Red Membership and Blue Membership concurrently.
                </p>
                <p>
                    5.5.4 A Member does not need to create a second SLR account or use a second email address merely to
                    participate in both Red and Blue Memberships.
                </p>
                <p>
                    5.5.5 Where a Member holds both Red and Blue Memberships, SLR will record each tier separately where
                    applicable for Membership status, payments and billing, Entries, Promotional Draw eligibility,
                    tier-specific benefits and other Membership entitlements.
                </p>
                <p>
                    5.5.6 A person holding both Red and Blue Memberships remains one individual SLR Member for
                    SLR&rsquo;s unique Member count, unless a published figure expressly measures Memberships, tier
                    participation or Entries instead of individual people.
                </p>
                <Sub>5.6 Add-on subscriptions</Sub>
                <p>
                    SLR may offer optional paid &ldquo;Add-On&rdquo; subscriptions (such as access to the Beny platform)
                    for an additional recurring fee. These Add-Ons are billed on the same 28-day cycle as the base
                    Membership tier unless stated otherwise. Add-On subscriptions provide access to additional
                    third-party benefits or services but do not grant any additional Entries into Promotional Draws.
                    Members may cancel an Add-On subscription at any time without cancelling their base Membership,
                    subject to the standard cancellation terms.
                </p>
            </>
        )
    },
    {
        heading: '28-day membership & billing cycle',
        body: (
            <>
                <p>
                    6.1 Unless otherwise expressly displayed, paid SLR Memberships operate on a recurring 28-day billing
                    cycle.
                </p>
                <p>
                    6.2 By purchasing a recurring paid Membership, the Member authorises SLR and its authorised payment
                    provider to process the applicable Membership fee against the nominated payment method every 28 days
                    until cancelled.
                </p>
                <p>
                    6.3 Payment processing may be provided by Stripe Australia, PayPal or another authorised payment
                    provider.
                </p>
                <p>
                    6.4 SLR does not ordinarily receive or store a Member&rsquo;s complete payment-card details where
                    those details are held securely by the applicable payment provider.
                </p>
                <p>
                    6.5 The Member is responsible for ensuring sufficient funds and a valid payment method are available
                    for scheduled payments.
                </p>
                <p>6.6 Membership remains active subject to successful payment and these Terms.</p>
                <p>
                    6.7 Where a Member holds both Red and Blue Memberships, each tier may be recorded and administered
                    separately within the same Member Account.
                </p>
            </>
        )
    },
    {
        heading: 'Failed or declined payments',
        body: (
            <>
                <p>
                    7.1 If a scheduled Membership payment fails or is declined, SLR or its payment provider may make
                    further reasonable attempts to process the payment.
                </p>
                <p>
                    7.2 During an unpaid or suspended period, SLR may temporarily suspend paid Membership benefits,
                    Entries, promotional eligibility, discount access, Partner benefits or other paid Membership
                    features.
                </p>
                <p>
                    7.3 A Member must satisfy the eligibility requirements stated in the applicable Promotion Schedule
                    at the relevant promotion closing time.
                </p>
                <p>
                    7.4 A failed, reversed, disputed, fraudulent or charge-backed payment may cause associated Entries
                    to be cancelled where permitted by law and the applicable Promotion Schedule.
                </p>
            </>
        )
    },
    {
        heading: 'Upgrades & downgrades',
        body: (
            <>
                <p>8.1 Members may be permitted to upgrade their Membership during an active Membership Cycle.</p>
                <p>
                    8.2 Any additional amount, Entry allocation or benefit applying to an upgrade will be displayed or
                    explained during the upgrade process.
                </p>
                <p>
                    8.3 Unless otherwise expressly stated, a downgrade takes effect from the beginning of the
                    Member&rsquo;s next Membership Cycle.
                </p>
                <p>
                    8.4 Changes to Membership level may affect future benefits, discounts, Entry allocations and
                    promotional eligibility.
                </p>
                <p>
                    8.5 Where a Member holds both Red and Blue Memberships, a change to one Membership does not
                    automatically change the other unless expressly stated.
                </p>
            </>
        )
    },
    {
        heading: 'Cancellation',
        body: (
            <>
                <p>
                    9.1 Members may cancel their recurring Membership through the method made available by SLR,
                    including the Member Account or official support channel.
                </p>
                <p>
                    9.2 Cancellation prevents the next recurring Membership payment from being processed, subject to
                    reasonable payment-processing cut-off requirements.
                </p>
                <p>
                    9.3 Unless otherwise required by law or stated by SLR, cancellation generally takes effect at the
                    end of the Member&rsquo;s current paid Membership Cycle.
                </p>
                <p>
                    9.4 The Member may continue to access applicable paid benefits until the effective cancellation date
                    unless the account has been suspended or terminated for a legitimate reason.
                </p>
                <p>
                    9.5 Where a Member holds both Red and Blue Memberships, cancellation of one Membership does not
                    automatically cancel the other unless the Member requests cancellation of both.
                </p>
                <p>9.6 Nothing in these Terms removes consumer rights which cannot lawfully be excluded.</p>
            </>
        )
    },
    {
        heading: 'Refunds & consumer rights',
        body: (
            <>
                <p>
                    10.1 Membership fees are generally not refundable merely because a Member changes their mind, does
                    not use available benefits or discounts, does not participate in a Promotional Draw, does not win a
                    prize, or does not use available SLR services.
                </p>
                <p>
                    10.2 This does not limit any refund, cancellation or other remedy a consumer is entitled to under
                    Australian Consumer Law.
                </p>
                <p>
                    10.3 Where SLR fails to provide a service to which a Member is legally entitled, statutory consumer
                    rights may apply.
                </p>
            </>
        )
    },
    {
        heading: 'Membership price changes',
        body: (
            <>
                <p>11.1 SLR may change Membership prices from time to time.</p>
                <p>
                    11.2 Where an existing recurring Member will be affected by a price increase, SLR will provide
                    reasonable notice where required by law before the changed price is charged.
                </p>
                <p>
                    11.3 A Member may cancel before an applicable future renewal if they do not wish to continue at the
                    revised price.
                </p>
            </>
        )
    },
    {
        heading: 'Member benefits',
        body: (
            <>
                <p>
                    12.1 SLR benefits may include discounts, Partner offers, lifestyle savings, community benefits,
                    digital services, promotions and other Member opportunities.
                </p>
                <p>
                    12.2 Benefits may depend upon Membership level, location, availability, Member eligibility, Partner
                    participation, campaign duration and stock or service availability.
                </p>
                <p>12.3 Benefits may be introduced, substituted, varied, suspended or withdrawn.</p>
                <p>
                    12.4 SLR does not guarantee that any particular third-party benefit will remain continuously
                    available.
                </p>
                <p>
                    12.5 Unless expressly stated, Member benefits do not have cash value and cannot be exchanged for
                    cash.
                </p>
            </>
        )
    },
    {
        heading: 'BENY & other third-party benefits',
        body: (
            <>
                <p>13.1 SLR may provide eligible Members with access to BENY or other third-party benefit programs.</p>
                <p>13.2 BENY and other third-party services are independently provided.</p>
                <p>13.3 Third-party terms, exclusions and conditions may apply.</p>
                <p>
                    13.4 SLR does not guarantee a particular saving, stock availability, merchant availability, booking
                    availability, third-party website availability or continued participation of an individual merchant.
                </p>
                <p>13.5 Any advertised saving should be read together with the applicable offer conditions.</p>
            </>
        )
    },
    {
        heading: 'Partner offers',
        body: (
            <>
                <p>14.1 SLR may advertise benefits supplied by independent businesses and service providers.</p>
                <p>14.2 Unless expressly stated otherwise, these businesses are independent from SLR.</p>
                <p>
                    14.3 Partner offers may be subject to separate terms, availability, pricing, booking requirements,
                    geographic limitations and expiry dates.
                </p>
                <p>
                    14.4 A dispute concerning the actual supply of a Partner&rsquo;s product or service should
                    ordinarily be addressed with that provider, without limiting any legal rights a Member may have
                    against SLR.
                </p>
            </>
        )
    },
    {
        heading: 'Spin Wheel feature',
        body: (
            <>
                <p>15.1 SLR may provide eligible Members with access to an optional Spin Wheel promotional feature.</p>
                <p>15.2 Participation is voluntary.</p>
                <p>
                    15.3 Available outcomes may include Membership reductions, promotional upgrades, bonus benefits,
                    additional Entries, special Member offers or other displayed outcomes.
                </p>
                <p>
                    15.4 Where a result successfully awards a stated monetary reduction, it will be applied to the
                    applicable SLR Membership amount or transaction identified at the time of the Spin.
                </p>
                <p>
                    15.5 A Spin Wheel reduction is not cash, cannot ordinarily be withdrawn or transferred, applies only
                    to the identified charge or transaction, cannot exceed that charge unless expressly stated, and must
                    be used under the displayed campaign conditions.
                </p>
                <p>
                    15.6 The outcome displayed and recorded by SLR&rsquo;s system determines the result, subject to
                    correction of an obvious technical error or malfunction.
                </p>
                <p>
                    15.7 SLR may suspend or void a transaction affected by system malfunction, fraud, manipulation,
                    unauthorised software, duplicate-account abuse or obvious technical error.
                </p>
                <p>
                    15.8 SLR may introduce, vary, suspend or discontinue Spin Wheel campaigns subject to applicable law.
                </p>
            </>
        )
    },
    {
        heading: 'Referral, tag & promotional codes',
        body: (
            <>
                <p>
                    16.1 SLR may offer referral codes, tag-a-friend promotions, upgrade codes or other promotional
                    codes.
                </p>
                <p>16.2 Specific conditions may apply to each campaign.</p>
                <p>
                    16.3 Codes may expire, be limited to one use, be non-transferable, apply only to particular
                    Membership levels, and be invalidated where obtained through fraud, manipulation or misuse.
                </p>
            </>
        )
    },
    {
        heading: 'General promotional draw rules',
        body: (
            <>
                <p>
                    17.1 SLR may conduct daily, weekly, monthly, bonus and special Promotional Draws and other
                    promotional campaigns.
                </p>
                <p>
                    17.2 Each Promotional Draw may constitute a separate promotion and may have its own Promotion
                    Schedule.
                </p>
                <p>
                    17.3 The applicable Promotion Schedule should identify, where relevant, the Promoter, promotion
                    period, opening and closing times, eligible jurisdictions, age requirements, entry method and
                    allocation, prizes and values, draw date and method, notification and publication requirements,
                    claim and unclaimed-prize processes, permit or authority number, and any other legally required
                    conditions.
                </p>
                <p>17.4 Participation in a promotion does not guarantee a prize.</p>
            </>
        )
    },
    {
        heading: 'Weekly draw schedule',
        body: (
            <>
                <p>
                    18.1 Unless a Promotion Schedule states otherwise, SLR intends to conduct regular weekly Promotional
                    Draws every Friday at approximately 7:30 PM AEST/AEDT, as applicable in Victoria.
                </p>
                <p>
                    18.2 The applicable entry closing time will be specified on the SLR website or in the relevant
                    Promotion Schedule.
                </p>
                <p>
                    18.3 A draw may be postponed or rescheduled where reasonably necessary because of technical failure,
                    public-holiday arrangements, regulatory requirements, force majeure, system interruption or other
                    circumstances reasonably outside SLR&rsquo;s control, subject to applicable law.
                </p>
                <p>18.4 Where a Promotion Schedule contains a different draw time or date, that Schedule applies.</p>
                <p>
                    The{' '}
                    <Link href='/giveaway-rules' className='text-[#FFDC75] hover:underline'>
                        Competition Rules
                    </Link>{' '}
                    for the current cycle set entry close at 6:30 PM AEST and the draw at 8:00 PM AEST each Friday.
                </p>
            </>
        )
    },
    {
        heading: 'Daily, monthly & special draws',
        body: (
            <>
                <p>19.1 SLR may conduct daily, monthly and special Promotional Draws.</p>
                <p>
                    19.2 Relevant dates, periods, prizes, eligibility criteria and other conditions will be published
                    with the applicable promotion.
                </p>
                <p>
                    19.3 A Member&rsquo;s 28-day billing cycle is separate from individual Promotional Draw schedules
                    unless expressly stated otherwise.
                </p>
                <Sub>19.4 Nationwide and state-based draws</Sub>
                <p>
                    Unless expressly stated otherwise in a specific Promotion Schedule, SLR operates its Red and Blue
                    tier draws as a single, nationwide pool across all eligible and participating States and
                    Territories. While SLR may use state-specific labelling (e.g., &lsquo;VIC Draw&rsquo;) during
                    registration or marketing for administrative purposes or future expansion, this does not isolate the
                    prize pool to that specific state. SLR reserves the right to introduce strictly state-based draws in
                    the future; where a draw is exclusively isolated to residents of a specific state, this will be
                    clearly outlined in the applicable Promotion Schedule.
                </p>
            </>
        )
    },
    {
        heading: 'Prize information & prize pools',
        body: (
            <>
                <p>
                    20.1 SLR reserves the right to update, modify, or change current and upcoming prizes at any time,
                    subject to applicable regulatory requirements. Members are responsible for checking the SLR website
                    to view the latest and most up-to-date prize information.
                </p>
                <p>
                    20.2 The website or applicable Promotion Schedule may specify the number and description of prizes,
                    values, Prize Pool, draw dates, eligibility, relevant Membership categories, claim requirements and
                    other promotion information.
                </p>
                <p>
                    20.3 Members should refer to the SLR website for the current prize structure applicable to a
                    particular promotion.
                </p>
                <p>
                    20.4 Promotional advertising must be read together with the applicable Promotion Schedule and these
                    Terms.
                </p>
                <p>
                    20.5 Combined SLR Prize Pool — SLR may advertise an overall Promotional Prize Pool representing the
                    combined value of prizes across eligible Red and Blue promotional categories, including Red Member
                    promotions, Blue Member promotions, promotions available to both tiers, daily, weekly and monthly
                    Promotional Draws, Bonus Draws and Special Promotions.
                </p>
                <p>
                    20.6 Unless expressly stated otherwise, an overall Prize Pool does not mean every Member or
                    Membership category is eligible for every individual prize.
                </p>
                <p>
                    20.7 Eligibility for each prize and Promotional Draw is determined by the applicable Promotion
                    Schedule.
                </p>
                <p>
                    20.8 Where SLR advertises a Prize Pool specifically for Red, Blue or another particular promotion,
                    only identified prizes are included unless expressly stated otherwise.
                </p>
                <p>
                    20.9 Where an advertised amount combines Red and Blue prizes, SLR may describe it as an overall or
                    combined SLR Prize Pool.
                </p>
                <Sub>20.10 Dynamic prize pools</Sub>
                <p>
                    Where SLR advertises a total prize pool or maximum prize pool that is conditional on achieving
                    certain membership milestones (e.g., &ldquo;$24,000 per 28-day cycle based on 2,000 active
                    members&rdquo;), the actual prize pool awarded will dynamically scale in proportion to the number of
                    active eligible Members during the promotional period. The specific scaling structure and membership
                    thresholds will be published on the SLR website. If the required minimum active membership threshold
                    is not met, the prize pool will be reduced in accordance with the published schedule. By
                    participating, Members acknowledge that the actual total prize pool may be lower than the maximum
                    advertised pool if the active membership target is not reached.
                </p>
                <Sub>20.11 Membership milestone bonuses</Sub>
                <p>
                    SLR may advertise special bonus prizes (e.g., a &ldquo;{GRAND_BONUS.red}&rdquo;) that are
                    exclusively triggered when a specific membership growth milestone is reached (e.g.,{' '}
                    {GRAND_BONUS.membersCount} active new Members). These milestone bonuses are contingent on SLR
                    verifying that the active, paid membership count has successfully reached the required threshold
                    during the specified promotional period. Once the milestone is validated by SLR, the bonus prize
                    will be added to the applicable Promotional Draw pool and awarded in accordance with the standard
                    draw procedures. If the membership milestone is not reached, the bonus prize will not be awarded.
                </p>
            </>
        )
    },
    {
        heading: 'Entry allocation',
        body: (
            <>
                <p>
                    21.1 The applicable Promotion Schedule will explain how Entries are allocated and used in a
                    Promotional Draw.
                </p>
                <p>
                    21.2 SLR&rsquo;s intended principle is that the advertised Entry allocation is the genuine
                    promotional participation allocation described by SLR.
                </p>
                <p>
                    21.3 SLR does not inflate or multiply an Entry after allocation except where a specific promotion
                    expressly provides additional Entries.
                </p>
                <p>21.4 Entries may only be issued to persons satisfying the applicable eligibility requirements.</p>
                <p>
                    21.5 Entries associated with fraudulent transactions, refunded transactions, reversed payments,
                    chargebacks, duplicate or manipulated accounts or other invalid activity may be cancelled to the
                    extent permitted by law and the applicable Promotion Schedule.
                </p>
                <p>
                    21.6 Where a Member legitimately holds both Red and Blue Memberships within one Member Account,
                    eligible Entries attributable to each tier may be separately recorded and applied under the
                    applicable Promotion Schedule.
                </p>
            </>
        )
    },
    {
        number: 23,
        heading: 'Draw method & independent systems',
        body: (
            <>
                <p>
                    23.1 Promotional Draws may be administered through TPAL Australia, an approved electronic
                    random-draw system, independent promotional software, independent draw administrators or another
                    lawful method specified in the Promotion Schedule.
                </p>
                <p>
                    23.2 Where applicable, SLR may use these systems for random winner selection, audit records, Entry
                    verification, draw reporting, compliance records and winner verification.
                </p>
                <p>
                    23.3 SLR may retain appropriate draw and audit records in accordance with applicable legal and
                    operational requirements.
                </p>
                <p>
                    23.4 In its early stages, SLR may utilise its own proprietary, provably fair random draw engine. All
                    SLR draw announcements are audited in accordance with certified trade promotion standards and
                    utilise cryptographic SHA-256 verification to ensure transparency and fairness.
                </p>
            </>
        )
    },
    {
        number: 24,
        heading: 'Fair chance',
        body: (
            <>
                <p>
                    24.1 Unless a Promotion Schedule expressly provides otherwise, each valid Entry in the applicable
                    random Promotional Draw has an equal chance of being selected.
                </p>
                <p>
                    24.2 Holding more than one valid Entry may increase a participant&rsquo;s chances but does not
                    guarantee a win.
                </p>
                <p>24.3 No skill is required for a game-of-chance promotion unless expressly identified otherwise.</p>
            </>
        )
    },
    {
        number: 25,
        heading: 'Promotion eligibility',
        body: (
            <>
                <p>25.1 Eligibility is determined by the applicable Promotion Schedule.</p>
                <p>
                    25.2 Eligibility may require the participant to be 18 or older, reside in Australia and an eligible
                    jurisdiction, hold a valid account and active eligible Membership, have successful payment status
                    where applicable, and comply with the Promotion Schedule.
                </p>
                <p>
                    25.3 Directors, employees and contractors directly involved in administering a promotion, and their
                    immediate families, may be excluded where specified by the Promotion Schedule or applicable law.
                </p>
            </>
        )
    },
    {
        number: 26,
        heading: 'State & territory requirements',
        body: (
            <>
                <p>26.1 Promotional Draws may be subject to different regulatory requirements throughout Australia.</p>
                <p>
                    26.2 SLR may restrict a promotion to specified jurisdictions, obtain permits or approvals, modify a
                    Promotion Schedule, exclude a jurisdiction where legally necessary, or conduct separate state or
                    territory promotions.
                </p>
                <p>
                    26.3 Applicable geographic restrictions and permit or authority information will be stated in the
                    relevant Promotion Schedule where required.
                </p>
                <p>
                    26.4 SLR will conduct Promotional Draws subject to applicable laws and regulatory requirements in
                    each relevant jurisdiction.
                </p>
            </>
        )
    },
    {
        number: 27,
        heading: 'Winner selection',
        body: (
            <>
                <p>27.1 Winners will be selected in accordance with the applicable Promotion Schedule.</p>
                <p>27.2 SLR may select reserve winners where permitted and appropriate.</p>
                <p>27.3 SLR may verify a selected winner before awarding a prize.</p>
                <p>
                    27.4 Verification may include identity, age, residential address, state eligibility, Membership
                    status, Entry validity, payment status and bank-account ownership for a cash payment.
                </p>
                <p>
                    27.5 A participant who fails eligibility verification may be disqualified where permitted by law and
                    the Promotion Schedule.
                </p>
            </>
        )
    },
    {
        number: 28,
        heading: 'Winner notification & publication',
        body: (
            <>
                <p>
                    28.1 Winners may be notified by email, SMS, telephone, Member Account, SLR website, SLR social-media
                    account or another method identified in the Promotion Schedule.
                </p>
                <p>
                    28.2 Winner names or other identifying information may be published where required by law or with
                    appropriate authority.
                </p>
                <p>28.3 Members are responsible for keeping their contact details current.</p>
            </>
        )
    },
    {
        number: 29,
        heading: 'Unclaimed prizes & redraws',
        body: (
            <>
                <p>29.1 Prize claim periods will be identified in the relevant Promotion Schedule where required.</p>
                <p>
                    29.2 Where a prize remains unclaimed, cannot be awarded or a selected entrant is ineligible, SLR may
                    conduct a redraw or use a reserve winner only in accordance with the Promotion Schedule and
                    applicable law.
                </p>
                <p>29.3 Mandatory notification, publication and redraw requirements will be followed.</p>
            </>
        )
    },
    {
        number: 30,
        heading: 'Prize conditions',
        body: (
            <>
                <p>30.1 Prizes must be accepted in accordance with the applicable Promotion Schedule.</p>
                <p>30.2 Cash prizes will be paid by the method specified by SLR after eligibility verification.</p>
                <p>
                    30.3 Unless expressly stated otherwise, a non-cash prize is not redeemable for cash, is not
                    transferable, must be accepted as awarded and may be subject to supplier terms.
                </p>
                <p>
                    30.4 Where permitted by law and reasonably necessary, SLR may substitute an unavailable prize with
                    one of equivalent or greater value, subject to required regulatory approval.
                </p>
                <p>30.5 Prize values are expressed in Australian dollars unless stated otherwise.</p>
                <p>
                    30.6 Prize values may be based on recommended or market values available when the promotion is
                    published.
                </p>
            </>
        )
    },
    {
        number: 31,
        heading: 'Odds & transparency',
        body: (
            <>
                <p>
                    31.1 SLR may publish indicative or actual promotional odds based on the relevant promotion structure
                    and valid participation numbers.
                </p>
                <p>
                    31.2 Published odds must be read together with the applicable number of valid Members or Entries,
                    relevant Membership or promotion assumptions, promotion duration and Promotion Schedule.
                </p>
                <p>
                    31.3 Actual odds may change where the number of eligible Members or Entries changes, unless SLR has
                    expressly capped or fixed the relevant pool.
                </p>
                <Sub>31.4 Odds based on Red and Blue tiers</Sub>
                <p>
                    Where SLR publishes promotional odds or probabilities, those figures will be based on the applicable
                    Red and Blue Membership tiers using the stated number of eligible Members, valid Entries, prizes and
                    Promotional Draws during the stated promotional period. The calculation may take into account
                    whether a Member holds Red Membership, Blue Membership or both; the number of valid Entries
                    allocated through each Membership tier; the number and frequency of prizes; the applicable
                    calculation period; and whether an eligible Member may win more than once during that period. Unless
                    expressly stated otherwise, published combined odds apply across the eligible Red and Blue
                    Membership tiers. They do not mean every Member has the same number of Entries or is eligible for
                    every individual prize or Promotional Draw. The assumptions and calculation method used for
                    published odds will be made available by SLR and must be read together with the applicable Promotion
                    Schedule.
                </p>
                <p>
                    31.5 Odds relating only to a particular tier, draw or promotional category apply only to the
                    identified eligible pool.
                </p>
                <p>
                    31.6 SLR will not intentionally make misleading representations about its services, benefits, odds,
                    Prize Pools or promotions.
                </p>
                <Sub>31.7 Milestone projections, not caps</Sub>
                <p>
                    Where SLR promotional material references a &ldquo;capped&rdquo; number of members in relation to a
                    specific dynamic prize pool milestone (e.g., &ldquo;{membersCap}&rdquo; for a {pool} pool), this
                    refers strictly to the active membership threshold at which that specific prize pool structure
                    applies. It does not mean the total draw pool is isolated or restricted to that number of members.
                    All members remain in a single combined draw pool (separated by tier as applicable). When active
                    membership exceeds the current threshold, SLR will progress to the next advertised milestone and
                    prize pool structure.
                </p>
            </>
        )
    },
    {
        number: 32,
        heading: 'Fraud, manipulation & disqualification',
        body: (
            <>
                <p>
                    32.1 SLR may investigate activity reasonably appearing to involve fraud, false information,
                    multiple-account abuse, automated Entries, payment fraud, chargeback abuse, Spin Wheel manipulation,
                    Entry manipulation, system interference or other dishonest conduct.
                </p>
                <p>
                    32.2 Subject to applicable law, SLR may suspend the account, remove invalid Entries, disqualify
                    invalid Entries, cancel affected promotional benefits or terminate Membership for a material breach.
                </p>
                <p>
                    32.3 Genuine consumer disputes or lawful chargebacks will not automatically be treated as fraud
                    merely because a Member exercises a legal right.
                </p>
            </>
        )
    },
    {
        number: 33,
        heading: 'Member conduct',
        body: (
            <p>
                Members must not harass, threaten or abuse others through SLR; provide deliberately false information;
                misuse Member benefits; manipulate promotions; attempt unauthorised access; interfere with platform
                security; introduce malicious software; impersonate another person; or use SLR for unlawful purposes.
            </p>
        )
    },
    {
        number: 34,
        heading: 'Website & digital services',
        body: (
            <>
                <p>34.1 SLR may provide websites, Member portals, applications and other digital services.</p>
                <p>
                    34.2 SLR will take reasonable steps to maintain its systems but does not guarantee digital services
                    will always be uninterrupted or error-free.
                </p>
                <p>
                    34.3 Access may be interrupted for maintenance, security, updates, technical failures, internet
                    outages or third-party service interruptions.
                </p>
                <p>34.4 Nothing in this clause removes rights that cannot legally be excluded.</p>
                <Sub>34.5 E-books and digital offers</Sub>
                <p>
                    SLR may provide Members with access to e-books, guides, digital downloads, and other educational or
                    promotional digital content (&ldquo;Digital Offers&rdquo;). Such Digital Offers are provided for
                    general informational or entertainment purposes only and do not constitute professional, financial,
                    or legal advice. SLR does not guarantee the accuracy, completeness, or suitability of the
                    information contained within these Digital Offers.
                </p>
            </>
        )
    },
    {
        number: 35,
        heading: 'Community support information',
        body: (
            <>
                <p>
                    35.1 SLR may publish information about independent community, emergency, health, legal, housing,
                    food-support or charitable organisations.
                </p>
                <p>
                    35.2 Unless expressly stated otherwise, SLR does not provide those services and is not affiliated
                    with or endorsed by a listed organisation merely because its publicly available contact information
                    appears on the SLR website.
                </p>
                <p>
                    35.3 Community information is provided to help connect Australians with independent support
                    organisations.
                </p>
                <p>35.4 Users should contact the relevant organisation directly regarding its services.</p>
            </>
        )
    },
    {
        number: 36,
        heading: 'Community & charitable initiatives',
        body: (
            <>
                <p>
                    36.1 SLR may support independent charitable or community organisations through donations,
                    fundraising initiatives, promotion or community campaigns.
                </p>
                <p>36.2 SLR will not represent itself as an official Partner of an organisation unless authorised.</p>
                <p>
                    36.3 Where SLR conducts fundraising subject to separate regulatory obligations, applicable
                    disclosures and requirements apply.
                </p>
            </>
        )
    },
    {
        number: 37,
        heading: 'Marketing, SMS & email',
        body: (
            <>
                <p>
                    37.1 SLR may send operational communications relating to Membership, account administration,
                    payments, draws, prize notifications, security and service information.
                </p>
                <p>
                    37.2 SLR may send marketing or promotional messages where it has a lawful basis and required
                    consent.
                </p>
                <p>
                    37.3 Commercial electronic messages will include appropriate sender identification and an
                    unsubscribe mechanism where required.
                </p>
                <p>
                    37.4 A person may withdraw marketing consent using the unsubscribe facility or another permitted
                    method.
                </p>
            </>
        )
    },
    {
        number: 38,
        heading: 'Privacy & personal information',
        body: (
            <>
                <p>
                    38.1 SLR may collect name, date of birth or age-verification information, address, email, telephone
                    number, Membership information, transaction references, promotional participation,
                    winner-verification information and communications with SLR.
                </p>
                <p>
                    38.2 Information may be used for account and Membership administration, payment processing,
                    promotion administration, winner verification, fraud prevention, customer support, permitted
                    marketing, regulatory compliance and business operations.
                </p>
                <p>
                    38.3 SLR may use third parties including Stripe, PayPal, TPAL Australia, hosting, SMS, email and
                    analytics providers, and other operational service providers.
                </p>
                <p>
                    38.4 Personal information will be handled in accordance with SLR&rsquo;s{' '}
                    <Link href='/privacy' className='text-[#FFDC75] hover:underline'>
                        Privacy Policy
                    </Link>{' '}
                    and applicable privacy laws.
                </p>
            </>
        )
    },
    {
        number: 39,
        heading: 'Intellectual property',
        body: (
            <>
                <p>
                    39.1 Unless otherwise stated, SLR owns or is authorised to use intellectual property on the SLR
                    platform, including branding, logos, artwork, graphics, written content, videos, promotional
                    concepts, website materials, software and other original material.
                </p>
                <p>39.2 Membership does not transfer ownership of SLR intellectual property.</p>
                <p>
                    39.3 Members receive only a limited personal right to use SLR services in accordance with these
                    Terms.
                </p>
                <p>
                    39.4 SLR material must not be reproduced or commercially exploited without permission except where
                    permitted by law.
                </p>
            </>
        )
    },
    {
        number: 40,
        heading: 'Social media platform disclaimer',
        body: (
            <>
                <p>
                    40.1 Unless expressly stated otherwise, an SLR promotion is not sponsored, endorsed, administered by
                    or associated with Facebook, Instagram, Meta, TikTok, YouTube, Google, Apple or another platform
                    merely because it is advertised there.
                </p>
                <p>
                    40.2 Participants release such platforms only to the extent permitted by the applicable promotion
                    rules and law.
                </p>
            </>
        )
    },
    {
        number: 41,
        heading: 'Termination & suspension',
        body: (
            <>
                <p>41.1 A Member may cancel their Membership in accordance with these Terms.</p>
                <p>
                    41.2 SLR may reasonably suspend or terminate an account where Membership fees remain unpaid, fraud
                    is reasonably suspected, these Terms are materially breached, promotions are manipulated, benefits
                    are deliberately misused, unlawful conduct occurs, or suspension or termination is required by law.
                </p>
                <p>
                    41.3 SLR will exercise contractual powers subject to Australian Consumer Law and other applicable
                    laws.
                </p>
                <p>41.4 Termination does not remove rights or obligations accrued before termination.</p>
            </>
        )
    },
    {
        number: 42,
        heading: 'Limitation of liability',
        body: (
            <>
                <p>
                    42.1 Nothing in these Terms excludes, restricts or modifies any consumer guarantee, right or remedy
                    which cannot lawfully be excluded.
                </p>
                <p>
                    42.2 To the maximum extent permitted by law, SLR is not responsible for loss caused solely by
                    matters outside its reasonable control, including third-party platform outages, telecommunications
                    interruptions, Partner failures, supplier delays, unauthorised account access caused by a Member
                    failing to secure credentials, or force majeure.
                </p>
                <p>42.3 Any exclusion or limitation applies only to the extent legally permitted.</p>
            </>
        )
    },
    {
        number: 43,
        heading: 'Changes to membership benefits',
        body: (
            <>
                <p>
                    43.1 SLR may introduce, modify, substitute or discontinue Member benefits where reasonably
                    necessary.
                </p>
                <p>
                    43.2 SLR will not use this provision to avoid providing a material paid service already owed to a
                    Member contrary to Australian Consumer Law.
                </p>
                <p>
                    43.3 Where a material change affects an ongoing recurring paid Membership, reasonable notice will be
                    provided where required.
                </p>
            </>
        )
    },
    {
        number: 44,
        heading: 'Changes to these terms',
        body: (
            <>
                <p>
                    44.1 SLR may update these Terms where reasonably necessary because of business changes, new
                    services, regulatory changes, new promotions, technology changes or legal requirements.
                </p>
                <p>44.2 Updated Terms will be published on the SLR website.</p>
                <p>44.3 Material changes affecting existing Members will be notified where required by law.</p>
                <p>44.4 Changes will not retrospectively remove accrued statutory rights.</p>
            </>
        )
    },
    {
        number: 45,
        heading: 'Australian Consumer Law',
        body: (
            <>
                <p>
                    45.1 Nothing in these Terms is intended to exclude, restrict or modify a right, guarantee or remedy
                    that cannot legally be excluded under Australian Consumer Law.
                </p>
                <p>
                    45.2 Where these Terms conflict with a mandatory consumer right, the mandatory legal right prevails.
                </p>
            </>
        )
    },
    {
        number: 46,
        heading: 'Governing law',
        body: (
            <>
                <p>46.1 These General Terms are governed by the laws applicable in Victoria, Australia.</p>
                <p>
                    46.2 Subject to any rights a consumer may have to bring proceedings elsewhere, the parties submit to
                    the jurisdiction of the courts and tribunals having jurisdiction in Victoria.
                </p>
            </>
        )
    },
    {
        number: 47,
        heading: 'Promotion schedules',
        body: (
            <>
                <p>
                    47.1 SLR may publish separate Promotion Schedules for daily, weekly and monthly Member Draws, Bonus
                    Promotions and Special Promotions.
                </p>
                <p>47.2 Each Promotion Schedule forms part of the SLR Terms &amp; Conditions.</p>
                <p>
                    47.3 The specific Promotion Schedule prevails over these General Terms concerning the mechanics of
                    that individual promotion to the extent of any inconsistency.
                </p>
            </>
        )
    },
    {
        number: 48,
        heading: 'Complaints & dispute resolution',
        body: (
            <>
                <p>48.1 SLR is committed to resolving genuine member concerns quickly and fairly.</p>
                <p>
                    48.2 Before escalating any dispute, complaint, or claim (including those relating to promotional
                    draws, entries, or billing) to an external regulator, tribunal, or court, the Member agrees to first
                    contact SLR Customer Support via the contact details provided in these Terms.
                </p>
                <p>
                    48.3 The Member must provide full details of the dispute and allow SLR a reasonable period (not less
                    than 14 days) to investigate and attempt to resolve the issue in good faith.
                </p>
                <p>
                    48.4 Nothing in this clause prevents a Member from exercising their mandatory rights under
                    Australian Consumer Law or applicable state/territory trade promotion laws.
                </p>
            </>
        )
    },
    {
        number: 49,
        heading: 'Contact',
        body: (
            <LegalContactCard title='Smart Life Rewards (SLR)'>
                <p className='mt-1'>
                    SLR Life Pty Ltd
                    <br />
                    ABN 99 696 467 473
                    <br />
                    Australia
                </p>
                <p className='mt-2'>
                    Email: <MailLink />
                    <br />
                    Support &amp; contact: apply online via the{' '}
                    <Link href='/contact' className='text-[#FFDC75] hover:underline'>
                        Smart Life Rewards contact page
                    </Link>
                    .
                </p>
            </LegalContactCard>
        )
    }
];

const TermsPage = async () => {
    const [pricing, content] = await Promise.all([
        getTierPricing(),
        getPublicPrizeContent().catch(() => null as PrizeContent | null)
    ]);
    const pool = poolLabel(content?.prize_pool_headline, FALLBACK_POOL);
    const membersCap = membersCapLabel(content?.stage_label) ?? FALLBACK_CAP;

    return (
        <>
            <PageHero
                eyebrow='Legal'
                title='Terms & Conditions'
                description='Membership, benefits and promotional draw terms.'
            />
            <LegalDoc
                lastUpdated='2 September 2026'
                intro={
                    <>
                        <p>
                            Issued by SLR Life Pty Ltd trading as Smart Life Rewards (SLR), Australia. ABN 99 696 467
                            473.
                        </p>
                        <p className='mt-3'>
                            Website: smartliferewards.com.au &middot; Email: <MailLink />
                        </p>
                        <p className='mt-3'>
                            These Terms cover Membership, benefits and promotional draw terms. They must be read
                            together with the{' '}
                            <Link href='/giveaway-rules' className='text-[#FFDC75] hover:underline'>
                                Competition Rules
                            </Link>{' '}
                            and the{' '}
                            <Link href='/privacy' className='text-[#FFDC75] hover:underline'>
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </>
                }
                sections={buildSections(pricing, pool, membersCap)}
            />
        </>
    );
};

export default TermsPage;
