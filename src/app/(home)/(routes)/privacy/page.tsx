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
    title: 'Privacy Policy · SLR Rewards',
    description:
        'How SLR Life Pty Ltd trading as Smart Life Rewards collects, holds, uses and discloses personal information under the Privacy Act 1988 (Cth).'
};

const AUSTRALIAN_LAWS = [
    'Privacy Act 1988 (Cth);',
    'Australian Privacy Principles;',
    'Notifiable Data Breaches scheme;',
    'Spam Act 2003 (Cth);',
    'Australian Consumer Law;',
    'Applicable promotional and trade-promotion requirements; and',
    'Other applicable Australian laws.'
];

const PrivacyContact = () => (
    <LegalContactCard title='Privacy Contact — Smart Life Rewards'>
        <p className='mt-1'>
            SLR Life Pty Ltd
            <br />
            28 Welcome Parade
            <br />
            Wyndham VIC 3024 Australia
        </p>
        <p className='mt-2'>
            Email:{' '}
            <a href='mailto:cs@smartliferewards.com.au' className='text-[#FFDC75] hover:underline'>
                cs@smartliferewards.com.au
            </a>
            <br />
            Website:{' '}
            <Link href='/contact' className='text-[#FFDC75] hover:underline'>
                Smart Life Rewards Website Contact Page
            </Link>
        </p>
    </LegalContactCard>
);

const sections: LegalSection[] = [
    {
        heading: 'Definitions',
        body: (
            <>
                <p>In this Privacy Policy:</p>
                <Term term='SLR”, “we”, “our” or “us'>means SLR Life Pty Ltd trading as Smart Life Rewards (SLR).</Term>
                <Term term='Platform'>
                    means the SLR website, mobile applications, Member portals, membership systems, promotional systems
                    and associated services.
                </Term>
                <Term term='Member'>
                    means a person registered with SLR, including an eligible Visitor, Red Member or Blue Member.
                </Term>
                <Term term='Visitor'>means a person registered for a free SLR Visitor Membership.</Term>
                <Term term='Paid Member'>means a Member holding an active paid Red or Blue Membership.</Term>
                <Term term='Member Account'>
                    means the single personal SLR account established for a registered individual and identified through
                    the person&rsquo;s registered details and unique SLR Member ID.
                </Term>
                <Term term='Personal Information'>
                    has the meaning given under the Privacy Act 1988 (Cth) and generally includes information or an
                    opinion about an identified individual, or an individual who is reasonably identifiable.
                </Term>
                <Term term='Promotional Activities'>
                    includes daily, weekly, monthly, Visitor, bonus and special promotions, Promotional Draws,
                    giveaways, promotional rewards, Spin Wheel activities, referral promotions, Member benefits and
                    other promotional campaigns conducted or administered by SLR.
                </Term>
                <Term term='Promotional Draw'>
                    means an SLR daily, weekly, monthly, Visitor, bonus or special promotional game-of-chance activity.
                </Term>
                <Term term='Token'>
                    means a promotional participation allocation associated with an eligible SLR Membership level or
                    Promotional Activity, as described in the applicable SLR Terms or Promotion Schedule. Where a
                    Promotion Schedule specifies that Tokens are used for Promotional Draw participation, each eligible
                    Token represents the promotional entry or chance specified in that Promotion Schedule.
                </Term>
                <Term term='Prize Pool'>
                    means the stated total value of prizes allocated to the promotion, period, Membership category or
                    combination of promotional activities identified by SLR.
                </Term>
                <Term term='Promotion Schedule'>
                    means the specific terms and conditions applying to an individual SLR promotion.
                </Term>
                <Term term='Spin Wheel'>
                    means an optional promotional feature through which an eligible Member may receive a Membership
                    reduction, promotional benefit, bonus or other displayed outcome.
                </Term>
                <Term term='Partner'>
                    means an independent business or service provider whose product, discount, service or benefit may be
                    made available through SLR.
                </Term>
                <Term term='Third-Party Providers'>
                    means external businesses or service providers engaged or used by SLR, including payment processors,
                    hosting providers, software providers, communications providers, analytics providers, benefit
                    providers and promotional administration providers.
                </Term>
            </>
        )
    },
    {
        heading: 'Purpose of this Privacy Policy',
        body: (
            <>
                <p>
                    This Privacy Policy explains how SLR collects, holds, stores, uses, manages and discloses Personal
                    Information connected with:
                </p>
                <List
                    items={[
                        'SLR Memberships;',
                        'Visitor registrations;',
                        'Red Membership;',
                        'Blue Membership;',
                        'Members participating in both Red and Blue Membership;',
                        'SLR Member Accounts;',
                        'Website and application use;',
                        'Promotional Activities;',
                        'Daily, weekly and monthly Promotional Draws;',
                        'Visitor, bonus and special promotions;',
                        'Token allocations;',
                        'Promotional entries;',
                        'Prize Pool administration;',
                        'Prize and winner administration;',
                        'Promotional odds and participation calculations;',
                        'Spin Wheel activities;',
                        'Referral and tag-a-friend promotions;',
                        'Member savings and benefits;',
                        'Grocery-related benefits and rewards;',
                        'BENY and other third-party Member benefits;',
                        'Partner discounts and offers;',
                        'Subscription and billing services;',
                        'Customer support;',
                        'Community initiatives; and',
                        'Other associated SLR products and services.'
                    ]}
                />
                <p>
                    SLR intends to handle Personal Information in accordance with applicable Australian laws and
                    regulatory requirements, including where applicable:
                </p>
                <List items={AUSTRALIAN_LAWS} />
                <p>
                    Use of the Platform is subject to this Privacy Policy and other applicable SLR Terms &amp;
                    Conditions.
                </p>
            </>
        )
    },
    {
        heading: 'Information we may collect',
        body: (
            <>
                <p>
                    SLR may collect Personal Information where reasonably necessary for its functions, activities,
                    Membership services, Promotional Activities, security, legal obligations and business operations.
                </p>

                <Sub>3.1 Identity information</Sub>
                <p>SLR may collect:</p>
                <List
                    items={[
                        'Full name;',
                        'Date of birth;',
                        'Age-verification information;',
                        'Residential address;',
                        'State or territory;',
                        'Postcode;',
                        'Identity-verification information where reasonably required; and',
                        'Unique SLR Member ID.'
                    ]}
                />

                <Sub>3.2 Contact information</Sub>
                <p>SLR may collect:</p>
                <List
                    items={[
                        'Email address;',
                        'Mobile telephone number;',
                        'Residential or postal contact information;',
                        'Communication preferences;',
                        'Marketing preferences; and',
                        'Customer-support correspondence.'
                    ]}
                />

                <Sub>3.3 Member Account &amp; Membership information</Sub>
                <p>SLR may collect and maintain:</p>
                <List
                    items={[
                        'Visitor Membership status;',
                        'Red Membership status;',
                        'Blue Membership status;',
                        'Whether a Member participates in Red, Blue or both Membership tiers;',
                        'Membership plan or level;',
                        'Membership commencement dates;',
                        '28-day Membership Cycle information;',
                        'Subscription and payment status;',
                        'Membership upgrade information;',
                        'Membership downgrade information;',
                        'Cancellation information;',
                        'Member-benefit eligibility;',
                        'Partner-benefit access;',
                        'Membership activity history; and',
                        'Account status.'
                    ]}
                />

                <Sub>3.4 Promotional &amp; Token information</Sub>
                <p>SLR may collect and maintain information concerning:</p>
                <List
                    items={[
                        'Token allocations;',
                        'Promotional entries;',
                        'Red promotional participation;',
                        'Blue promotional participation;',
                        'Visitor promotional participation;',
                        'Daily Promotional Draws;',
                        'Weekly Promotional Draws;',
                        'Monthly Promotional Draws;',
                        'Bonus promotions;',
                        'Special promotions;',
                        'Spin Wheel participation;',
                        'Referral and tag-a-friend promotions;',
                        'Promotional codes;',
                        'Promotional eligibility;',
                        'Closing-time eligibility;',
                        'Promotional participation history;',
                        'Prize Pool administration;',
                        'Number of promotional opportunities;',
                        'Entry and Token verification; and',
                        'Records used to calculate or verify published promotional odds.'
                    ]}
                />

                <Sub>3.5 Prize &amp; winner information</Sub>
                <p>SLR may collect:</p>
                <List
                    items={[
                        'Prize claim information;',
                        'Winner-verification information;',
                        'Identity information;',
                        'Age-verification information;',
                        'Residential and state eligibility information;',
                        'Membership status;',
                        'Entry validity;',
                        'Payment status where relevant;',
                        'Bank account or PayID information required for prize payment;',
                        'Winner-notification records;',
                        'Prize-payment records;',
                        'Prize-delivery information; and',
                        'Information required for legally required winner publication, auditing or reporting.'
                    ]}
                />

                <Sub>3.6 Billing &amp; payment information</Sub>
                <p>SLR may collect limited billing and transaction-related information including:</p>
                <List
                    items={[
                        'Stripe transaction references;',
                        'PayPal transaction references;',
                        'Billing references;',
                        'Membership-payment status;',
                        'Successful-payment records;',
                        'Failed or declined-payment information;',
                        'Refund references;',
                        'Chargeback or payment-dispute information;',
                        'PayID information where applicable; and',
                        'Limited payment-verification information.'
                    ]}
                />
                <p>
                    SLR does not ordinarily receive or store complete credit-card details where those details are
                    securely processed and stored by an authorised payment provider.
                </p>

                <Sub>3.7 Member benefits, discounts &amp; Partner information</Sub>
                <p>SLR may maintain records relating to:</p>
                <List
                    items={[
                        'Member-benefit eligibility;',
                        'Discount access;',
                        'Partner offers;',
                        'BENY or other third-party benefit access;',
                        'Voucher or grocery rewards;',
                        'Promotional rewards;',
                        'Merchandise;',
                        'Community benefits; and',
                        'Other SLR benefits.'
                    ]}
                />

                <Sub>3.8 Technical &amp; Platform information</Sub>
                <p>SLR may automatically collect information including:</p>
                <List
                    items={[
                        'Device information;',
                        'Browser type;',
                        'IP address;',
                        'Approximate location derived from technical information;',
                        'Website and app usage;',
                        'Login records;',
                        'Cookies;',
                        'Analytics information;',
                        'Security events;',
                        'Referral-source information;',
                        'Session information; and',
                        'Platform-performance information.'
                    ]}
                />
                <p>
                    SLR will not intentionally collect precise device-location information unless reasonably required
                    for a feature and an appropriate notice, permission or consent process is provided where required.
                </p>
            </>
        )
    },
    {
        heading: 'How Personal Information is collected',
        body: (
            <>
                <p>SLR may collect Personal Information directly from individuals when they:</p>
                <List
                    items={[
                        'Create an SLR Member Account;',
                        'Register as a Visitor;',
                        'Join Red Membership;',
                        'Join Blue Membership;',
                        'Hold both Red and Blue Membership;',
                        'Purchase or renew Membership;',
                        'Upgrade or downgrade Membership;',
                        'Cancel Membership;',
                        'Use the SLR website, app or Member portal;',
                        'Participate in Promotional Activities;',
                        'Receive or use Tokens;',
                        'Participate in Promotional Draws;',
                        'Use the Spin Wheel;',
                        'Use referral, tag-a-friend or promotional codes;',
                        'Submit forms;',
                        'Contact SLR;',
                        'Request customer support;',
                        'Claim prizes or rewards;',
                        'Access Partner benefits;',
                        'Respond to email, SMS or Platform communications; or',
                        'Interact with cookies, analytics or security technologies.'
                    ]}
                />
                <p>
                    SLR may also receive Personal Information from Third-Party Providers where reasonably necessary to
                    administer:
                </p>
                <List
                    items={[
                        'Membership;',
                        'Payments;',
                        'Promotional Activities;',
                        'Promotional Draws;',
                        'Member benefits;',
                        'Identity verification;',
                        'Winner verification;',
                        'Fraud-prevention processes;',
                        'Customer communications; or',
                        'Legal and regulatory compliance.'
                    ]}
                />
            </>
        )
    },
    {
        heading: 'Purposes of collection, holding, use & disclosure',
        body: (
            <>
                <p>SLR may collect, hold, use or disclose Personal Information for purposes including:</p>
                <List
                    items={[
                        'Establishing and administering Member Accounts;',
                        'Administering Visitor Membership;',
                        'Administering Red Membership;',
                        'Administering Blue Membership;',
                        'Administering Members who hold both Red and Blue Membership;',
                        'Managing 28-day Membership Cycles;',
                        'Processing Membership payments;',
                        'Managing payment failures;',
                        'Processing cancellations and refunds;',
                        'Managing upgrades and downgrades;',
                        'Allocating Tokens;',
                        'Recording promotional entries;',
                        'Administering Promotional Draws;',
                        'Confirming promotional eligibility;',
                        'Administering daily, weekly and monthly Promotional Draws;',
                        'Administering Visitor, bonus and special promotions;',
                        'Calculating and administering Prize Pools;',
                        'Calculating, verifying and publishing promotional participation figures and odds;',
                        'Selecting and verifying winners;',
                        'Paying or delivering prizes;',
                        'Administering Spin Wheel activities;',
                        'Administering referral and tag-a-friend promotions;',
                        'Providing discounts and Member benefits;',
                        'Providing BENY or other third-party benefits;',
                        'Administering Partner offers;',
                        'Sending necessary operational communications;',
                        'Providing customer support;',
                        'Detecting fraud or account manipulation;',
                        'Preventing duplicate-account abuse;',
                        'Protecting Platform security;',
                        'Maintaining audit and compliance records;',
                        'Improving SLR products and services;',
                        'Performing internal analytics;',
                        'Managing complaints and disputes;',
                        'Meeting legal and regulatory obligations; and',
                        'Sending marketing communications where permitted by law.'
                    ]}
                />
                <p>SLR may also use aggregated or de-identified information for:</p>
                <List
                    items={[
                        'Business analysis;',
                        'Platform improvements;',
                        'Promotional planning;',
                        'Statistical analysis;',
                        'Forecasting;',
                        'Prize planning; and',
                        'Other legitimate business purposes,'
                    ]}
                />
                <p>provided individuals are not reasonably identifiable from that information.</p>
            </>
        )
    },
    {
        heading: 'One person — one SLR Member Account',
        body: (
            <>
                <p>SLR generally operates on the basis of one person holding one SLR Member Account.</p>
                <p>Subject to eligibility, one Member Account may hold:</p>
                <List
                    items={[
                        'Visitor Membership;',
                        'Red Membership;',
                        'Blue Membership; or',
                        'Red and Blue Membership concurrently.'
                    ]}
                />
                <p>
                    A Member does not need to create a second SLR account or provide a second email address merely to
                    participate in both Red and Blue Membership.
                </p>
                <p>
                    Where a Member holds both Red and Blue Memberships, SLR may separately record information associated
                    with each tier, including:
                </p>
                <List
                    items={[
                        'Membership status;',
                        'Membership payments;',
                        'Membership benefits;',
                        'Tokens;',
                        'Promotional entries;',
                        'Promotional Draw eligibility; and',
                        'Tier-specific entitlements.'
                    ]}
                />
                <p>
                    For SLR&rsquo;s unique individual Member count, a person holding both Red and Blue Membership
                    generally remains one individual SLR Member unless a published statistic expressly measures:
                </p>
                <List items={['Memberships;', 'Membership tiers;', 'Tokens;', 'Entries; or', 'Tier participation']} />
                <p>rather than individual people.</p>
                <p>
                    SLR may use identity, email, telephone, payment, technical or other relevant information to detect
                    and manage suspected duplicate accounts, fraud or misuse.
                </p>
            </>
        )
    },
    {
        heading: 'Promotional odds, Member numbers & Prize Pools',
        body: (
            <>
                <p>
                    SLR may use Membership and promotional participation information to calculate and publish
                    information concerning:
                </p>
                <List
                    items={[
                        'Number of Members;',
                        'Visitor participation;',
                        'Red Membership participation;',
                        'Blue Membership participation;',
                        'Number and frequency of prizes;',
                        'Prize Pools;',
                        'Number of promotional entries or Tokens;',
                        'Promotional participation;',
                        'Promotional odds; and',
                        'Annualised promotional probabilities.'
                    ]}
                />
                <p>
                    Where annualised odds are calculated across the eligible Red and Blue Membership tiers, SLR may use
                    relevant information concerning:
                </p>
                <List
                    items={[
                        'Number of eligible Members;',
                        'Valid entries or Tokens;',
                        'Red and Blue participation;',
                        'Number of prizes;',
                        'Frequency of prizes;',
                        'Applicable Promotional Draw periods; and',
                        'Whether an eligible Member may win more than once.'
                    ]}
                />
                <p>
                    Where SLR publishes Membership numbers, odds or other promotional statistics to the public, SLR
                    intends to use aggregated or de-identified information rather than identifying individual Members,
                    except where identification is:
                </p>
                <List
                    items={[
                        'Required for winner publication;',
                        'Required by law;',
                        'Necessary for prize administration; or',
                        'Otherwise authorised.'
                    ]}
                />
                <p>An advertised overall SLR Prize Pool may include prizes allocated across:</p>
                <List
                    items={[
                        'Visitor promotions;',
                        'Red Member promotions;',
                        'Blue Member promotions;',
                        'Daily Promotional Draws;',
                        'Weekly Promotional Draws;',
                        'Monthly Promotional Draws;',
                        'Bonus Draws; and',
                        'Special Promotions,'
                    ]}
                />
                <p>where stated by SLR.</p>
            </>
        )
    },
    {
        heading: 'Third-party service providers',
        body: (
            <>
                <p>SLR may use Third-Party Providers including:</p>
                <List
                    items={[
                        'Stripe Australia;',
                        'PayPal;',
                        'TPAL Australia;',
                        'BENY or other Member-benefit providers;',
                        'SMS providers;',
                        'Email providers;',
                        'Website hosting providers;',
                        'Cloud-storage providers;',
                        'Website developers;',
                        'App developers;',
                        'Software-support providers;',
                        'Analytics providers;',
                        'Cybersecurity providers;',
                        'Identity-verification providers;',
                        'Professional legal advisers;',
                        'Accounting advisers;',
                        'Auditors; and',
                        'Compliance advisers.'
                    ]}
                />
                <p>
                    Personal Information disclosed to a Third-Party Provider will generally be limited to information
                    reasonably required for that provider to perform the relevant service.
                </p>
                <p>
                    Third-Party Providers may have their own privacy policies, security arrangements, terms and legal
                    obligations.
                </p>
                <p>
                    Where applicable, SLR will take reasonable steps required by Australian privacy law when engaging
                    Third-Party Providers that handle Personal Information on SLR&rsquo;s behalf.
                </p>
            </>
        )
    },
    {
        heading: 'Payments & electronic transfers',
        body: (
            <>
                <p>
                    Membership payments may be processed through authorised third-party payment processors including
                    Stripe, PayPal or another approved payment provider.
                </p>
                <p>
                    Those providers may independently collect, process and retain payment-related Personal Information
                    in accordance with their own privacy policies and terms.
                </p>
                <p>
                    SLR does not ordinarily store complete payment-card details where those details are handled by the
                    relevant payment processor.
                </p>
                <p>
                    Where SLR pays a prize using PayID, electronic funds transfer or another banking method, SLR may
                    collect information reasonably necessary to:
                </p>
                <List
                    items={[
                        'Verify the winner;',
                        'Verify account ownership;',
                        'Process the payment; and',
                        'Maintain appropriate payment records.'
                    ]}
                />
                <p>
                    Members and prize recipients are responsible for ensuring payment and banking information they
                    provide is accurate and current.
                </p>
                <p>
                    SLR will take reasonable steps to address payment issues within its control but cannot guarantee the
                    operation of independent banking or payment systems.
                </p>
            </>
        )
    },
    {
        heading: 'Cookies, analytics & digital technologies',
        body: (
            <>
                <p>SLR&rsquo;s Platform may use:</p>
                <List
                    items={[
                        'Cookies;',
                        'Analytics technologies;',
                        'Session technologies;',
                        'Device information;',
                        'Security technologies;',
                        'Advertising or marketing measurement technologies; and',
                        'Similar digital technologies.'
                    ]}
                />
                <p>These technologies may be used for:</p>
                <List
                    items={[
                        'Website functionality;',
                        'Member login;',
                        'Account authentication;',
                        'Security;',
                        'Fraud detection;',
                        'Troubleshooting;',
                        'User-experience improvements;',
                        'Analytics;',
                        'Measuring marketing performance;',
                        'Platform development; and',
                        'Understanding how SLR services are used.'
                    ]}
                />
                <p>Users may be able to restrict certain cookies through browser or device settings.</p>
                <p>Disabling cookies may affect some Platform features.</p>
                <p>Where required, SLR may provide additional cookie notices or consent controls.</p>
            </>
        )
    },
    {
        heading: 'Marketing, email & SMS communications',
        body: (
            <>
                <p>SLR may send operational communications relating to:</p>
                <List
                    items={[
                        'Member Accounts;',
                        'Membership;',
                        'Membership payments;',
                        'Membership renewals;',
                        'Security;',
                        'Promotional Draw administration;',
                        'Prize notifications;',
                        'Member benefits;',
                        'Customer support; and',
                        'Important Platform information.'
                    ]}
                />
                <p>
                    SLR may also send commercial marketing or promotional email, SMS or other electronic communications
                    where permitted by applicable law.
                </p>
                <p>
                    Where required, SLR will obtain or rely upon an appropriate form of consent before sending
                    commercial electronic marketing.
                </p>
                <p>
                    Creating an account, making an enquiry or completing an isolated transaction does not automatically
                    mean a person has agreed to receive every form of future SLR marketing.
                </p>
                <p>Where required by law, SLR commercial electronic messages will:</p>
                <List
                    items={[
                        'Identify SLR or the authorised sender;',
                        'Provide appropriate sender or contact information; and',
                        'Provide a functional and reasonably accessible unsubscribe method.'
                    ]}
                />
                <p>SLR will process valid unsubscribe requests within the period required by applicable law.</p>
                <p>Unsubscribing from marketing does not prevent SLR from sending necessary:</p>
                <List
                    items={[
                        'Account communications;',
                        'Security communications;',
                        'Payment communications;',
                        'Membership administration communications;',
                        'Prize or winner communications; or',
                        'Other service-related communications.'
                    ]}
                />
            </>
        )
    },
    {
        heading: 'Disclosure of Personal Information',
        body: (
            <>
                <p>SLR may disclose Personal Information where reasonably necessary:</p>
                <List
                    items={[
                        'To payment processors;',
                        'To Promotional Draw administrators;',
                        'To Member-benefit providers;',
                        'To Partner service providers;',
                        'To hosting and software providers;',
                        'To communications providers;',
                        'To identity-verification providers;',
                        'To prize suppliers or delivery providers;',
                        'To legal advisers;',
                        'To accountants and auditors;',
                        'To compliance advisers;',
                        'To regulators;',
                        'To courts or tribunals;',
                        'To law-enforcement or government authorities where legally required;',
                        'In connection with an authorised corporate restructure, merger, acquisition, financing or sale; or',
                        'With the person&rsquo;s consent or where otherwise permitted by law.'
                    ]}
                />
                <p>
                    SLR does not intend to sell Personal Information to unrelated third parties for those third
                    parties&rsquo; independent marketing purposes.
                </p>
            </>
        )
    },
    {
        heading: 'Overseas disclosure & data storage',
        body: (
            <>
                <p>
                    Some Third-Party Providers used by SLR may operate infrastructure, personnel or data-storage systems
                    outside Australia.
                </p>
                <p>
                    Personal Information may therefore in some circumstances be processed, accessed or stored outside
                    Australia.
                </p>
                <p>
                    Where SLR is likely to disclose Personal Information to an overseas recipient, SLR will take
                    reasonable steps required by applicable Australian privacy law.
                </p>
                <p>
                    Where practicable, SLR will identify in this Privacy Policy or an applicable collection notice the
                    countries in which overseas recipients are likely to be located.
                </p>
                <p>The relevant countries may depend on:</p>
                <List
                    items={[
                        'SLR&rsquo;s hosting provider;',
                        'Cloud-services provider;',
                        'Communications provider;',
                        'Analytics provider;',
                        'Payment provider;',
                        'Software provider; and',
                        'Other Third-Party Providers used at the relevant time.'
                    ]}
                />
                <p>
                    SLR will periodically review this section as its Third-Party Providers and data-hosting arrangements
                    are confirmed or changed.
                </p>
            </>
        )
    },
    {
        heading: 'Data security',
        body: (
            <>
                <p>
                    SLR intends to take reasonable administrative, technical and organisational steps to protect
                    Personal Information from:
                </p>
                <List
                    items={[
                        'Misuse;',
                        'Interference;',
                        'Loss;',
                        'Unauthorised access;',
                        'Unauthorised modification; and',
                        'Unauthorised disclosure.'
                    ]}
                />
                <p>Security measures may include, where appropriate:</p>
                <List
                    items={[
                        'Access controls;',
                        'Authentication systems;',
                        'Password protections;',
                        'Secure payment processing;',
                        'Data-access restrictions;',
                        'Security monitoring;',
                        'Backup procedures;',
                        'Cybersecurity measures;',
                        'Vendor-management procedures; and',
                        'Staff and contractor access controls.'
                    ]}
                />
                <p>No internet-based or electronic storage system can be guaranteed to be completely secure.</p>
                <p>
                    Members should maintain secure passwords and login information and promptly notify SLR if they
                    reasonably suspect unauthorised access to their Member Account.
                </p>
            </>
        )
    },
    {
        heading: 'Data breaches',
        body: (
            <>
                <p>SLR will assess suspected or known data breaches and take reasonable steps to:</p>
                <List
                    items={[
                        'Contain the breach;',
                        'Protect affected information;',
                        'Investigate the circumstances;',
                        'Reduce potential harm;',
                        'Remedy identified security weaknesses; and',
                        'Meet applicable legal notification requirements.'
                    ]}
                />
                <p>
                    Where the Notifiable Data Breaches scheme applies and SLR experiences an eligible data breach, SLR
                    will comply with applicable requirements concerning notification to:
                </p>
                <List items={['Affected individuals; and', 'The Office of the Australian Information Commissioner.']} />
                <p>SLR may also notify relevant:</p>
                <List
                    items={[
                        'Regulators;',
                        'Payment providers;',
                        'Service providers;',
                        'Insurers;',
                        'Professional advisers; or',
                        'Law-enforcement authorities'
                    ]}
                />
                <p>where required or reasonably necessary.</p>
            </>
        )
    },
    {
        heading: 'Data retention & deletion',
        body: (
            <>
                <p>SLR may retain Personal Information and related records for as long as reasonably necessary for:</p>
                <List
                    items={[
                        'Membership administration;',
                        'Payment administration;',
                        'Promotional administration;',
                        'Token and entry records;',
                        'Prize administration;',
                        'Winner verification;',
                        'Fraud prevention;',
                        'Security;',
                        'Audit requirements;',
                        'Taxation and accounting requirements;',
                        'Regulatory obligations;',
                        'Complaints;',
                        'Dispute resolution;',
                        'Legal proceedings; and',
                        'Other lawful business requirements.'
                    ]}
                />
                <p>Records retained may include:</p>
                <List
                    items={[
                        'Member Account information;',
                        'Membership records;',
                        'Payment references;',
                        'Promotional participation;',
                        'Token and entry records;',
                        'Prize and winner records;',
                        'Communications;',
                        'Compliance records;',
                        'Website and app activity;',
                        'Security logs; and',
                        'Audit records.'
                    ]}
                />
                <p>
                    Where SLR no longer needs Personal Information for a lawful purpose and is not legally required or
                    permitted to retain it, SLR will take reasonable steps to destroy or de-identify it where required
                    by applicable privacy law.
                </p>
            </>
        )
    },
    {
        heading: 'Access & correction of Personal Information',
        body: (
            <>
                <p>Individuals may request access to Personal Information SLR holds about them.</p>
                <p>Individuals may also request correction of Personal Information that they believe is:</p>
                <List items={['Inaccurate;', 'Out of date;', 'Incomplete;', 'Irrelevant; or', 'Misleading.']} />
                <p>Requests may be submitted to:</p>
                <PrivacyContact />
                <p>
                    SLR may require reasonable evidence of identity before providing access to or correcting Personal
                    Information.
                </p>
                <p>SLR will respond to requests in accordance with applicable law.</p>
                <p>
                    If SLR refuses an access or correction request where permitted by law, SLR will provide any reasons
                    or notices required by applicable law.
                </p>
            </>
        )
    },
    {
        heading: 'Privacy complaints',
        body: (
            <>
                <p>
                    A person who believes SLR has not handled their Personal Information appropriately may submit a
                    privacy complaint.
                </p>
                <p>Complaints may be submitted to:</p>
                <PrivacyContact />
                <p>
                    The complaint should provide enough information to allow SLR to understand and investigate the
                    matter.
                </p>
                <p>SLR will take reasonable steps to:</p>
                <List
                    items={[
                        'Acknowledge the complaint;',
                        'Review the circumstances;',
                        'Request further information if reasonably necessary;',
                        'Investigate the complaint;',
                        'Take appropriate corrective action where required; and',
                        'Respond within a reasonable period.'
                    ]}
                />
                <p>
                    If a person remains dissatisfied following SLR&rsquo;s response, they may have the right to contact
                    the Office of the Australian Information Commissioner or another relevant regulator.
                </p>
            </>
        )
    },
    {
        heading: 'Account closure & deletion requests',
        body: (
            <>
                <p>Members may request:</p>
                <List
                    items={[
                        'Closure of their Member Account;',
                        'Cancellation of Membership;',
                        'Correction of Personal Information; or',
                        'Deletion of Personal Information where permitted by law.'
                    ]}
                />
                <p>
                    Closure of a Member Account does not necessarily require SLR to immediately delete all information
                    associated with that account.
                </p>
                <p>SLR may retain relevant records where reasonably necessary or legally required for:</p>
                <List
                    items={[
                        'Payment and financial records;',
                        'Prize administration;',
                        'Promotional audit records;',
                        'Fraud prevention;',
                        'Security;',
                        'Regulatory compliance;',
                        'Legal claims; and',
                        'Dispute resolution.'
                    ]}
                />
                <p>
                    Where a Member holds both Red and Blue Membership, the Member should clearly state whether they wish
                    to:
                </p>
                <List
                    items={[
                        'Cancel Red Membership only;',
                        'Cancel Blue Membership only;',
                        'Cancel both paid Memberships; or',
                        'Close the entire SLR Member Account.'
                    ]}
                />
            </>
        )
    },
    {
        heading: 'Membership payments & cancellations',
        body: (
            <>
                <p>
                    Unless otherwise expressly displayed, paid SLR Membership operates on a recurring 28-day Membership
                    Cycle.
                </p>
                <p>
                    Members may cancel future recurring Membership payments using the cancellation method provided by
                    SLR.
                </p>
                <p>
                    Cancellation generally prevents the next recurring Membership payment and does not automatically
                    create an entitlement to a refund for the current paid Membership Cycle.
                </p>
                <p>
                    Where a Member holds both Red and Blue Membership, each tier may be administered and cancelled
                    separately within the same Member Account.
                </p>
                <p>Any entitlement to:</p>
                <List items={['A refund;', 'Cancellation;', 'Remedy; or', 'Other consumer right']} />
                <p>
                    will be determined in accordance with SLR&rsquo;s General Terms &amp; Conditions and applicable
                    Australian Consumer Law.
                </p>
                <p>
                    Where SLR approves a refund, processing times may depend on the applicable payment provider and
                    financial institution.
                </p>
            </>
        )
    },
    {
        heading: 'Children & age eligibility',
        body: (
            <>
                <p>
                    Paid SLR Membership and paid-member Promotional Draw participation are intended for persons aged 18
                    years or older unless expressly stated otherwise.
                </p>
                <p>
                    Specific free Visitor promotions may have separate age or eligibility conditions where permitted by
                    law.
                </p>
                <p>
                    SLR does not knowingly seek to collect Personal Information from children contrary to applicable
                    law.
                </p>
                <p>
                    If SLR becomes aware that Personal Information has been collected in circumstances where it should
                    not have been collected, SLR will take reasonable steps appropriate to the circumstances.
                </p>
            </>
        )
    },
    {
        heading: 'Third-party links & Partner services',
        body: (
            <>
                <p>The SLR Platform may contain links to:</p>
                <List
                    items={[
                        'Partner websites;',
                        'BENY or other benefit providers;',
                        'Affiliate services;',
                        'Local businesses;',
                        'Community organisations;',
                        'External merchants; and',
                        'Other third-party services.'
                    ]}
                />
                <p>Unless expressly stated otherwise, those services are independent from SLR.</p>
                <p>
                    SLR is not responsible for independent third parties&rsquo; privacy practices, website content or
                    information-handling procedures.
                </p>
                <p>
                    Members should review the relevant third party&rsquo;s privacy policy before providing Personal
                    Information directly to that provider.
                </p>
            </>
        )
    },
    {
        heading: 'Community & charitable initiatives',
        body: (
            <>
                <p>SLR may support independent community or charitable organisations through:</p>
                <List
                    items={[
                        'Donations;',
                        'Fundraising initiatives;',
                        'Promotional support;',
                        'Food-support initiatives;',
                        'Community campaigns; or',
                        'Other initiatives.'
                    ]}
                />
                <p>
                    Where Personal Information is specifically collected in connection with a community, charitable or
                    fundraising activity, additional privacy notices or conditions may apply.
                </p>
                <p>
                    SLR will not disclose a Member&rsquo;s Personal Information to a charity or community organisation
                    for that organisation&rsquo;s independent marketing merely because SLR supports or donates to that
                    organisation unless:
                </p>
                <List
                    items={[
                        'The Member has authorised the disclosure;',
                        'The disclosure is reasonably expected and permitted; or',
                        'The disclosure is otherwise permitted or required by law.'
                    ]}
                />
            </>
        )
    },
    {
        heading: 'Anonymity & pseudonyms',
        body: (
            <>
                <p>
                    Where practicable and permitted by law, individuals may have the option of interacting with SLR
                    without identifying themselves or by using a pseudonym.
                </p>
                <p>Identification will generally be necessary where reasonably required for:</p>
                <List
                    items={[
                        'Establishing a Member Account;',
                        'Age verification;',
                        'Membership administration;',
                        'Payment processing;',
                        'Promotional eligibility;',
                        'Token or entry administration;',
                        'Winner verification;',
                        'Prize payment or delivery;',
                        'Fraud prevention;',
                        'Duplicate-account prevention;',
                        'Security; or',
                        'Legal and regulatory compliance.'
                    ]}
                />
            </>
        )
    },
    {
        heading: 'Changes to this Privacy Policy',
        body: (
            <>
                <p>SLR may update this Privacy Policy where reasonably necessary because of:</p>
                <List
                    items={[
                        'Changes to SLR Membership;',
                        'Changes to SLR services;',
                        'New Member benefits;',
                        'New Promotional Activities;',
                        'New Promotional Draw structures;',
                        'New Third-Party Providers;',
                        'New technology;',
                        'Platform changes;',
                        'Regulatory developments;',
                        'Changes in privacy law; or',
                        'Changes in SLR&rsquo;s Personal Information handling practices.'
                    ]}
                />
                <p>The current Privacy Policy will be published on the SLR website.</p>
                <p>
                    Where a material change requires additional notice or consent under applicable law, SLR will take
                    appropriate steps.
                </p>
                <p>
                    The Last Updated date displayed at the beginning of this Privacy Policy identifies the date of the
                    current version.
                </p>
            </>
        )
    },
    {
        heading: 'Contact information & Australian privacy rights',
        body: (
            <>
                <div className='text-slr-muted rounded-xl border border-white/10 bg-black/20 p-4 text-sm'>
                    <p className='font-semibold text-white/90'>Smart Life Rewards (SLR)</p>
                    <p className='mt-1'>
                        SLR Life Pty Ltd Trading as Smart Life Rewards
                        <br />
                        ABN: 99 696 467 473
                    </p>
                    <p className='mt-2'>
                        Business &amp; Privacy Correspondence Address:
                        <br />
                        28 Welcome Parade
                        <br />
                        Wyndham VIC 3024 Australia
                    </p>
                    <p className='mt-2'>
                        Privacy &amp; Customer Support Email:{' '}
                        <a href='mailto:cs@smartliferewards.com.au' className='text-[#FFDC75] hover:underline'>
                            cs@smartliferewards.com.au
                        </a>
                        <br />
                        Website Support:{' '}
                        <Link href='/contact' className='text-[#FFDC75] hover:underline'>
                            Smart Life Rewards Website Contact Page
                        </Link>
                    </p>
                </div>
                <p>
                    Nothing in this Privacy Policy is intended to exclude, restrict or modify privacy, consumer or other
                    legal rights that cannot lawfully be excluded.
                </p>
                <p>Where applicable, SLR will handle Personal Information having regard to:</p>
                <List
                    items={[
                        'Privacy Act 1988 (Cth);',
                        'Australian Privacy Principles;',
                        'Notifiable Data Breaches scheme;',
                        'Spam Act 2003 (Cth);',
                        'Australian Consumer Law; and',
                        'Other applicable Australian laws and regulatory requirements.'
                    ]}
                />
                <p>
                    If this Privacy Policy is inconsistent with a mandatory legal requirement, the mandatory legal
                    requirement prevails.
                </p>
            </>
        )
    }
];

const PrivacyPage = () => {
    return (
        <>
            <PageHero
                eyebrow='Legal'
                title='Privacy Policy'
                description='How we collect, hold, use and disclose your personal information.'
            />
            <LegalDoc
                lastUpdated='4 September 2026'
                intro={
                    <>
                        <p>
                            Issued by SLR Life Pty Ltd trading as Smart Life Rewards (SLR) Australia. ABN 99 696 467
                            473. Business address: 28 Welcome Parade, Wyndham VIC 3024, Australia.
                        </p>
                        <p className='mt-3'>
                            Privacy &amp; customer support email:{' '}
                            <a href='mailto:cs@smartliferewards.com.au' className='text-[#FFDC75] hover:underline'>
                                cs@smartliferewards.com.au
                            </a>
                        </p>
                    </>
                }
                sections={sections}
            />
        </>
    );
};

export default PrivacyPage;
