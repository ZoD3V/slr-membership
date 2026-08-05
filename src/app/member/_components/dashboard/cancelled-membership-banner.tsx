import { formatShortDate } from '@/lib/member';
import { AlertTriangle } from 'lucide-react';

interface CancelledMembershipBannerProps {
    accessEndsAt: string;
}

export function CancelledMembershipBanner({ accessEndsAt }: CancelledMembershipBannerProps) {
    return (
        <div className='rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 md:p-5'>
            <div className='flex items-start gap-3'>
                <AlertTriangle className='mt-0.5 size-5 shrink-0 text-amber-400' />
                <div className='flex-1'>
                    <h3 className='text-sm font-semibold text-amber-100'>Membership Cancelled</h3>
                    <p className='text-slr-muted mt-1 text-sm leading-relaxed'>
                        Your membership has been cancelled and will end on{' '}
                        <span className='font-semibold text-white'>{formatShortDate(accessEndsAt)}</span>. You can
                        continue to access all member benefits until then. Reactivate anytime from your{' '}
                        <a href='/member/membership' className='text-amber-400 underline hover:text-amber-300'>
                            Membership settings
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
