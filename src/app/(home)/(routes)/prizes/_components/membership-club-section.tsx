import { GOLD_GRADIENT, goldBarStyle } from '@/lib/styles';
import type { PrizeContent } from '@/types/member';

const clubGradient = 'linear-gradient(180deg, #73470A 0%, #FFD44D 30%, #FFFFD9 50%, #F2B32E 70%, #664008 100%)';

const clubGlow =
    'drop-shadow(0px 12px 20px #000000B2) drop-shadow(0px 0px 50px #FFB2338C) drop-shadow(0px 0px 100px #FFB2334D)';

const MembershipClubSection = ({ content }: { content: PrizeContent }) => {
    return (
        <section className='relative isolate pt-24 pb-20 md:pt-36 md:pb-28'>
            <div className='relative z-10 mx-auto max-w-3xl px-4 text-center'>
                <h2 className='font-bebas-neue leading-[0.85] tracking-wide uppercase'>
                    <span className='text-gradient-silver block text-4xl sm:text-5xl md:text-6xl'>Membership</span>
                    <span
                        className='block bg-clip-text text-6xl text-transparent sm:text-7xl md:text-[112px]'
                        style={{ backgroundImage: clubGradient, filter: clubGlow }}>
                        Club
                    </span>
                </h2>

                {/* Prize Pool card */}
                <div
                    className='relative mx-auto mt-12 w-full max-w-xs rounded-2xl p-0.5'
                    style={{ background: GOLD_GRADIENT }}>
                    <div style={goldBarStyle} className='px-6 py-8 shadow-[0px_12px_40px_0px_#00000080] sm:px-10'>
                        <p className='mb-3 text-sm font-bold tracking-[0.3em] text-[#0A0A0A] uppercase sm:text-base'>
                            Prize Pool
                        </p>
                        <p className='font-bebas-neue my-3 text-7xl leading-none font-extrabold text-[#0A0A0A] sm:text-8xl'>
                            {content.prize_pool_headline}
                        </p>
                        <p className='text-xs font-bold tracking-[0.2em] text-[#3D3D3D] uppercase sm:text-sm'>
                            {content.prize_count}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MembershipClubSection;
