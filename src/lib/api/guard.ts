import { redirect } from 'next/navigation';

import { ApiError } from './types';
import 'server-only';

export function handleApiAuthError(error: unknown): void {
    if (error instanceof ApiError && error.status === 401) {
        redirect('/api/auth/logout');
    }
}
