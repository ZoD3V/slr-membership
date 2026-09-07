import { Fragment } from 'react';

import { BENY_MONTHLY_PRICE } from '@/constant/tiers';
import { getTierPricing, minPriceOf } from '@/lib/tier-pricing';

import { Check, Minus } from 'lucide-react';

type Cell = boolean | string;

type Row = {
    feature: string;
    hint?: string;
    red: Cell;
    blue: Cell;
};

type Group = {
    title: string;
    rows: Row[];
};

const groups: Group[] = [
    {
        title: 'Prize draws',
        rows: [
            {
                feature: 'Weekly cash draw',
                hint: '$50 cash prize, state-based',
                red: true,
                blue: true
            },
            {
                feature: 'SLR Red draws',
                hint: 'Up to 7 draws/week, state-based pool',
                red: true,
                blue: true
            },
            {
                feature: 'SLR Premium / Blue draws',
                hint: 'Premium prize pool, state-based',
                red: false,
                blue: true
            },
            {
                feature: 'Monthly mega draw',
                red: true,
                blue: true
            },
            {
                feature: 'Entries per cycle',
                hint: 'Reset every cycle, allocated on payment',
                red: '4–7',
                blue: '10+'
            }
        ]
    },
    {
        title: 'Discounts',
        rows: [
            {
                feature: 'Browse partner directory',
                red: true,
                blue: true
            },
            {
                feature: 'Use partner discount codes',
                red: true,
                blue: true
            },
            {
                feature: 'Member-only deals',
                red: false,
                blue: true
            },
            {
                feature: 'BENY add-on eligibility',
                hint: `Optional +$${BENY_MONTHLY_PRICE}/month, requires phone`,
                red: true,
                blue: true
            }
        ]
    },
    {
        title: 'Content & engagement',
        rows: [
            {
                feature: 'Browse e-book library',
                red: true,
                blue: true
            },
            {
                feature: 'Read full e-books in-browser',
                red: true,
                blue: true
            },
            {
                feature: 'Spin Wheel (1× per cycle)',
                hint: 'Bonus entries, credits, or billing discount',
                red: true,
                blue: true
            }
        ]
    },
    {
        title: 'Account',
        rows: [
            {
                feature: 'Digital membership card + QR',
                red: true,
                blue: true
            },
            {
                feature: 'Priority customer support',
                red: false,
                blue: true
            },
            {
                feature: 'Email + SMS notifications',
                red: true,
                blue: true
            }
        ]
    }
];

const renderCell = (value: Cell) => {
    if (value === true) {
        return (
            <span className='inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#D4AF3759] bg-[#D4AF370D]'>
                <Check className='h-4 w-4 text-[#FFDC75]' />
            </span>
        );
    }
    if (value === false) {
        return (
            <span className='inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/2'>
                <Minus className='h-4 w-4 text-white/30' />
            </span>
        );
    }

    return <span className='text-xs font-semibold text-white md:text-sm'>{value}</span>;
};

const ComparisonMatrix = async () => {
    const pricing = await getTierPricing();
    const redFrom = minPriceOf(pricing, 'red') / 100;
    const blueFrom = minPriceOf(pricing, 'blue') / 100;

    return (
        <div className='overflow-hidden rounded-2xl border border-[#A0B4D259] bg-[linear-gradient(154.36deg,#141820_0.82%,#1E2530_49.73%,#141820_98.65%)] shadow-[0px_0px_20px_0px_#776D6D26]'>
            <div className='overflow-x-auto'>
                <table className='w-full min-w-160 border-collapse'>
                    <thead>
                        <tr className='border-b border-white/10'>
                            <th className='text-slr-dim p-4 text-left text-xs font-semibold tracking-widest uppercase md:p-5'>
                                Feature
                            </th>
                            <th className='p-4 text-center text-xs font-semibold tracking-widest text-[#E88888] uppercase md:p-5'>
                                <div className='flex flex-col items-center gap-0.5'>
                                    <span>Red</span>
                                    <span className='text-[10px] text-white/40 normal-case'>
                                        from ${redFrom}/4 weeks
                                    </span>
                                </div>
                            </th>
                            <th className='p-4 text-center text-xs font-semibold tracking-widest text-[#6AB0F0] uppercase md:p-5'>
                                <div className='flex flex-col items-center gap-0.5'>
                                    <span>Premium</span>
                                    <span className='text-[10px] text-white/40 normal-case'>
                                        from ${blueFrom}/4 weeks
                                    </span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.map((group, gIdx) => (
                            <Fragment key={group.title}>
                                <tr className='bg-white/2'>
                                    <td
                                        colSpan={3}
                                        className='p-3 text-[11px] font-bold tracking-widest text-[#FFDC75] uppercase md:p-4 md:text-xs'>
                                        {group.title}
                                    </td>
                                </tr>
                                {group.rows.map((row, rIdx) => (
                                    <tr
                                        key={row.feature}
                                        className={
                                            gIdx === groups.length - 1 && rIdx === group.rows.length - 1
                                                ? ''
                                                : 'border-b border-white/5'
                                        }>
                                        <td className='p-4 md:p-5'>
                                            <p className='text-sm font-medium text-white md:text-base'>{row.feature}</p>
                                            {row.hint && <p className='text-slr-dim mt-0.5 text-xs'>{row.hint}</p>}
                                        </td>
                                        <td className='p-4 text-center md:p-5'>{renderCell(row.red)}</td>
                                        <td className='p-4 text-center md:p-5'>{renderCell(row.blue)}</td>
                                    </tr>
                                ))}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComparisonMatrix;
