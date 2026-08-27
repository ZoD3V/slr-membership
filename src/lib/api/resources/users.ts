import type { AuStateCode } from '@/constant/au-states';

import { API } from '../endpoints';
import { apiFetch } from '../http';

export interface UserUpdatePayload {
    state?: AuStateCode;
}

export interface AdminUserRecord {
    id?: string;
    state?: string | null;
}

export const updateUser = (userId: string, body: UserUpdatePayload, token: string) =>
    apiFetch<AdminUserRecord>(API.users.update(userId), { method: 'PATCH', body, token });

export interface MyProfileUpdatePayload {
    fullName?: string;
    phone?: string;
    dob?: string;
}

export interface MyProfileRecord {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    state: string | null;
    dob: string | null;
}

export const updateMyProfile = (body: MyProfileUpdatePayload, token: string) =>
    apiFetch<MyProfileRecord>(API.users.me, { method: 'PATCH', body, token });
