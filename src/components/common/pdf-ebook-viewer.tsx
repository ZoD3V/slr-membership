'use client';

import { goldButtonStyle } from '@/lib/styles';

import { ExternalLink } from 'lucide-react';

interface PdfEbookViewerProps {
    pdfUrl: string;
    title: string;
}

export function PdfEbookViewer({ pdfUrl, title }: PdfEbookViewerProps) {
    return (
        <div className='mx-auto w-full max-w-5xl px-4 md:px-6'>
            <div className='border-slr-navy-border bg-card-dark-navy overflow-hidden rounded-2xl border'>
                <object
                    data={pdfUrl}
                    type='application/pdf'
                    className='h-[80vh] min-h-[520px] w-full'
                    aria-label={title}>
                    <div className='flex flex-col items-center px-6 py-14 text-center'>
                        <h2 className='font-bebas-neue text-2xl tracking-wide text-white uppercase md:text-3xl'>
                            Open “{title}”
                        </h2>
                        <p className='text-slr-muted mt-2 max-w-md text-sm leading-relaxed'>
                            Your browser can’t display this PDF inline. Open it in a new tab to read.
                        </p>
                        <div className='mt-5 flex flex-wrap items-center justify-center gap-3'>
                            <a
                                href={pdfUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold uppercase'
                                style={goldButtonStyle}>
                                Open PDF <ExternalLink className='size-4' />
                            </a>
                        </div>
                    </div>
                </object>
            </div>
        </div>
    );
}
