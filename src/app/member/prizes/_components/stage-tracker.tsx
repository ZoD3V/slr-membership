import { PRIZE_STAGES, activeStage, nextStageNumber, stageProgress } from '@/lib/prizes';
import { cn } from '@/lib/utils';
import type { PrizePool } from '@/types/member';

export function StageTracker({ pool }: { pool: PrizePool }) {
    const stage = activeStage(pool.current_members);
    const nextStage = nextStageNumber(pool.current_members);
    const { pct, remaining } = stageProgress(pool.current_members);

    return (
        <section className='bg-card-dark-navy border-slr-navy-border rounded-2xl border p-5 md:p-6'>
            <div className='flex flex-wrap items-end justify-between gap-2'>
                <div>
                    <p className='text-slr-gold-label text-xs font-semibold tracking-widest uppercase'>
                        Membership Stage
                    </p>
                    <p className='font-bebas-neue text-2xl tracking-wide text-white uppercase'>Stage {stage.stage}</p>
                </div>
                <p className='text-slr-muted text-sm'>
                    <span className='font-semibold text-white tabular-nums'>
                        {pool.current_members.toLocaleString('en-AU')}
                    </span>{' '}
                    paid members
                </p>
            </div>

            <div className='mt-4'>
                <div className='h-2 overflow-hidden rounded-full bg-white/5'>
                    <div className='bg-gradient-gold h-full rounded-full' style={{ width: `${pct}%` }} />
                </div>
                <p className='text-slr-dim mt-2 text-xs'>
                    {nextStage !== null ? (
                        <>
                            <span className='tabular-nums'>{remaining.toLocaleString('en-AU')}</span> more members until
                            Stage {nextStage}
                        </>
                    ) : (
                        'Top stage reached'
                    )}
                </p>
            </div>

            <div className='mt-4 flex flex-wrap gap-2'>
                {PRIZE_STAGES.map((threshold, index) => {
                    const reached = pool.current_members >= threshold;
                    const isCurrent = index + 1 === stage.stage;

                    return (
                        <span
                            key={threshold}
                            className={cn(
                                'rounded-full border px-2.5 py-1 text-xs font-medium tabular-nums',
                                isCurrent
                                    ? 'border-slr-gold-label/40 bg-gold-tint text-slr-gold-label'
                                    : reached
                                      ? 'border-white/10 text-white/70'
                                      : 'text-slr-dim border-white/5'
                            )}>
                            Stage {index + 1} · {threshold.toLocaleString('en-AU')}
                        </span>
                    );
                })}
            </div>
        </section>
    );
}
