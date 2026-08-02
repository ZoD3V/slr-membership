import React from 'react';

interface Props {
    className?: string;
}

/** Page-width wrapper — mx-auto max-w-7xl with consistent horizontal padding. */
const Container: React.FC<React.PropsWithChildren<Props>> = ({
    children,
    className
}: React.PropsWithChildren<Props>) => {
    return <div className={`mx-auto w-full max-w-7xl px-4 xl:px-0 ${className ? className : ''}`}>{children}</div>;
};

export default Container;
