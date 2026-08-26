import { Metadata } from 'next';
import Link from 'next/link';

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

const sections: LegalSection[] = [
    {
        heading: 'About Smart Life Rewards',
        body: (
            <>
                <p>1.1 Smart Life Rewards (&ldquo;SLR&rdquo;) is operated by SLR Life Pty Ltd.</p>
                <p>1.2 SLR operates as a membership, savings and rewards platform.</p>
                <p>1.3 Membership may provide access to benefits including:</p>
                <List
                    items={[
                        'Member and partner discounts;',
                        'Lifestyle savings;',
                        'Member benefits;',
                        'Promotional rewards;',
                        'Promotional draws;',
                        'Free Visitor opportunities;',
                        'Grocery-related rewards;',
                        'Digital Member services;',
                        'Spin Wheel promotions;',
                        'Referral, tag-a-friend and promotional codes;',
                        'Community initiatives;',
                        'Local business offers;',
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
                    means a registered person participating in the SLR platform, including an eligible Visitor, Red
                    Member or Blue Member where applicable.
                </Term>
                <Term term='Visitor'>means a person registered for a free SLR Visitor Membership.</Term>
                <Term term='Paid Member'>means a Member holding an active paid SLR Membership.</Term>
                <Term term='Member Account'>
                    means the single personal SLR account established for an individual and identified by the
                    Member&rsquo;s registered details and unique SLR Member ID.
                </Term>
                <Term term='Membership Cycle'>
                    means the applicable 28-day recurring Membership period, unless another period is expressly
                    displayed at the time of purchase.
                </Term>
                <Term term='Token'>
                    means a promotional participation allocation associated with an eligible SLR Membership level or
                    promotional activity. Where a Promotion Schedule provides that Tokens are used for participation in
                    a Promotional Draw, each eligible Token represents the promotional entry or chance specified in that
                    Promotion Schedule.
                </Term>
                <p>Tokens:</p>
                <List
                    items={[
                        'Have no independent cash value;',
                        'Cannot ordinarily be sold or transferred;',
                        'Cannot be redeemed for cash; and',
                        'May only be used in accordance with applicable SLR promotion rules.'
                    ]}
                />
                <Term term='Promotional Draw'>
                    means an SLR daily, weekly, monthly, Visitor, bonus or special promotional game-of-chance activity.
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
        heading: 'Acceptance of Terms',
        body: (
            <>
                <p>3.1 These Terms apply to SLR Visitors, Members, account holders and promotional participants.</p>
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
                    a particular Promotional Draw, the Promotion Schedule will apply to that promotion to the extent of
                    the inconsistency, subject to applicable law.
                </p>
            </>
        )
    },
    {
        heading: 'Membership eligibility',
        body: (
            <>
                <p>
                    4.1 Paid SLR Membership and paid-member Promotional Draw participation is intended for persons aged
                    18 years or older, unless expressly stated otherwise.
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
                <p>4.4 SLR may request reasonable evidence of:</p>
                <List
                    items={[
                        'Identity;',
                        'Age;',
                        'Residential address;',
                        'Membership status; or',
                        'Other eligibility information.'
                    ]}
                />
                <p>
                    4.5 Membership accounts are personal and must not be sold, transferred, shared or assigned without
                    SLR&rsquo;s written approval.
                </p>
                <p>4.6 Members are responsible for maintaining the security of their account and login credentials.</p>
            </>
        )
    },
    {
        heading: 'SLR Membership levels',
        body: (
            <>
                <p>SLR may currently offer the following Membership structures.</p>

                <Sub>5.1 Visitor Membership</Sub>
                <p>Visitor Membership is free and may provide selected:</p>
                <List
                    items={[
                        'Website access;',
                        'Member information;',
                        'Partner or community information;',
                        'Visitor promotions;',
                        'Grocery-related promotional opportunities;',
                        'Free promotional campaigns; and',
                        'Other Visitor benefits specified by SLR.'
                    ]}
                />
                <p>Visitor benefits may differ from paid-member benefits.</p>

                <Sub>5.2 Red Membership</Sub>
                <p>Current Red Membership options may include:</p>
                <List items={['$10 – 1 Token', '$20 – 4 Tokens', '$30 – 7 Tokens']} />

                <Sub>5.3 Blue Membership</Sub>
                <p>Current Blue Membership options may include:</p>
                <List items={['$26 – 1 Token', '$52 – 4 Tokens', '$78 – 7 Tokens', '$99 – 10 Tokens']} />

                <p>
                    5.4 Current Membership prices, inclusions and benefits displayed on the SLR website at the time of
                    purchase form part of the applicable Membership offering.
                </p>
                <p>
                    5.5 Membership structures, benefits and prices may be changed from time to time subject to these
                    Terms and applicable law.
                </p>

                <Sub>5.6 One person = one SLR Member Account</Sub>
                <p>5.6.1 One person may hold one personal SLR Member Account.</p>
                <p>5.6.2 The Member Account may be identified through the Member&rsquo;s:</p>
                <List items={['Registered email address;', 'Registered mobile number; and', 'Unique SLR Member ID.']} />
                <p>5.6.3 Subject to eligibility, the same SLR Member Account may hold:</p>
                <List
                    items={[
                        'Red Membership only;',
                        'Blue Membership only; or',
                        'Red Membership and Blue Membership concurrently.'
                    ]}
                />
                <p>
                    5.6.4 A Member does not need to create a second SLR account or use a second email address merely to
                    participate in both Red and Blue Memberships.
                </p>
                <p>
                    5.6.5 Where a Member holds both Red and Blue Memberships, SLR will record each tier separately where
                    applicable for:
                </p>
                <List
                    items={[
                        'Membership status;',
                        'Payments and billing;',
                        'Entries and Tokens;',
                        'Promotional Draw eligibility;',
                        'Tier-specific benefits; and',
                        'Other Membership entitlements.'
                    ]}
                />
                <p>
                    5.6.6 A person holding both Red and Blue Memberships remains one individual SLR Member for the
                    purpose of SLR&rsquo;s unique Member count, unless a published figure expressly measures
                    Memberships, tier participation, Tokens or entries instead of individual people.
                </p>
            </>
        )
    },
    {
        heading: '28-day Membership & billing cycle',
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
                <p>7.2 During an unpaid or suspended period, SLR may temporarily suspend:</p>
                <List
                    items={[
                        'Paid Membership benefits;',
                        'Tokens;',
                        'Paid-member promotional eligibility;',
                        'Discount access;',
                        'Partner benefits; or',
                        'Other paid Membership features.'
                    ]}
                />
                <p>
                    7.3 A Member must satisfy the eligibility requirements stated in the applicable Promotion Schedule
                    at the relevant promotion closing time.
                </p>
                <p>
                    7.4 A failed, reversed, disputed, fraudulent or charge-backed payment may cause associated
                    promotional allocations to be cancelled where permitted by law and the applicable Promotion
                    Schedule.
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
                    8.2 Any additional amount, allocation or benefit applying to an upgrade will be displayed or
                    explained during the upgrade process.
                </p>
                <p>
                    8.3 Unless otherwise expressly stated, a downgrade will take effect from the beginning of the
                    Member&rsquo;s next Membership Cycle.
                </p>
                <p>8.4 Changes to Membership level may affect future:</p>
                <List items={['Benefits;', 'Discounts;', 'Token allocations; and', 'Promotional eligibility.']} />
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
                <p>10.1 Membership fees are generally not refundable merely because a Member:</p>
                <List
                    items={[
                        'Changes their mind;',
                        'Does not use available benefits;',
                        'Does not use discounts;',
                        'Does not participate in a Promotional Draw;',
                        'Does not win a prize; or',
                        'Does not use available SLR services.'
                    ]}
                />
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
                <p>12.2 Benefits may depend upon:</p>
                <List
                    items={[
                        'Membership level;',
                        'Location;',
                        'Availability;',
                        'Member eligibility;',
                        'Partner participation;',
                        'Campaign duration; and',
                        'Stock or service availability.'
                    ]}
                />
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
                <p>13.4 SLR does not guarantee:</p>
                <List
                    items={[
                        'A particular saving;',
                        'Stock availability;',
                        'Merchant availability;',
                        'Booking availability;',
                        'Third-party website availability; or',
                        'Continued participation of an individual merchant.'
                    ]}
                />
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
                <p>14.3 Partner offers may be subject to separate:</p>
                <List
                    items={[
                        'Terms;',
                        'Availability;',
                        'Pricing;',
                        'Booking requirements;',
                        'Geographic limitations; and',
                        'Expiry dates.'
                    ]}
                />
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
                <p>15.2 Participation in the Spin Wheel is voluntary.</p>
                <p>15.3 Available Spin Wheel outcomes may include:</p>
                <List
                    items={[
                        'Membership reductions;',
                        'Promotional upgrades;',
                        'Bonus benefits;',
                        'Promotional allocations;',
                        'Special Member offers; or',
                        'Other displayed outcomes.'
                    ]}
                />
                <p>
                    15.4 Where a Spin Wheel result successfully awards a stated monetary reduction, the stated reduction
                    will be applied to the applicable SLR Membership amount or transaction identified at the time of the
                    Spin.
                </p>
                <p>15.5 A Spin Wheel reduction:</p>
                <List
                    items={[
                        'Is not cash;',
                        'Cannot ordinarily be withdrawn or transferred;',
                        'Applies only to the Membership charge or transaction to which it relates;',
                        'Cannot exceed the applicable charge unless SLR expressly states otherwise; and',
                        'Must be used in accordance with the conditions displayed for that Spin Wheel campaign.'
                    ]}
                />
                <p>
                    15.6 The outcome displayed and recorded by SLR&rsquo;s system will be used to determine the
                    promotional result, subject to correction of an obvious technical error or malfunction.
                </p>
                <p>15.7 SLR may suspend or void a Spin Wheel transaction affected by:</p>
                <List
                    items={[
                        'System malfunction;',
                        'Fraud;',
                        'Manipulation;',
                        'Unauthorised software;',
                        'Duplicate-account abuse; or',
                        'An obvious technical error.'
                    ]}
                />
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
                <p>16.3 Codes:</p>
                <List
                    items={[
                        'May have an expiry date;',
                        'May be limited to one use;',
                        'May be non-transferable;',
                        'May apply only to particular Membership levels; and',
                        'May be invalidated where obtained through fraud, manipulation or misuse.'
                    ]}
                />
            </>
        )
    },
    {
        heading: 'General Promotional Draw rules',
        body: (
            <>
                <p>17.1 SLR may conduct:</p>
                <List
                    items={[
                        'Daily Promotional Draws;',
                        'Weekly Promotional Draws;',
                        'Monthly Promotional Draws;',
                        'Visitor Draws;',
                        'Bonus Draws;',
                        'Special Promotions; and',
                        'Other promotional campaigns.'
                    ]}
                />
                <p>
                    17.2 Each Promotional Draw may constitute a separate promotion and may have its own Promotion
                    Schedule.
                </p>
                <p>17.3 The applicable Promotion Schedule should identify, where relevant:</p>
                <List
                    items={[
                        'Promoter;',
                        'Promotion period;',
                        'Opening and closing times;',
                        'Eligible states or territories;',
                        'Age requirements;',
                        'Entry method;',
                        'Token or entry allocation;',
                        'Prize description;',
                        'Prize value;',
                        'Draw date and time;',
                        'Draw method;',
                        'Winner notification;',
                        'Publication requirements;',
                        'Claim requirements;',
                        'Unclaimed-prize process;',
                        'Permit or authority number where applicable; and',
                        'Any other legally required conditions.'
                    ]}
                />
                <p>17.4 Participation in a promotion does not guarantee a prize.</p>
            </>
        )
    },
    {
        heading: 'Weekly draw schedule',
        body: (
            <>
                <p>
                    18.1 Unless a particular Promotion Schedule states otherwise, SLR intends to conduct its regular
                    weekly Promotional Draws every Friday at approximately 7:30 PM AEST/AEDT, as applicable in Victoria.
                </p>
                <p>
                    18.2 The applicable entry closing time will be specified on the SLR website or in the relevant
                    Promotion Schedule.
                </p>
                <p>18.3 A draw may be postponed or rescheduled where reasonably necessary because of:</p>
                <List
                    items={[
                        'Technical failure;',
                        'Public holiday arrangements;',
                        'Regulatory requirements;',
                        'Force majeure;',
                        'System interruption; or',
                        'Other circumstances reasonably outside SLR’s control,'
                    ]}
                />
                <p>subject to applicable law.</p>
                <p>
                    18.4 Where a Promotion Schedule contains a different draw time or date, the Promotion Schedule
                    applies to that draw.
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
                    19.2 The relevant dates, opening and closing periods, prizes, eligibility criteria and other
                    conditions will be published with the applicable promotion.
                </p>
                <p>
                    19.3 A Member&rsquo;s 28-day billing cycle is separate from the scheduling of individual Promotional
                    Draws, unless expressly stated otherwise in the applicable Promotion Schedule.
                </p>
            </>
        )
    },
    {
        heading: 'Prize information & Prize Pools',
        body: (
            <>
                <p>20.1 Current and upcoming prize information will be published on the Smart Life Rewards website.</p>
                <p>20.2 The website or applicable Promotion Schedule may specify:</p>
                <List
                    items={[
                        'Number of prizes;',
                        'Prize descriptions;',
                        'Prize values;',
                        'Prize Pool;',
                        'Draw dates;',
                        'Eligibility;',
                        'Relevant Membership categories;',
                        'Claim requirements; and',
                        'Other promotion information.'
                    ]}
                />
                <p>
                    20.3 Members should refer to the SLR website for the current prize structure applicable to a
                    particular promotion.
                </p>
                <p>
                    20.4 Promotional advertising must be read together with the applicable Promotion Schedule and these
                    Terms.
                </p>

                <Sub>20.5 Combined SLR Prize Pool</Sub>
                <p>
                    SLR may advertise an overall Promotional Prize Pool representing the combined value of prizes made
                    available across eligible SLR promotional categories.
                </p>
                <p>The overall SLR Prize Pool may include prizes made available through:</p>
                <List
                    items={[
                        'Visitor promotions;',
                        'Red Member promotions;',
                        'Blue Member promotions;',
                        'Promotions available to multiple Membership categories;',
                        'Daily Promotional Draws;',
                        'Weekly Promotional Draws;',
                        'Monthly Promotional Draws;',
                        'Bonus Draws; and',
                        'Special Promotions.'
                    ]}
                />
                <p>
                    20.6 Unless expressly stated otherwise, an advertised overall SLR Prize Pool does not mean every
                    Member or Membership category is eligible for every individual prize contained within that Prize
                    Pool.
                </p>
                <p>
                    20.7 Eligibility for each individual prize and Promotional Draw is determined by the applicable
                    Promotion Schedule.
                </p>
                <p>
                    20.8 Where SLR advertises a Prize Pool specifically for Red, Blue, Visitor or another particular
                    promotion, only the prizes identified as forming part of that promotion will be included unless
                    expressly stated otherwise.
                </p>
                <p>
                    20.9 Where an advertised amount combines Visitor, Red and Blue prizes, SLR may describe that amount
                    as an overall or combined SLR Prize Pool.
                </p>
            </>
        )
    },
    {
        heading: 'Entry & Token allocation',
        body: (
            <>
                <p>
                    21.1 Where Tokens apply to a Promotional Draw, the applicable Promotion Schedule will explain how
                    Tokens translate into promotional entries.
                </p>
                <p>
                    21.2 SLR&rsquo;s intended principle is that the advertised Token allocation represents the genuine
                    promotional participation allocation described by SLR.
                </p>
                <p>
                    21.3 SLR does not inflate or multiply an entry after allocation except where a specific promotion
                    expressly provides for additional promotional allocations.
                </p>
                <p>21.4 Entries may only be issued to persons satisfying the applicable eligibility requirements.</p>
                <p>21.5 Entries associated with:</p>
                <List
                    items={[
                        'Fraudulent transactions;',
                        'Refunded transactions;',
                        'Reversed payments;',
                        'Chargebacks;',
                        'Duplicate or manipulated accounts; or',
                        'Other invalid activity'
                    ]}
                />
                <p>may be cancelled to the extent permitted by law and the applicable Promotion Schedule.</p>
                <p>
                    21.6 Where a Member legitimately holds both Red and Blue Memberships within the same Member Account,
                    eligible Tokens or promotional entries attributable to each tier may be separately recorded and
                    applied in accordance with the applicable Promotion Schedule.
                </p>
            </>
        )
    },
    {
        heading: 'Free Visitor promotions',
        body: (
            <>
                <p>22.1 SLR may provide free Visitor Promotional Draws or grocery-related promotional opportunities.</p>
                <p>
                    22.2 Paid Membership is not required for a promotion expressly advertised as a free Visitor
                    promotion.
                </p>
                <p>22.3 Visitor promotions may operate independently from paid-member promotions.</p>
                <p>22.4 Separate Promotion Schedules may apply.</p>
            </>
        )
    },
    {
        heading: 'Draw method & independent systems',
        body: (
            <>
                <p>23.1 Promotional Draws may be administered through:</p>
                <List
                    items={[
                        'TPAL Australia;',
                        'An approved electronic random-draw system;',
                        'Independent promotional software;',
                        'Independent draw administrators; or',
                        'Another lawful method specified in the Promotion Schedule.'
                    ]}
                />
                <p>23.2 Where applicable, SLR may use these systems for:</p>
                <List
                    items={[
                        'Random winner selection;',
                        'Audit records;',
                        'Entry verification;',
                        'Draw reporting;',
                        'Compliance records; and',
                        'Winner verification.'
                    ]}
                />
                <p>
                    23.3 SLR may retain appropriate draw and audit records in accordance with applicable legal and
                    operational requirements.
                </p>
            </>
        )
    },
    {
        heading: 'Fair chance',
        body: (
            <>
                <p>
                    24.1 Unless a Promotion Schedule expressly provides otherwise, each valid entry in the applicable
                    random Promotional Draw has an equal chance of being selected.
                </p>
                <p>
                    24.2 Holding more than one valid entry may increase the number of chances a participant holds but
                    does not guarantee a win.
                </p>
                <p>24.3 No skill is required for a game-of-chance promotion unless expressly identified otherwise.</p>
            </>
        )
    },
    {
        heading: 'Promotion eligibility',
        body: (
            <>
                <p>25.1 Eligibility will be determined by the applicable Promotion Schedule.</p>
                <p>25.2 Eligibility may require:</p>
                <List
                    items={[
                        'Being 18 or older;',
                        'Australian residency;',
                        'Residence within an eligible state or territory;',
                        'Valid account registration;',
                        'Active eligible Membership;',
                        'Successful payment status where applicable; and',
                        'Compliance with the Promotion Schedule.'
                    ]}
                />
                <p>
                    25.3 Directors, employees and contractors directly involved in administering a promotion, and their
                    immediate families, may be excluded where specified by the relevant Promotion Schedule or applicable
                    law.
                </p>
            </>
        )
    },
    {
        heading: 'State & territory requirements',
        body: (
            <>
                <p>26.1 Promotional Draws may be subject to different regulatory requirements throughout Australia.</p>
                <p>26.2 SLR may:</p>
                <List
                    items={[
                        'Restrict a promotion to specified jurisdictions;',
                        'Obtain permits or approvals where required;',
                        'Modify a Promotion Schedule;',
                        'Exclude a jurisdiction where legally necessary; or',
                        'Conduct separate state or territory promotions.'
                    ]}
                />
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
        heading: 'Winner selection',
        body: (
            <>
                <p>27.1 Winners will be selected in accordance with the applicable Promotion Schedule.</p>
                <p>27.2 SLR may select reserve winners where permitted and appropriate.</p>
                <p>27.3 SLR may verify a selected winner before awarding a prize.</p>
                <p>27.4 Verification may include:</p>
                <List
                    items={[
                        'Identity;',
                        'Age;',
                        'Residential address;',
                        'State eligibility;',
                        'Membership status;',
                        'Entry validity;',
                        'Payment status where relevant; and',
                        'Bank account ownership for a cash payment.'
                    ]}
                />
                <p>
                    27.5 A participant who fails eligibility verification may be disqualified where permitted by
                    applicable law and the Promotion Schedule.
                </p>
            </>
        )
    },
    {
        heading: 'Winner notification & publication',
        body: (
            <>
                <p>28.1 Winners may be notified by:</p>
                <List
                    items={[
                        'Email;',
                        'SMS;',
                        'Telephone;',
                        'Member Account;',
                        'SLR website;',
                        'SLR social-media account; or',
                        'Another method identified in the Promotion Schedule.'
                    ]}
                />
                <p>
                    28.2 Winner names or other identifying information may be published where required by law or with
                    appropriate authority.
                </p>
                <p>28.3 Members are responsible for ensuring their contact details remain current.</p>
            </>
        )
    },
    {
        heading: 'Unclaimed prizes & redraws',
        body: (
            <>
                <p>29.1 Prize claim periods will be identified in the relevant Promotion Schedule where required.</p>
                <p>
                    29.2 Where a prize remains unclaimed, cannot be awarded, or a selected entrant is ineligible, SLR
                    may conduct a redraw or use a reserve winner only in accordance with the Promotion Schedule and
                    applicable law.
                </p>
                <p>29.3 Any mandatory notification, publication or redraw requirements will be followed.</p>
            </>
        )
    },
    {
        heading: 'Prize conditions',
        body: (
            <>
                <p>30.1 Prizes must be accepted in accordance with the applicable Promotion Schedule.</p>
                <p>30.2 Cash prizes will be paid by the method specified by SLR after eligibility verification.</p>
                <p>30.3 Unless expressly stated otherwise, a non-cash prize:</p>
                <List
                    items={[
                        'Is not redeemable for cash;',
                        'Is not transferable;',
                        'Must be accepted as awarded; and',
                        'May be subject to supplier terms.'
                    ]}
                />
                <p>
                    30.4 Where permitted by law and reasonably necessary, SLR may substitute an unavailable prize with a
                    prize of equivalent or greater value, subject to any required regulatory approval.
                </p>
                <p>30.5 Prize values are expressed in Australian dollars unless stated otherwise.</p>
                <p>
                    30.6 Prize values may be based on recommended or market values available at the time the promotion
                    is published.
                </p>
            </>
        )
    },
    {
        heading: 'Odds & transparency',
        body: (
            <>
                <p>
                    31.1 SLR may publish indicative or actual promotional odds based on the relevant promotion structure
                    and valid participation numbers.
                </p>
                <p>31.2 Where SLR advertises odds, those odds must be read together with:</p>
                <List
                    items={[
                        'The applicable number of valid Members or entries;',
                        'Relevant Membership or promotion assumptions;',
                        'Promotion duration; and',
                        'Applicable Promotion Schedule.'
                    ]}
                />
                <p>
                    31.3 Actual odds may change where the number of eligible Members or entries changes, unless SLR has
                    expressly capped or fixed the relevant pool.
                </p>

                <Sub>31.4 Annualised odds — Red &amp; Blue tiers</Sub>
                <p>
                    Where SLR publishes annualised odds or probabilities, those figures may be calculated across the
                    combined Red and Blue Membership tiers using the stated number of eligible Members, valid entries or
                    Tokens, number and frequency of prizes, and the applicable promotional period.
                </p>
                <p>The calculation may also take into account:</p>
                <List
                    items={[
                        'Whether a Member holds Red Membership, Blue Membership or both;',
                        'Whether Red and Blue promotional participation is separately recorded within the same SLR Member Account;',
                        'The number of valid promotional entries or Tokens;',
                        'The frequency and number of prizes;',
                        'The applicable period over which the odds are calculated; and',
                        'Whether an eligible Member may win more than once during that period.'
                    ]}
                />
                <p>
                    Unless expressly stated otherwise, published annualised odds represent the applicable SLR
                    promotional structure across the eligible Red and Blue tiers and do not mean that every Member
                    necessarily has identical eligibility for every individual prize or Promotional Draw.
                </p>
                <p>
                    The assumptions and methodology used for advertised annualised odds should be made available by SLR
                    and must be read together with the applicable Promotion Schedule.
                </p>
                <p>
                    31.5 Where SLR publishes odds relating only to a particular tier, draw or promotional category,
                    those odds will apply only to the identified eligible pool.
                </p>
                <p>
                    31.6 SLR will not intentionally make misleading representations about its services, benefits, odds,
                    Prize Pools or promotions.
                </p>
            </>
        )
    },
    {
        heading: 'Fraud, manipulation & disqualification',
        body: (
            <>
                <p>32.1 SLR may investigate activity that reasonably appears to involve:</p>
                <List
                    items={[
                        'Fraud;',
                        'False information;',
                        'Multiple-account abuse;',
                        'Automated entries;',
                        'Payment fraud;',
                        'Chargeback abuse;',
                        'Spin Wheel manipulation;',
                        'Token manipulation;',
                        'System interference; or',
                        'Other dishonest conduct.'
                    ]}
                />
                <p>32.2 Subject to applicable law, SLR may:</p>
                <List
                    items={[
                        'Suspend the account;',
                        'Remove invalid promotional allocations;',
                        'Disqualify invalid entries;',
                        'Cancel affected promotional benefits; or',
                        'Terminate Membership for a material breach.'
                    ]}
                />
                <p>
                    32.3 Genuine consumer disputes or lawful chargebacks will not automatically be treated as fraud
                    merely because a Member exercises a legal right.
                </p>
            </>
        )
    },
    {
        heading: 'Member conduct',
        body: (
            <>
                <p>Members must not:</p>
                <List
                    items={[
                        'Harass, threaten or abuse others through SLR;',
                        'Provide deliberately false information;',
                        'Misuse Member benefits;',
                        'Manipulate promotions;',
                        'Attempt unauthorised access;',
                        'Interfere with platform security;',
                        'Introduce malicious software;',
                        'Impersonate another person; or',
                        'Use SLR for unlawful purposes.'
                    ]}
                />
            </>
        )
    },
    {
        heading: 'Website & digital services',
        body: (
            <>
                <p>34.1 SLR may provide websites, Member portals, applications and other digital services.</p>
                <p>
                    34.2 SLR will take reasonable steps to maintain its systems but does not guarantee digital services
                    will always be uninterrupted or error-free.
                </p>
                <p>34.3 Access may occasionally be interrupted for:</p>
                <List
                    items={[
                        'Maintenance;',
                        'Security;',
                        'Updates;',
                        'Technical failures;',
                        'Internet outages; or',
                        'Third-party service interruptions.'
                    ]}
                />
                <p>34.4 Nothing in this clause removes rights that cannot legally be excluded.</p>
            </>
        )
    },
    {
        heading: 'Community support information',
        body: (
            <>
                <p>
                    35.1 SLR may publish information about independent community, emergency, health, legal, housing,
                    food-support or charitable organisations.
                </p>
                <p>
                    35.2 Unless expressly stated otherwise, SLR does not provide those independent community services
                    and is not affiliated with or endorsed by the listed organisations merely because their publicly
                    available contact information appears on the SLR website.
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
        heading: 'Community & charitable initiatives',
        body: (
            <>
                <p>
                    36.1 SLR may support independent charitable or community organisations through donations,
                    fundraising initiatives, promotion or community campaigns.
                </p>
                <p>
                    36.2 SLR will not represent itself as an official Partner of an organisation unless such a
                    relationship has been authorised.
                </p>
                <p>
                    36.3 Where SLR conducts fundraising subject to separate regulatory obligations, applicable
                    disclosures and requirements will apply.
                </p>
            </>
        )
    },
    {
        heading: 'Marketing, SMS & email',
        body: (
            <>
                <p>37.1 SLR may send Members operational communications relating to:</p>
                <List
                    items={[
                        'Membership;',
                        'Account administration;',
                        'Payments;',
                        'Draws;',
                        'Prize notifications;',
                        'Security; and',
                        'Service information.'
                    ]}
                />
                <p>
                    37.2 SLR may also send marketing or promotional messages where it has a lawful basis and required
                    consent.
                </p>
                <p>
                    37.3 Commercial electronic marketing messages will include appropriate sender identification and an
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
        heading: 'Privacy & personal information',
        body: (
            <>
                <p>38.1 SLR may collect information including:</p>
                <List
                    items={[
                        'Name;',
                        'Date of birth or age-verification information;',
                        'Address;',
                        'Email address;',
                        'Telephone number;',
                        'Membership information;',
                        'Transaction references;',
                        'Promotional participation;',
                        'Winner-verification information; and',
                        'Communications with SLR.'
                    ]}
                />
                <p>38.2 Information may be used for:</p>
                <List
                    items={[
                        'Account administration;',
                        'Membership administration;',
                        'Payment processing;',
                        'Promotion administration;',
                        'Winner verification;',
                        'Fraud prevention;',
                        'Customer support;',
                        'Marketing where permitted;',
                        'Regulatory compliance; and',
                        'Business operations.'
                    ]}
                />
                <p>38.3 SLR may use third parties including:</p>
                <List
                    items={[
                        'Stripe;',
                        'PayPal;',
                        'TPAL Australia;',
                        'Hosting providers;',
                        'SMS providers;',
                        'Email providers;',
                        'Analytics providers; and',
                        'Other operational service providers.'
                    ]}
                />
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
        heading: 'Intellectual property',
        body: (
            <>
                <p>
                    39.1 Unless otherwise stated, SLR owns or is authorised to use intellectual property appearing on
                    the SLR platform including:
                </p>
                <List
                    items={[
                        'SLR branding;',
                        'Logos;',
                        'Artwork;',
                        'Graphics;',
                        'Written content;',
                        'Videos;',
                        'Promotional concepts;',
                        'Website materials;',
                        'Software; and',
                        'Other original material.'
                    ]}
                />
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
        heading: 'Social media platform disclaimer',
        body: (
            <>
                <p>
                    40.1 Unless expressly stated otherwise, an SLR promotion is not sponsored, endorsed, administered by
                    or associated with Facebook, Instagram, Meta, TikTok, YouTube, Google, Apple or another social-media
                    or technology platform merely because the promotion is advertised through that platform.
                </p>
                <p>
                    40.2 Participants release such platforms only to the extent permitted by the rules of the applicable
                    promotion and applicable law.
                </p>
            </>
        )
    },
    {
        heading: 'Termination & suspension',
        body: (
            <>
                <p>41.1 A Member may cancel their Membership in accordance with these Terms.</p>
                <p>41.2 SLR may reasonably suspend or terminate an account where:</p>
                <List
                    items={[
                        'Membership fees remain unpaid;',
                        'Fraud is reasonably suspected;',
                        'These Terms are materially breached;',
                        'Promotions are manipulated;',
                        'Benefits are deliberately misused;',
                        'Unlawful conduct occurs; or',
                        'Suspension or termination is required by law.'
                    ]}
                />
                <p>
                    41.3 SLR will exercise contractual powers subject to Australian Consumer Law and other applicable
                    laws.
                </p>
                <p>41.4 Termination does not remove rights or obligations accrued before termination.</p>
            </>
        )
    },
    {
        heading: 'Limitation of liability',
        body: (
            <>
                <p>
                    42.1 Nothing in these Terms excludes, restricts or modifies any consumer guarantee, right or remedy
                    which cannot lawfully be excluded.
                </p>
                <p>
                    42.2 To the maximum extent permitted by law, SLR is not responsible for loss caused solely by
                    matters outside its reasonable control, including:
                </p>
                <List
                    items={[
                        'Third-party platform outages;',
                        'Telecommunications interruptions;',
                        'Partner failures;',
                        'Supplier delays;',
                        'Unauthorised account access caused by a Member failing to secure their credentials; or',
                        'Events of force majeure.'
                    ]}
                />
                <p>42.3 Any exclusion or limitation in these Terms applies only to the extent legally permitted.</p>
            </>
        )
    },
    {
        heading: 'Changes to Membership benefits',
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
        heading: 'Changes to these Terms',
        body: (
            <>
                <p>44.1 SLR may update these Terms where reasonably necessary because of:</p>
                <List
                    items={[
                        'Business changes;',
                        'New services;',
                        'Regulatory changes;',
                        'New promotions;',
                        'Technology changes; or',
                        'Legal requirements.'
                    ]}
                />
                <p>44.2 Updated Terms will be published on the SLR website.</p>
                <p>44.3 Material changes affecting existing Members will be notified where required by law.</p>
                <p>44.4 Changes will not retrospectively remove accrued statutory rights.</p>
            </>
        )
    },
    {
        heading: 'Australian Consumer Law',
        body: (
            <>
                <p>
                    45.1 Nothing in these Terms is intended to exclude, restrict or modify a right, guarantee or remedy
                    that cannot legally be excluded under the Australian Consumer Law.
                </p>
                <p>
                    45.2 Where these Terms conflict with a mandatory consumer right, the mandatory legal right prevails.
                </p>
            </>
        )
    },
    {
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
        heading: 'Promotion Schedules',
        body: (
            <>
                <p>47.1 SLR may publish separate Promotion Schedules for its:</p>
                <List
                    items={[
                        'Daily Promotional Draws;',
                        'Weekly Member Draws;',
                        'Monthly Member Draws;',
                        'Visitor Grocery Draws;',
                        'Bonus Promotions; and',
                        'Special Promotions.'
                    ]}
                />
                <p>47.2 Each Promotion Schedule forms part of the SLR Terms &amp; Conditions.</p>
                <p>
                    47.3 The specific Promotion Schedule prevails over these General Terms concerning the mechanics of
                    that individual promotion to the extent of any inconsistency.
                </p>
            </>
        )
    },
    {
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
                </p>
                <p className='mt-2'>
                    Support &amp; Contact: apply online via the{' '}
                    <Link href='/contact' className='text-[#FFDC75] hover:underline'>
                        Smart Life Rewards Website Contact Page
                    </Link>
                    .
                </p>
            </LegalContactCard>
        )
    }
];

const TermsPage = () => {
    return (
        <>
            <PageHero
                eyebrow='Legal'
                title='Terms & Conditions'
                description='Membership, benefits and promotional draw terms.'
            />
            <LegalDoc
                lastUpdated='4 September 2026'
                intro={
                    <>
                        <p className='font-semibold text-white/90'>
                            General Terms &amp; Conditions — Membership, Benefits &amp; Promotional Draw Terms
                        </p>
                        <p className='mt-3'>
                            Issued by SLR Life Pty Ltd trading as Smart Life Rewards (SLR), Australia. ABN 99 696 467
                            473.
                        </p>
                        <p className='mt-3'>
                            Support &amp; contact: online via the{' '}
                            <Link href='/contact' className='text-[#FFDC75] hover:underline'>
                                Website Contact Page
                            </Link>
                            . Email: <MailLink />
                        </p>
                    </>
                }
                sections={sections}
            />
        </>
    );
};

export default TermsPage;
