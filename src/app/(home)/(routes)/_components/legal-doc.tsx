import { ReactNode } from 'react';

export type LegalSection = {
    heading: string;
    body: ReactNode;
};

export const LegalSub = ({ children }: { children: ReactNode }) => (
    <h3 className='mt-5 text-sm font-semibold tracking-wide text-white/90 uppercase'>{children}</h3>
);

export const LegalList = ({ items }: { items: ReactNode[] }) => (
    <ul className='ml-5 list-disc space-y-1'>
        {items.map((item, idx) => (
            <li key={idx}>{item}</li>
        ))}
    </ul>
);

export const LegalTerm = ({ term, children }: { term: string; children: ReactNode }) => (
    <p>
        <strong className='text-white/90'>&ldquo;{term}&rdquo;</strong> {children}
    </p>
);

export const LegalContactCard = ({ title, children }: { title: string; children: ReactNode }) => (
    <div className='text-slr-muted rounded-xl border border-white/10 bg-black/20 p-4 text-sm'>
        <p className='font-semibold text-white/90'>{title}</p>
        {children}
    </div>
);

type LegalDocProps = {
    lastUpdated: string;
    intro?: ReactNode;
    sections: LegalSection[];
    contactEmail?: string;
};

const LegalDoc = ({ lastUpdated, intro, sections, contactEmail = 'cs@smartliferewards.com.au' }: LegalDocProps) => {
    return (
        <section className='bg-slr-navy-deep relative py-12 md:py-16'>
            <div className='mx-auto max-w-3xl px-4'>
                <div className='rounded-2xl border border-[#A0B4D259] bg-[linear-gradient(154.36deg,#141820_0.82%,#1E2530_49.73%,#141820_98.65%)] p-6 shadow-[0px_0px_20px_0px_#776D6D26] md:p-10'>
                    <p className='text-slr-dim text-xs font-semibold tracking-widest uppercase'>
                        Last updated: {lastUpdated}
                    </p>

                    {intro && <div className='text-slr-muted mt-4 text-sm leading-relaxed md:text-base'>{intro}</div>}

                    <div className='mt-8 space-y-8'>
                        {sections.map((section, idx) => (
                            <div key={section.heading}>
                                <h2 className='font-bebas-neue text-xl tracking-wider text-white uppercase md:text-2xl'>
                                    {idx + 1}. {section.heading}
                                </h2>
                                <div className='text-slr-muted mt-3 space-y-3 text-sm leading-relaxed md:text-base'>
                                    {section.body}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className='text-slr-muted mt-10 border-t border-white/10 pt-6 text-sm'>
                        Questions about this document? Email us at{' '}
                        <a href={`mailto:${contactEmail}`} className='text-[#FFDC75] hover:underline'>
                            {contactEmail}
                        </a>
                        .
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LegalDoc;
