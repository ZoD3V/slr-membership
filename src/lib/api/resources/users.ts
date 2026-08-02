import type { AuStateCode } from '@/constant/au-states';

import { API } from '../endpoints';
import { apiFetch } from '../http';

// PATCH /users/{id} — admin user update. Used for the member's geographic `state`
// (the draw-pool state half; tier/sub-tier goes through /memberships/change-tier).
// Verified: PATCH { state: "NSW" } → 200 "User updated.", persists.
export interface UserUpdatePayload {
    state?: AuStateCode;
}

export interface AdminUserRecord {
    id?: string;
    state?: string | null;
}

/** Admin: update a member's record (used for the draw-pool `state` half). */
export const updateUser = (userId: string, body: UserUpdatePayload, token: string) =>
    apiFetch<AdminUserRecord>(API.users.update(userId), { method: 'PATCH', body, token });

// `dob` takes a date-only string and comes back coerced to an ISO date-time.
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

/** Member self-service: update name / phone / dob (`dob` takes a date-only string). */
export const updateMyProfile = (body: MyProfileUpdatePayload, token: string) =>
    apiFetch<MyProfileRecord>(API.users.me, { method: 'PATCH', body, token });
