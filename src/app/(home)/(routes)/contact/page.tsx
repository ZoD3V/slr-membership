import { Metadata } from 'next';

import PageHero from '../_components/page-hero';
import ContactForm from './_components/contact-form';
import { Clock, HelpCircle, Mail, MapPin } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Contact · SLR Rewards',
    description: 'Get in touch with the Smart Life Rewards support team. We typically reply within one business day.'
};

const infoCards = [
    {
        icon: Mail,
        title: 'Email support',
        body: 'cs@smartliferewards.com.au',
        hint: 'For account, billing, and general help'
    },
    {
        icon: Clock,
        title: 'Response time',
        body: 'Within 1 business day',
        hint: 'Mon–Fri · 9am–5pm AEST'
    },
    {
        icon: MapPin,
        title: 'Based in Australia',
        body: 'Smart Life Rewards Pty Ltd',
        hint: 'Serving every state and territory'
    },
    {
        icon: HelpCircle,
        title: 'Check the FAQ first',
        body: 'Most questions answered',
        hint: 'Visit our Help Centre'
    }
];

const ContactPage = () => {
    return (
        <main className='bg-slr-ink'>
            <PageHero
                surface='#040404'
                eyebrow='Get In Touch'
                title='Contact Us'
                description="Questions about your membership, billing, or a draw? Send us a message and we'll respond within one business day."
            />

            <section className='bg-slr-ink relative py-12 md:py-16'>
                <div className='mx-auto max-w-6xl px-4'>
                    <div className='grid grid-cols-1 gap-8 lg:grid-cols-5'>
                        <aside className='space-y-4 lg:col-span-2'>
                            {infoCards.map(({ icon: Icon, title, body, hint }) => (
                                <div
                                    key={title}
                                    className='bg-card-dark-navy flex items-start gap-4 rounded-2xl border border-[#A0B4D259] p-5 shadow-[0px_0px_20px_0px_#776D6D26]'>
                                    <div className='bg-gold-tint flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D4AF3759]'>
                                        <Icon className='h-5 w-5 text-[#FFDC75]' />
                                    </div>
                                    <div>
                                        <p className='font-bebas-neue text-xl tracking-wider text-white uppercase'>
                                            {title}
                                        </p>
                                        <p className='mt-0.5 text-sm font-medium text-white'>{body}</p>
                                        <p className='text-slr-dim mt-1 text-xs'>{hint}</p>
                                    </div>
                                </div>
                            ))}
                        </aside>

                        <div className='lg:col-span-3'>
                            <div className='bg-card-dark-navy rounded-2xl border border-[#A0B4D259] p-6 shadow-[0px_0px_20px_0px_#776D6D26] md:p-8'>
                                <h2 className='font-bebas-neue text-3xl tracking-wider text-white uppercase md:text-4xl'>
                                    Send us a message
                                </h2>
                                <p className='text-slr-muted mt-2 mb-6 text-sm'>
                                    Fill in the form below and our support team will get back to you.
                                </p>
                                <ContactForm />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default ContactPage;
