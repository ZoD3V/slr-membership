'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import ImageExtension from '@tiptap/extension-image';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import UnderlineExtension from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import {
    Bold,
    Heading1,
    Heading2,
    ImageIcon,
    Italic,
    List,
    ListOrdered,
    Loader2,
    Quote,
    Redo,
    RemoveFormatting,
    Underline,
    Undo
} from 'lucide-react';
import { toast } from 'sonner';

interface WysiwygEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;

    onImageUpload: (file: File) => Promise<string>;
}

export function WysiwygEditor({
    value = '',
    onChange,
    placeholder = 'Start writing...',
    className,
    onImageUpload
}: WysiwygEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            UnderlineExtension,
            ImageExtension.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full my-4 border border-white/10 h-auto'
                }
            }),
            PlaceholderExtension.configure({
                placeholder: placeholder,
                emptyEditorClass: 'is-editor-empty'
            })
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            if (html === '<p></p>' || html === '') {
                onChange?.('');
            } else {
                onChange?.(html);
            }
        },
        editorProps: {
            attributes: {
                class: 'min-h-[250px] max-h-[400px] overflow-y-auto p-4 text-white text-sm outline-none focus:outline-none transition-all prose prose-invert max-w-none tiptap'
            }
        }
    });

    useEffect(() => {
        if (!editor) return;

        if (value !== editor.getHTML()) {
            editor.commands.setContent(value || '');
        }
    }, [value, editor]);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('File must be an image.');

            return;
        }

        setIsUploading(true);
        const toastId = toast.loading('Uploading image…');
        try {
            const url = await onImageUpload(file);
            editor?.chain().focus().setImage({ src: url }).run();
            toast.success('Image uploaded.', { id: toastId });
        } catch (error) {
            console.error('[wysiwyg] image upload failed', error);
            toast.error(error instanceof Error ? error.message : 'Upload failed.', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    if (!editor) {
        return (
            <div
                className={cn(
                    'min-h-[200px] w-full rounded-lg border border-white/10 bg-white/5 p-4 text-white/40',
                    className
                )}>
                Loading editor...
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex flex-col overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-all focus-within:border-[#D4AF37]/60 focus-within:ring-1 focus-within:ring-[#D4AF37]/20',
                className
            )}>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                .tiptap p.is-editor-empty:first-child::before {
                    color: rgba(255, 255, 255, 0.3);
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                .tiptap ul {
                    list-style-type: disc !important;
                    padding-left: 1.5rem !important;
                    margin-top: 0.5rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .tiptap ol {
                    list-style-type: decimal !important;
                    padding-left: 1.5rem !important;
                    margin-top: 0.5rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .tiptap li {
                    display: list-item !important;
                    margin-top: 0.25rem !important;
                    margin-bottom: 0.25rem !important;
                }
                .tiptap blockquote {
                    border-left: 3px solid #D4AF37 !important;
                    padding-left: 1rem !important;
                    font-style: italic !important;
                    color: rgba(255, 255, 255, 0.8) !important;
                    margin: 1rem 0 !important;
                }
                .tiptap h1 {
                    font-size: 1.5rem !important;
                    font-weight: bold !important;
                    margin-top: 1.5rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .tiptap h2 {
                    font-size: 1.25rem !important;
                    font-weight: bold !important;
                    margin-top: 1.25rem !important;
                    margin-bottom: 0.5rem !important;
                }
            `
                }}
            />

            <input type='file' ref={fileInputRef} onChange={handleFileChange} accept='image/*' className='hidden' />

            <div className='flex flex-wrap items-center gap-1 border-b border-white/10 bg-white/5 p-1.5'>
                <button
                    type='button'
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn(
                        'cursor-pointer rounded-md p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:bg-white/20',
                        editor.isActive('bold') && 'bg-white/10 text-white'
                    )}
                    title='Bold'>
                    <Bold className='h-4 w-4' />
                </button>
                <button
                    type='button'
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn(
                        'cursor-pointer rounded-md p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:bg-white/20',
                        editor.isActive('italic') && 'bg-white/10 text-white'
                    )}
                    title='Italic'>
                    <Italic className='h-4 w-4' />
                </button>
                <button
                    type='button'
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={cn(
                        'cursor-pointer rounded-md p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:bg-white/20',
                        editor.isActive('underline') && 'bg-white/10 text-white'
                    )}
                    title='Underline'>
                    <Underline className='h-4 w-4' />
                </button>

                <div className='mx-1.5 h-4 w-[1px] bg-white/10' />

                <button
                    type='button'
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn(
                        'cursor-pointer rounded-md p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:bg-white/20',
                        editor.isActive('heading', { level: 1 }) && 'bg-white/10 text-white'
                    )}
                    title='Heading 1'>
                    <Heading1 className='h-4 w-4' />
                </button>
                <button
                    type='button'
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn(
                        'cursor-pointer rounded-md p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:bg-white/20',
                        editor.isActive('heading', { level: 2 }) && 'bg-white/10 text-white'
                    )}
                    title='Heading 2'>
                    <Heading2 className='h-4 w-4' />
                </button>
                <button
                    type='button'
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={cn(
                        'cursor-pointer rounded-md p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:bg-white/20',
                        editor.isActive('blockquote') && 'bg-white/10 text-white'
                    )}
                    title='Blockquote'>
                    <Quote className='h-4 w-4' />
                </button>

                <div className='mx-1.5 h-4 w-[1px] bg-white/10' />

                <button
                    type='button'
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn(
                        'cursor-pointer rounded-md p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:bg-white/20',
                        editor.isActive('bulletList') && 'bg-white/10 text-white'
                    )}
                    title='Bullet List'>
                    <List className='h-4 w-4' />
                </button>
                <button
                    type='button'
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn(
                        'cursor-pointer rounded-md p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:bg-white/20',
                        editor.isActive('orderedList') && 'bg-white/10 text-white'
                    )}
                    title='Numbered List'>
                    <ListOrdered className='h-4 w-4' />
                </button>

                <div className='mx-1.5 h-4 w-[1px] bg-white/10' />
                <button
                    type='button'
                    onClick={handleImageClick}
                    disabled={isUploading}
                    className='flex cursor-pointer items-center justify-center rounded-md p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:bg-white/20 disabled:pointer-events-none disabled:opacity-50'
                    title='Insert Image'>
                    {isUploading ? <Loader2 className='h-4 w-4 animate-spin' /> : <ImageIcon className='h-4 w-4' />}
                </button>

                <div className='mx-1.5 h-4 w-[1px] bg-white/10' />

                <button
                    type='button'
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className='cursor-pointer rounded-md p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:bg-white/20 disabled:pointer-events-none disabled:opacity-30'
                    title='Undo'>
                    <Undo className='h-4 w-4' />
                </button>
                <button
                    type='button'
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className='cursor-pointer rounded-md p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:bg-white/20 disabled:pointer-events-none disabled:opacity-30'
                    title='Redo'>
                    <Redo className='h-4 w-4' />
                </button>
                <button
                    type='button'
                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    className='cursor-pointer rounded-md p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:bg-white/20'
                    title='Clear Formatting'>
                    <RemoveFormatting className='h-4 w-4' />
                </button>
            </div>

            <EditorContent editor={editor} />
        </div>
    );
}
