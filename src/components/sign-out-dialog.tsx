import { logoutAction } from '@/lib/logout-action';

import { ConfirmDialog } from './confirm-dialog';

interface SignOutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title='Sign out'
            desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
            confirmText='Sign out'
            destructive
            handleConfirm={logoutAction}
            className='dashboard-theme dark sm:max-w-sm'
        />
    );
}
