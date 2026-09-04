import { Suspense } from 'react';

import Link from 'next/link';

import DashboardEmptyState from '@/app/dashboard/_components/dashboard-empty-state';
import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { type AdminMemberListItem, getAdminMembers } from '@/lib/api/resources/admin';
import {
    type AdminConsentRecord,
    type ConsentType,
    getAdminConsents,
    isKnownConsent
} from '@/lib/api/resources/consents';
import { getAccessToken } from '@/lib/api/server';

import { ConsentFilters } from './_components/consent-filters';
import { type ConsentRow, ConsentsClient } from './consents-client';
import { CircleAlert, Users } from 'lucide-react';

const PER_PAGE = 20;

/** The consent API only filters by user_id, so an email or name is resolved through the member search first. */
const MATCH_LIMIT = 10;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SearchParams = { consent_type?: string; agreed?: string; member?: string; page?: string };

export default async function ConsentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const { consent_type, agreed, member, page } = await searchParams;
    const token = await getAccessToken();
    const currentPage = Math.max(1, Number(page) || 1);
    const term = member?.trim() ?? '';

    let records: AdminConsentRecord[] = [];
    let total = 0;
    let matches: AdminMemberListItem[] = [];
    let userId: string | undefined;
    let unresolved = false;
    let failed = false;

    if (token) {
        try {
            if (term) {
                if (UUID.test(term)) {
                    userId = term;
                } else {
                    matches = await getAdminMembers(token, { search: term, perPage: MATCH_LIMIT });
                    if (matches.length === 1) userId = matches[0].user_id;
                    else unresolved = true;
                }
            }

            if (!unresolved) {
                const result = await getAdminConsents(token, {
                    consent_type: isKnownConsent(consent_type ?? '') ? (consent_type as ConsentType) : undefined,
                    agreed: agreed === 'true' ? true : agreed === 'false' ? false : undefined,
                    user_id: userId,
                    page: currentPage,
                    per_page: PER_PAGE
                });
                records = result.data;
                total = result.meta?.total ?? result.data.length;
            }
        } catch (error) {
            handleApiAuthError(error);
            failed = true;
        }
    }

    const rows: ConsentRow[] = records.map((record) => ({
        id: record.id,
        user_id: record.user_id,
        full_name: record.user?.full_name ?? '-',
        email: record.user?.email ?? record.user_id,
        consent_type: record.consent_type,
        agreed: record.agreed,
        version: record.version,
        updated_at: record.updated_at,
        ip_address: record.ip_address
    }));

    return (
        <DashboardPageShell>
            <Heading
                title='Consents'
                description='Current consent record per member — what was agreed, which version, and from where. Records are updated in place, not appended.'
            />

            <Suspense fallback={null}>
                <ConsentFilters />
            </Suspense>

            {unresolved && matches.length === 0 ? (
                <DashboardEmptyState
                    icon={CircleAlert}
                    title='No member found'
                    description={`Nothing matches "${term}". Search by email, name, or paste a user ID.`}
                />
            ) : unresolved ? (
                <Card>
                    <CardContent className='space-y-1 py-2'>
                        <p className='text-muted-foreground py-2 text-sm'>
                            <Users className='mr-1.5 inline size-4 align-text-bottom' />
                            {matches.length}
                            {matches.length === MATCH_LIMIT ? '+' : ''} members match &ldquo;{term}&rdquo;. Pick one to
                            see their consents.
                        </p>
                        {matches.map((match) => (
                            <Link
                                key={match.user_id}
                                href={`/dashboard/consents?member=${encodeURIComponent(match.user_id)}`}
                                className='hover:bg-muted -mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2'>
                                <span>
                                    <span className='block text-sm font-medium text-white'>{match.full_name}</span>
                                    <span className='text-slr-muted block text-xs'>{match.email}</span>
                                </span>
                                <span className='text-slr-dim text-xs uppercase'>{match.tier}</span>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            ) : (
                <ConsentsClient
                    rows={rows}
                    page={currentPage}
                    total={total}
                    perPage={PER_PAGE}
                    query={{ consent_type, agreed, member: term }}
                    failed={failed}
                />
            )}
        </DashboardPageShell>
    );
}
