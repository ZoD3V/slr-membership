export type FaqCategory = {
    title: string;
    items: { question: string; answer: string }[];
};

export const buildCategories = (redFrom: number, blueFrom: number, benyPrice: number): FaqCategory[] => [
    {
        title: 'Getting Started',
        items: [
            {
                question: 'What is Smart Life Rewards?',
                answer: 'Smart Life Rewards (SLR) is an Australian membership rewards club. Members get access to weekly prize draws, partner discounts, digital offers, and exclusive giveaways — all designed to help Australians beat the rising cost of living.'
            },
            {
                question: 'Who can join SLR?',
                answer: 'Any Australian resident aged 18 or older can join. During registration we ask for your state or territory so you can be entered into the correct state-based draw pool.'
            },
            {
                question: 'How do I sign up?',
                answer: 'Click Join Now on the homepage, fill in your name, email, password, state, and phone number, then choose a membership tier. If you select a paid tier, you will be redirected to a secure Stripe checkout to set up monthly billing.'
            },
            {
                question: 'Is there a free option?',
                answer: `No. Membership is paid only — SLR Red starts at $${redFrom}/month and SLR Premium (Blue) at $${blueFrom}/month. You can browse public pages and e-book listings without an account.`
            }
        ]
    },
    {
        title: 'Membership & Pricing',
        items: [
            {
                question: 'What are the membership tiers?',
                answer: `There are two tiers: SLR Red (from $${redFrom}/month) with basic discounts and Red draws, and SLR Premium / Blue (from $${blueFrom}/month) with full access to all draws, e-books, and member-only deals. Red and Premium members can also add the BENY discount platform for an extra $${benyPrice}/month.`
            },
            {
                question: 'How does billing work?',
                answer: 'Paid tiers are billed monthly through Stripe. Your card is charged automatically on the same date each month. You can view your billing history and update your card at any time from your Profile page.'
            },
            {
                question: 'Can I upgrade or downgrade my tier?',
                answer: 'Yes. Go to Profile → Manage Membership and select a new tier. Stripe will prorate the change or apply it at the next billing cycle, and your entries will be recalculated based on the new tier.'
            },
            {
                question: 'What happens if my payment fails?',
                answer: 'You will receive an email letting you know. There is a short grace period to update your card. After that, your entries for the current cycle are suspended until payment is resolved. Your account is not deleted — you can resume any time.'
            },
            {
                question: 'How do I cancel my membership?',
                answer: 'You can cancel at any time from Profile → Manage Membership. Your access continues until the end of the current billing cycle, and no further charges will be made.'
            }
        ]
    },
    {
        title: 'Draws & Prizes',
        items: [
            {
                question: 'How do prize entries work?',
                answer: 'Entries are calculated automatically based on your tier and are assigned only after a successful monthly payment. They do not accumulate — entries reset at the end of each draw cycle, so every cycle is a fresh chance to win.'
            },
            {
                question: 'What are state-based draw pools?',
                answer: 'Each member belongs to a draw pool determined by their state and tier (for example, "SLR Red VIC" or "SLR Blue NSW"). Winners are drawn from these pools to keep prize distribution fair across Australia.'
            },
            {
                question: 'Are draws legally compliant?',
                answer: 'Yes. SLR uses TPAL-certified draw processing. We export draw data to TPAL, an independent authorised provider, who runs the draw and selects winners on our behalf in line with Australian permit requirements.'
            },
            {
                question: 'How will I know if I win?',
                answer: 'Winners are notified by email and SMS. Prizes are credited directly — there is no wallet system to claim from. Winners are excluded from the remaining draws in the same cycle.'
            }
        ]
    },
    {
        title: 'Discounts & BENY',
        items: [
            {
                question: 'What discounts do members get?',
                answer: 'Red and Blue members can browse the Discounts directory to find partner deals across fuel, groceries, dining, travel, and more. Each deal includes a code you can copy with one click.'
            },
            {
                question: 'What is BENY?',
                answer: `BENY is a separate third-party discount platform with thousands of additional offers. It is available to Red and Premium members as an optional add-on for $${benyPrice}/month — it is not included in any tier by default. You can add BENY during checkout or later from the BENY page. Activation requires a phone number.`
            }
        ]
    },
    {
        title: 'Spin Wheel & E-Books',
        items: [
            {
                question: 'What is the Spin Wheel?',
                answer: 'Paid members get one spin during registration checkout each cycle. Possible outcomes include bonus entries, discount credit, a billing discount applied to your next invoice, or no prize. The wheel resets at the start of each new cycle.'
            },
            {
                question: 'Who can access e-books?',
                answer: 'Everyone can browse e-book listings (covers, titles, descriptions). Full content is available to Red and Blue members and can be read in your browser.'
            }
        ]
    },
    {
        title: 'Account & Privacy',
        items: [
            {
                question: 'How do I change my password?',
                answer: 'Go to Profile → Security to change your password or enable two-factor authentication for added account safety.'
            },
            {
                question: 'How is my data protected?',
                answer: 'We follow Australian Privacy Principles. Payment details are handled directly by Stripe and never stored on our servers. You can read the full Privacy Policy for details on what we collect and how we use it.'
            },
            {
                question: 'Can I change my state after registering?',
                answer: 'State is locked to your draw pool, so it cannot be changed yourself. If you have moved, contact support and an admin will update it for you.'
            }
        ]
    }
];
