'use client';

import { useTransition } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ImageUploadField } from '@/components/common/image-upload-field';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Heading from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { CreateDiscountPayload } from '@/lib/api/resources/discounts';
import { zodResolver } from '@hookform/resolvers/zod';

import { createDiscountAction, updateDiscountAction } from '../actions';
import { uploadDiscountAsset } from '../upload-asset';
import { ArrowLeft, Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    partnerName: z.string().min(1, 'Partner name is required'),
    category: z.string().min(1, 'Category is required'),
    description: z.string().optional(),
    code: z.string().optional(),
    terms: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    logoUrl: z.string().optional(),
    websiteUrl: z.string().optional(),
    mapsUrl: z.string().optional(),
    isFeatured: z.boolean()
});

type FormValues = z.infer<typeof formSchema>;

interface DiscountFormProps {
    initialData?: {
        id: string;
        title: string;
        partnerName: string;
        category: string;
        description: string;
        terms: string;
        code: string;
        thumbnailUrl: string;
        logoUrl: string;
        websiteUrl: string;
        mapsUrl: string;
        isFeatured: boolean;
    };
}

export function DiscountForm({ initialData }: DiscountFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const title = initialData ? 'Edit Discount' : 'New Discount';
    const description = initialData ? 'Update this partner discount.' : 'Add a partner discount to the platform.';

    const defaultValues: FormValues = initialData
        ? {
              title: initialData.title,
              partnerName: initialData.partnerName,
              category: initialData.category,
              description: initialData.description,
              code: initialData.code,
              terms: initialData.terms,
              thumbnailUrl: initialData.thumbnailUrl,
              logoUrl: initialData.logoUrl,
              websiteUrl: initialData.websiteUrl,
              mapsUrl: initialData.mapsUrl,
              isFeatured: initialData.isFeatured
          }
        : {
              title: '',
              partnerName: '',
              category: '',
              description: '',
              code: '',
              terms: '',
              thumbnailUrl: '',
              logoUrl: '',
              websiteUrl: '',
              mapsUrl: '',
              isFeatured: false
          };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues
    });

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            const payload: CreateDiscountPayload = {
                title: values.title,
                partnerName: values.partnerName,
                category: values.category,
                description: values.description ?? '',
                code: values.code ?? '',
                terms: values.terms ?? '',
                thumbnailUrl: values.thumbnailUrl ?? '',
                logoUrl: values.logoUrl ?? '',
                websiteUrl: values.websiteUrl ?? '',
                mapsUrl: values.mapsUrl ?? '',
                isFeatured: values.isFeatured
            };

            try {
                const res = initialData
                    ? await updateDiscountAction(initialData.id, payload)
                    : await createDiscountAction(payload);

                if (res.ok) {
                    toast.success(res.message);
                    router.push('/dashboard/discounts');
                } else {
                    toast.error(res.code ? `${res.message} (${res.code})` : res.message);
                }
            } catch {
                // The server action can reject instead of resolving with
                // { ok: false } — without this, the button is left stuck and
                // the admin gets no feedback that the save failed.
                toast.error('Something went wrong. Please try again.');
            }
        });
    };

    return (
        <div className='mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6'>
            <div className='flex items-center gap-4'>
                <Button variant='outline' size='icon' asChild>
                    <Link href='/dashboard/discounts'>
                        <ArrowLeft className='h-4 w-4' />
                    </Link>
                </Button>
                <Heading title={title} description={description} />
            </div>

            <div className='rounded-xl border border-white/10 bg-white/5 p-6'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-6'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='title'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder='20% off at …' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='partnerName'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Partner name</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Partner Pty Ltd' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='category'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Dining, Travel, …' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='code'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder='SLR-XXXX' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name='description'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Short description</FormLabel>
                                    <FormControl>
                                        <Textarea rows={3} placeholder='Optional details' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='terms'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Long description (merchant + how to claim)</FormLabel>
                                    <FormControl>
                                        <Textarea rows={5} placeholder='Merchant info + how to claim' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='thumbnailUrl'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thumbnail</FormLabel>
                                        <FormControl>
                                            <ImageUploadField
                                                value={field.value}
                                                onChange={field.onChange}
                                                onUpload={uploadDiscountAsset}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='logoUrl'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Logo</FormLabel>
                                        <FormControl>
                                            <ImageUploadField
                                                value={field.value}
                                                onChange={field.onChange}
                                                onUpload={uploadDiscountAsset}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='websiteUrl'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder='https://…' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='mapsUrl'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maps URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder='https://maps.google.com/…' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name='isFeatured'
                            render={({ field }) => (
                                <FormItem className='flex items-center gap-2'>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel className='mt-0!'>Featured</FormLabel>
                                </FormItem>
                            )}
                        />

                        <div className='flex justify-end gap-3 border-t border-white/10 pt-6'>
                            <Button type='button' variant='outline' asChild>
                                <Link href='/dashboard/discounts'>Cancel</Link>
                            </Button>
                            <Button type='submit' disabled={isPending}>
                                {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : null}
                                {initialData ? 'Save Changes' : 'Create Discount'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
