import { cache } from 'react';

import { API } from '../endpoints';
import { apiFetch, apiFetchPaginated } from '../http';

/**
 * The API stores whatever consent_type it is given — it does not validate the value —
 * so this union is the only guardrail against typos reaching the compliance record.
 */
export const CONSENT_TYPES = ['TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'MARKETING_EMAIL', 'MARKETING_SMS'] as const;

export type ConsentType = (typeof CONSENT_TYPES)[number];

/** Bump when the legal copy changes so past acceptances stay attributable. */
export const CONSENT_VERSION = '1.0';

export const CONSENT_LABELS: Record<ConsentType, string> = {
    TERMS_OF_SERVICE: 'Terms & Conditions',
    PRIVACY_POLICY: 'Privacy Policy',
    MARKETING_EMAIL: 'Marketing email',
    MARKETING_SMS: 'Marketing SMS'
};

/** Legal acceptances are captured at sign-up and cannot be toggled off from the UI. */
export const LEGAL_CONSENTS: ConsentType[] = ['TERMS_OF_SERVICE', 'PRIVACY_POLICY'];

export const MARKETING_CONSENTS: ConsentType[] = ['MARKETING_EMAIL', 'MARKETING_SMS'];

export interface ConsentInput {
    consent_type: ConsentType;
    agreed: boolean;
    version?: string;
}

export interface ConsentRecord {
    id: string;
    user_id: string;
    consent_type: string;
    agreed: boolean;
    version: string | null;
    ip_address: string | null;
    user_agent: string | null;
    metadata: unknown;
    created_at: string;
    updated_at: string;
}

/** Shape embedded in the admin member payloads: no id, no user_id. */
export interface MemberConsentSummary {
    consent_type: string;
    agreed: boolean;
    version: string | null;
    updated_at: string;
    ip_address?: string | null;
    user_agent?: string | null;
    metadata?: unknown;
}

export interface AdminConsentRecord extends ConsentRecord {
    user?: { id: string; full_name: string; email: string } | null;
}

export const getMyConsents = cache((token: string) =>
    apiFetch<ConsentRecord[]>(API.consents.me, { token, cache: 'no-store' })
);

export const updateMyConsents = (token: string, consents: ConsentInput[]) =>
    apiFetch<ConsentRecord[]>(API.consents.update, { method: 'POST', body: { consents }, token });

export interface AdminConsentQuery {
    user_id?: string;
    consent_type?: ConsentType;
    agreed?: boolean;
    page?: number;
    per_page?: number;
}

export interface PageMeta {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
}

export const getAdminConsents = cache((token: string, query: AdminConsentQuery = {}) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== '') params.set(key, String(value));
    }
    const qs = params.toString();

    return apiFetchPaginated<AdminConsentRecord[], PageMeta>(`${API.admin.consents}${qs ? `?${qs}` : ''}`, {
        token,
        cache: 'no-store'
    });
});

/** Latest state per type, so a UI never has to reason about duplicate rows. */
export function consentMap(records: { consent_type: string; agreed: boolean }[]): Record<string, boolean> {
    return records.reduce<Record<string, boolean>>((map, record) => {
        map[record.consent_type] = record.agreed;

        return map;
    }, {});
}

/**
 * Registration consents. Terms and Privacy ride on the single required checkbox, so both
 * are recorded with the version the member actually accepted.
 */
export function signUpConsents(agreedToLegal: boolean, marketingEmail: boolean): ConsentInput[] {
    return [
        { consent_type: 'TERMS_OF_SERVICE', agreed: agreedToLegal, version: CONSENT_VERSION },
        { consent_type: 'PRIVACY_POLICY', agreed: agreedToLegal, version: CONSENT_VERSION },
        { consent_type: 'MARKETING_EMAIL', agreed: marketingEmail, version: CONSENT_VERSION }
    ];
}

/** 'in' | 'out' | 'unset' — 'unset' means the member has no record for that type yet. */
export function marketingEmailState(consents: { consent_type: string; agreed: boolean }[] | undefined): string {
    const record = consents?.find((c) => c.consent_type === 'MARKETING_EMAIL');
    if (!record) return 'unset';

    return record.agreed ? 'in' : 'out';
}

export const isKnownConsent = (value: string): value is ConsentType => CONSENT_TYPES.includes(value as ConsentType);
