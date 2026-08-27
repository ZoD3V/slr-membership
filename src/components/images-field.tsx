import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useObjectURLPreviews } from '@/lib/get-preview-images';

import { Plus, X } from 'lucide-react';
import { Control, FieldValues, Path, useController } from 'react-hook-form';
import { toast } from 'sonner';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_MB = 512;

type ImagesFieldProps<TFieldValues extends FieldValues> = {
    control: Control<TFieldValues>;
    name: Path<TFieldValues>;
    disabled?: boolean;
};

export function ImagesField<TFieldValues extends FieldValues>({
    control,
    name,
    disabled
}: ImagesFieldProps<TFieldValues>) {
    const { field, fieldState } = useController<TFieldValues, Path<TFieldValues>>({
        control,
        name
    });

    const value = (field.value as (string | File)[]) ?? [];
    const previews = useObjectURLPreviews(value);

    const handleAddFiles = (files: File[]) => {
        if (!files.length) return;

        const file = files[0];

        if (!ACCEPTED_TYPES.includes(file.type)) {
            toast.error('Unsupported file type. Use JPG, PNG or WebP.');

            return;
        }
        if (file.size > MAX_MB * 1024 * 1024) {
            toast.error(`File is too large. Maximum ${MAX_MB}MB.`);

            return;
        }

        field.onChange([file]);
    };

    const removeAt = (idx: number) => {
        field.onChange(value.filter((_, i) => i !== idx));
    };

    return (
        <FormItem>
            <FormLabel>Image</FormLabel>
            <FormControl>
                <div className='space-y-2'>
                    {value.length > 0 && (
                        <div className='flex flex-wrap gap-2'>
                            {previews.map((src, i) => (
                                <div key={i} className='group relative h-24 w-24'>
                                    <img
                                        src={src}
                                        alt={`Foto ${i + 1}`}
                                        className='h-full w-full rounded-lg object-cover'
                                    />
                                    <button
                                        type='button'
                                        onClick={() => removeAt(i)}
                                        className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100'
                                        aria-label={`Hapus foto ${i + 1}`}>
                                        <X className='h-3 w-3' />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className='h-20 w-20'>
                        <label className='flex h-full w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400'>
                            <input
                                type='file'
                                accept={ACCEPTED_TYPES.join(',')}
                                className='hidden'
                                disabled={disabled}
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    handleAddFiles(files);
                                    e.currentTarget.value = '';
                                }}
                            />
                            <Plus className='h-6 w-6 text-gray-400' />
                        </label>
                    </div>

                    <p className='text-xs text-gray-500'>Upload 1 foto (JPG/PNG/WebP, maks {MAX_MB}KB).</p>
                </div>
            </FormControl>
            <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
    );
}
