'use client';

import type { ComponentProps, FC } from 'react';

import Link from 'next/link';

import { useAnchorScroll } from '@/hooks/use-anchor-scroll';

type AnchorLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

/** Drop-in Link for "#section" targets — see useAnchorScroll for why a plain Link is not enough. */
const AnchorLink: FC<AnchorLinkProps> = ({ href, children, onClick, ...rest }) => {
    const scrollToAnchor = useAnchorScroll();

    return (
        <Link
            href={href}
            onClick={(event) => {
                onClick?.(event);
                scrollToAnchor(event, href);
            }}
            {...rest}>
            {children}
        </Link>
    );
};

export default AnchorLink;
