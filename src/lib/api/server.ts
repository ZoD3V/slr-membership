import { auth } from '@/auth';

import 'server-only';

export async function getAccessToken(): Promise<string | undefined> {
    const session = await auth();

    return (session?.user as { accessToken?: string } | undefined)?.accessToken;
}
