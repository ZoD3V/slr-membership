export type Chapter = {
    num: string;

    shortTitle: string;

    heading: string;

    tag: string;
    readMinutes: number;

    image?: string;

    body: string[];
    quote?: string;
};

export const chapters: Chapter[] = [
    {
        num: '01',
        shortTitle: 'The Shift',
        heading: 'The Shift.',
        tag: 'Living Smarter',
        readMinutes: 2,
        image: '/images/jogging.webp',
        body: [
            "Living smarter, not harder, isn't about doing more — it's about doing less of what drains you and more of what compounds. The shift starts with one decision: choosing systems over willpower, tools over hustle, and clarity over noise.",
            "SLR was built to give Australians that shift in one place — rewards, discounts, and a smarter way to live every week. The lift you feel after a month isn't motivation. It's leverage."
        ],
        quote: 'Smarter choices today compound into easier days tomorrow.'
    },
    {
        num: '02',
        shortTitle: 'Your Home',
        heading: 'Start Where You Live.',
        tag: 'At Home',
        readMinutes: 2,
        body: [
            'Your home is the first place smart living shows up — not in renovations or gadgets, but in the small frictions you stop tolerating: the bills on autopilot, the subscriptions you forgot, the energy plan you never compared.',
            'Members save most where they spend most often. Groceries, fuel, and utilities aren’t glamorous, but trimming them quietly funds the life you actually want.'
        ],
        quote: 'A calm home is a system, not a splurge.'
    },
    {
        num: '03',
        shortTitle: 'Hidden Cost',
        heading: 'The Hidden Cost.',
        tag: 'The Money',
        readMinutes: 2,
        image: '/images/core-exercise.webp',
        body: [
            "The most expensive things rarely arrive with a price tag. They show up as the deal you didn't compare, the renewal you didn't cancel, and the hour you spent earning back what you overpaid.",
            'Awareness is the cheapest upgrade you’ll ever make. One honest look at where the money goes is usually worth more than a raise.'
        ],
        quote: "What you don't track, you overpay for."
    },
    {
        num: '04',
        shortTitle: 'Your Time',
        heading: 'Buy Back Your Time.',
        tag: 'Time Back',
        readMinutes: 2,
        body: [
            "Money returns. Time doesn't. Smart living treats your hours like the scarce asset they are — protecting them from low-value busywork and pointing them at what only you can do.",
            "Every system you set up once pays you back forever. The goal isn't a fuller calendar — it's a lighter one."
        ],
        quote: 'Buy back your hours before you buy anything else.'
    },
    {
        num: '05',
        shortTitle: 'Daily Habits',
        heading: 'Small Systems, Daily.',
        tag: 'Small Systems',
        readMinutes: 1,
        body: [
            "Big change is just a small habit repeated without drama. The members who win aren't the most disciplined — they're the ones who made the right choice the easy choice.",
            'Stack one good decision onto something you already do, and let momentum carry the rest.'
        ],
        quote: 'Make the smart option the default option.'
    },
    {
        num: '06',
        shortTitle: 'True Comfort',
        heading: 'Comfort Without Overspending.',
        tag: 'Better, Not More',
        readMinutes: 2,
        image: '/images/lifestyle.webp',
        body: [
            "You don't need to spend more to live better. Smart members find comfort in better choices — the right plan, the right hour, the right partner.",
            'Comfort without overspending is about removing friction, not adding luxury. A well-set thermostat, a smart grocery run, and a member-only price often beat the expensive alternative every time.'
        ],
        quote: 'Comfort is engineered, not purchased.'
    }
];

export const totalReadMinutes = chapters.reduce((sum, chapter) => sum + chapter.readMinutes, 0);
