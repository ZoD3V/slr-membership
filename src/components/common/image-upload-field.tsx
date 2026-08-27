'use client';

import { useRef, useState } from 'react';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { ImageUp, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadFieldProps {
    value?: string;
    onChange: (url: string) => void;

    onUpload: (file: File) => Promise<string>;
    placeholder?: string;
    disabled?: boolean;
}

export function ImageUploadField({
    value,
    onChange,
    onUpload,
    placeholder = 'https://…',
    disabled
}: ImageUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (inputRef.current) inputRef.current.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('File must be an image.');

            return;
        }

        setIsUploading(true);
        const toastId = toast.loading('Uploading image…');
        try {
            const url = await onUpload(file);
            onChange(url);
            toast.success('Image uploaded.', { id: toastId });
        } catch (error) {
            console.error('[image-upload-field] upload failed', error);
            toast.error(error instanceof Error ? error.message : 'Upload failed.', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className='space-y-2'>
            <div className='flex items-center gap-2'>
                <Input
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled || isUploading}
                />
                <input type='file' ref={inputRef} onChange={handleFileChange} accept='image/*' className='hidden' />
                <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    disabled={disabled || isUploading}
                    onClick={() => inputRef.current?.click()}
                    title='Upload image'>
                    {isUploading ? <Loader2 className='h-4 w-4 animate-spin' /> : <ImageUp className='h-4 w-4' />}
                </Button>
            </div>

            {value ? (
                <div className='border-border relative w-fit overflow-hidden rounded-lg border'>
                    <Image
                        src={value}
                        alt='Preview'
                        width={120}
                        height={80}
                        unoptimized
                        className='h-20 w-auto object-cover'
                    />
                    <button
                        type='button'
                        onClick={() => onChange('')}
                        disabled={disabled || isUploading}
                        className='bg-background/80 text-foreground absolute top-1 right-1 rounded-full p-0.5 transition-opacity hover:opacity-80 disabled:pointer-events-none'
                        title='Remove image'>
                        <X className='h-3.5 w-3.5' />
                    </button>
                </div>
            ) : null}
        </div>
    );
}
