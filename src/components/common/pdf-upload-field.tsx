'use client';

import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { FileText, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface PdfUploadFieldProps {
    value?: string;
    onChange: (url: string) => void;

    onUpload: (file: File) => Promise<string>;
    placeholder?: string;
    disabled?: boolean;
}

function fileNameFromUrl(url: string): string {
    try {
        const path = new URL(url).pathname;
        const last = path.slice(path.lastIndexOf('/') + 1);

        return decodeURIComponent(last) || 'document.pdf';
    } catch {
        return 'document.pdf';
    }
}

export function PdfUploadField({
    value,
    onChange,
    onUpload,
    placeholder = 'https://…/document.pdf',
    disabled
}: PdfUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (inputRef.current) inputRef.current.value = '';
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error('File must be a PDF.');

            return;
        }

        setIsUploading(true);
        const toastId = toast.loading('Uploading PDF…');
        try {
            const url = await onUpload(file);
            onChange(url);
            toast.success('PDF uploaded.', { id: toastId });
        } catch (error) {
            console.error('[pdf-upload-field] upload failed', error);
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
                <input
                    type='file'
                    ref={inputRef}
                    onChange={handleFileChange}
                    accept='application/pdf'
                    className='hidden'
                />
                <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    disabled={disabled || isUploading}
                    onClick={() => inputRef.current?.click()}
                    title='Upload PDF'>
                    {isUploading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Upload className='h-4 w-4' />}
                </Button>
            </div>

            {value ? (
                <div className='border-border flex w-fit items-center gap-2 rounded-lg border px-3 py-2'>
                    <FileText className='h-4 w-4 text-white/60' />
                    <a
                        href={value}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='max-w-[240px] truncate text-xs text-white/80 underline-offset-2 hover:underline'>
                        {fileNameFromUrl(value)}
                    </a>
                    <button
                        type='button'
                        onClick={() => onChange('')}
                        disabled={disabled || isUploading}
                        className='text-foreground rounded-full p-0.5 transition-opacity hover:opacity-80 disabled:pointer-events-none'
                        title='Remove PDF'>
                        <X className='h-3.5 w-3.5' />
                    </button>
                </div>
            ) : null}
        </div>
    );
}
