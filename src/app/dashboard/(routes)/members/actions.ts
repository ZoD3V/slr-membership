'use server';

import { revalidatePath } from 'next/cache';

import type { AuStateCode } from '@/constant/au-states';
import {
    type AdminMemberProfilePayload,
    type AdminMemberProfileUpdate,
    type AdminMemberStatusUpdate,
    type AdminMemberStatusValue,
    deleteAdminMember,
    updateAdminMemberProfile,
    updateAdminMemberStatus
} from '@/lib/api/resources/admin';
import { type MemberSubTierId, type MembershipRecord, changeMemberTier } from '@/lib/api/resources/memberships';
import { type AdminUserRecord, updateUser } from '@/lib/api/resources/users';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';

export type ActionError = {
    ok: false;
    message: string;
    status?: number;
    code?: string | null;
    requestId?: string | null;
};

export type ActionResult<T> = { ok: true; data: T; message: string } | ActionError;

function toActionError(error: unknown): ActionError {
    if (error instanceof ApiError) {
        const payload = error.payload as { code?: string; requestId?: string } | undefined;

        return {
            ok: false,
            message: error.message,
            status: error.status,
            code: payload?.code ?? null,
            requestId: payload?.requestId ?? null
        };
    }

    return { ok: false, message: 'Something went wrong. Please try again.' };
}

export async function deleteMemberAction(userId: string) {
    const token = await getAccessToken();
    if (!token) throw new Error('Authentication token missing.');

    await deleteAdminMember(userId, token);
    revalidatePath('/dashboard/members');
}

export async function updateMemberStatusAction(
    userId: string,
    status: AdminMemberStatusValue
): Promise<ActionResult<AdminMemberStatusUpdate>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await updateAdminMemberStatus(userId, status, token);
        revalidatePath(`/dashboard/members/${userId}`);
        revalidatePath('/dashboard/members');

        return { ok: true, data, message: 'Member status updated.' };
    } catch (error) {
        return toActionError(error);
    }
}

export async function changeMemberTierAction(
    userId: string,
    subTierId: MemberSubTierId
): Promise<ActionResult<MembershipRecord>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await changeMemberTier(userId, subTierId, token);
        revalidatePath(`/dashboard/members/${userId}`);
        revalidatePath('/dashboard/members');

        return { ok: true, data, message: 'Member tier updated.' };
    } catch (error) {
        return toActionError(error);
    }
}

/**
 * Edits a member's profile details. The endpoint merges, so the caller passes
 * only the fields the admin actually changed — that also keeps `email` out of
 * the body on an unrelated edit, which matters because resending the member's
 * own address is fine but any collision answers 409.
 */
export async function updateMemberProfileAction(
    userId: string,
    payload: AdminMemberProfilePayload
): Promise<ActionResult<AdminMemberProfileUpdate>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    if (Object.keys(payload).length === 0) {
        return { ok: false, message: 'Nothing to update.' };
    }

    try {
        const data = await updateAdminMemberProfile(userId, payload, token);
        revalidatePath(`/dashboard/members/${userId}`);
        revalidatePath('/dashboard/members');

        return { ok: true, data, message: 'Member profile updated.' };
    } catch (error) {
        return toActionError(error);
    }
}

/**
 * Draw-pool `state` used to move via PATCH /users/{id} through its own control.
 * `PUT /admin/members/{userId}` now sets it alongside the rest of the profile,
 * so the edit form owns it and there is no second place to change it.
 */
export async function changeMemberStateAction(
    userId: string,
    state: AuStateCode
): Promise<ActionResult<AdminUserRecord>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await updateUser(userId, { state }, token);
        revalidatePath(`/dashboard/members/${userId}`);
        revalidatePath('/dashboard/members');

        return { ok: true, data, message: 'Member state updated.' };
    } catch (error) {
        return toActionError(error);
    }
}
