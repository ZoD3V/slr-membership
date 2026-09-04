import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CONSENT_LABELS, type MemberConsentSummary, isKnownConsent } from '@/lib/api/resources/consents';
import { formatDateTime } from '@/lib/member';

export function MemberConsentsCard({ consents }: { consents: MemberConsentSummary[] }) {
    return (
        <Card>
            <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Consents</CardTitle>
            </CardHeader>
            <CardContent>
                {consents.length === 0 ? (
                    <p className='text-muted-foreground text-sm'>No consent records for this member.</p>
                ) : (
                    <div className='overflow-x-auto rounded-md border'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='text-muted-foreground font-medium'>Type</TableHead>
                                    <TableHead className='text-muted-foreground font-medium'>Status</TableHead>
                                    <TableHead className='text-muted-foreground font-medium'>Version</TableHead>
                                    <TableHead className='text-muted-foreground font-medium'>Updated</TableHead>
                                    <TableHead className='text-muted-foreground font-medium'>IP</TableHead>
                                    <TableHead className='text-muted-foreground font-medium'>User agent</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {consents.map((consent) => (
                                    <TableRow key={`${consent.consent_type}-${consent.updated_at}`}>
                                        <TableCell className='font-medium'>
                                            {isKnownConsent(consent.consent_type) ? (
                                                CONSENT_LABELS[consent.consent_type]
                                            ) : (
                                                // The API stores unknown types verbatim — show the raw value.
                                                <span className='text-slr-dim font-mono text-xs'>
                                                    {consent.consent_type}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={consent.agreed ? 'default' : 'secondary'}>
                                                {consent.agreed ? 'Agreed' : 'Declined'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='tabular-nums'>{consent.version ?? '-'}</TableCell>
                                        <TableCell className='whitespace-nowrap tabular-nums'>
                                            {formatDateTime(consent.updated_at)}
                                        </TableCell>
                                        <TableCell className='font-mono text-xs tabular-nums'>
                                            {consent.ip_address ?? '-'}
                                        </TableCell>
                                        <TableCell className='text-muted-foreground max-w-64 truncate text-xs'>
                                            {consent.user_agent ?? '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
