import { AU_STATE_CODES } from '@/constant/au-states';
import { MIN_PASSWORD_LENGTH } from '@/constant/password';
import { MIN_AGE_YEARS, isAdultDob } from '@/lib/dob';

import { email, literal, object, string, union, enum as zEnum } from 'zod';

export const SignInSchema = object({
    email: union([email('Invalid Email'), literal('SLRadmin')]),
    password: string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
});

export const SignUpSchema = object({
    name: string().min(1, 'Name is required'),
    email: email('Invalid Email'),
    password: string()
        .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
        .max(32, 'Password must be less than 32 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    state: zEnum(AU_STATE_CODES, { message: 'Select your state or territory' }),
    phone: string()
        .min(8, 'Enter a valid Australian phone number')
        .regex(/^[0-9 +()-]+$/, 'Only digits, spaces, +, -, () allowed'),
    dob: string()
        .min(1, 'Date of birth is required')
        .refine(isAdultDob, { message: `You must be at least ${MIN_AGE_YEARS} years old` })
});
