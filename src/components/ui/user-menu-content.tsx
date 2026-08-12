import { DropdownMenuLabel } from '@/components/ui/dropdown-menu';

import { UserInfo } from './user-info';

interface UserMenuContentProps {
    user: any;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    return (
        <>
            <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
        </>
    );
}
