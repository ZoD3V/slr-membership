import Image from 'next/image';

import { GOLD_GRADIENT } from '@/lib/styles';

const clubGradient = 'linear-gradient(180deg, #73470A 0%, #FFD44D 30%, #FFFFD9 50%, #F2B32E 70%, #664008 100%)';

const clubGlow =
    'drop-shadow(0px 12px 20px #000000B2) drop-shadow(0px 0px 50px #FFB2338C) drop-shadow(0px 0px 100px #FFB2334D)';

// And Above bar style from welcome section
const barHighlightStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #FFE066 0%, #F5C22E 50%, #C78C14 100%)',
    border: '1px solid #8C660D',
    boxShadow: '0px 10px 18px rgba(0, 0, 0, 0.35), 0px 0px 36px rgba(255, 199, 51, 0.55)',
    borderRadius: '12px'
};

const MembershipClubSection = () => {
    return (
        <section className='relative isolate overflow-hidden py-16 md:py-24'>
            <Image
                src='/images/bg-membership-club.webp'
                alt=''
                fill
                className='absolute inset-0 -z-10 object-cover opacity-30'
                priority
            />
            <div className='mx-auto max-w-3xl px-4 text-center relative z-10'>
                <h2 className='font-bebas-neue leading-[0.85] tracking-wide uppercase'>
                    <span className='text-gradient-silver block text-4xl sm:text-5xl md:text-6xl'>Membership</span>
                    <span
                        className='block bg-clip-text text-6xl text-transparent sm:text-7xl md:text-[112px]'
                        style={{ backgroundImage: clubGradient, filter: clubGlow }}>
                        Club
                    </span>
                </h2>

                <div className='mx-auto mt-12 w-full max-w-xs rounded-2xl p-0.5' style={{ background: GOLD_GRADIENT }}>
                    <div style={barHighlightStyle} className='px-6 py-8 shadow-[0px_12px_40px_0px_#00000080] sm:px-10'>
                        <p className='text-sm font-bold tracking-[0.3em] text-[#1A1408] uppercase sm:text-base mb-3'>
                            Prize Pool
                        </p>
                        <p
                            className='font-bebas-neue my-3 bg-clip-text text-7xl leading-none font-extrabold text-transparent sm:text-8xl'
                            style={{ backgroundImage: 'linear-gradient(180deg, #FFE066 0%, #F5C22E 50%, #C78C14 100%)' }}>
                            $2,100
                        </p>
                        <p className='text-xs font-bold tracking-[0.2em] text-[#1A1408] uppercase sm:text-sm'>
                            @ 22 Prizes • One Month
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MembershipClubSection;