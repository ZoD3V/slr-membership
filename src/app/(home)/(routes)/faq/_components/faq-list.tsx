'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import type { FaqCategory } from '../faq-data';

const FaqList = ({ categories }: { categories: FaqCategory[] }) => {
    return (
        <div className='space-y-12'>
            {categories.map((category) => (
                <div key={category.title}>
                    <h2 className='font-bebas-neue mb-4 text-2xl tracking-wider text-white uppercase md:text-3xl'>
                        {category.title}
                    </h2>
                    <div className='rounded-2xl border border-[#A0B4D259] bg-[linear-gradient(154.36deg,#141820_0.82%,#1E2530_49.73%,#141820_98.65%)] px-5 shadow-[0px_0px_20px_0px_#776D6D26]'>
                        <Accordion type='multiple' className='divide-y divide-white/5'>
                            {category.items.map((item, idx) => (
                                <AccordionItem
                                    key={item.question}
                                    value={`${category.title}-${idx}`}
                                    className='border-b-0 last:border-b-0'>
                                    <AccordionTrigger className='py-5 text-left text-sm font-semibold text-white hover:no-underline md:text-base'>
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent className='text-slr-muted pb-5 text-sm leading-relaxed md:text-base'>
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FaqList;
