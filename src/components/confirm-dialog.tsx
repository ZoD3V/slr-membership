import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { goldButtonStyle } from '@/lib/styles';
import { cn } from '@/lib/utils';

type ConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    disabled?: boolean;
    desc: React.JSX.Element | string;
    cancelBtnText?: string;
    confirmText?: React.ReactNode;
    destructive?: boolean;
    isLoading?: boolean;
    className?: string;
    children?: React.ReactNode;
} & ({ form: string; handleConfirm?: undefined } | { form?: undefined; handleConfirm: () => void });

export function ConfirmDialog(props: ConfirmDialogProps) {
    const {
        title,
        desc,
        children,
        className,
        confirmText,
        cancelBtnText,
        destructive,
        isLoading,
        disabled = false,
        form,
        handleConfirm,
        ...actions
    } = props;

    const isAdmin = className?.includes('slr-admin') || className?.includes('dashboard-theme');

    const theme = isAdmin
        ? {
              content: 'dashboard-theme dark border-border bg-background text-foreground',
              title: 'text-lg font-semibold',
              desc: 'text-muted-foreground text-sm',
              cancel: '',
              confirm: ''
          }
        : {
              content: 'slr-member dark border-slr-navy-border bg-slr-navy-deep text-white',
              title: 'font-bebas-neue text-2xl tracking-wider text-white uppercase',
              desc: 'text-slr-muted text-sm',
              cancel: 'h-11 rounded-xl border border-white/15 bg-white/5 text-white/90 uppercase transition-colors hover:bg-white/10 hover:text-white',
              confirm: 'h-11 rounded-xl font-bold uppercase transition-opacity hover:opacity-90'
          };

    return (
        <AlertDialog {...actions}>
            <AlertDialogContent className={cn(theme.content, className)}>
                <AlertDialogHeader className='text-start'>
                    <AlertDialogTitle className={theme.title}>{title}</AlertDialogTitle>
                    <AlertDialogDescription className={theme.desc} asChild>
                        <div>{desc}</div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {children}
                <AlertDialogFooter className='mt-2 flex-wrap gap-2'>
                    <AlertDialogCancel disabled={isLoading} className={theme.cancel}>
                        {cancelBtnText ?? 'Cancel'}
                    </AlertDialogCancel>
                    <Button
                        type={form ? 'submit' : 'button'}
                        form={form}
                        onClick={handleConfirm}
                        variant={destructive ? 'destructive' : 'default'}
                        style={destructive || isAdmin ? undefined : goldButtonStyle}
                        className={cn(theme.confirm, destructive ? 'text-white' : isAdmin ? '' : 'text-[#1a1408]')}
                        disabled={disabled || isLoading}>
                        {confirmText ?? 'Continue'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
