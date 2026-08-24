import { API } from '../endpoints';
import { apiFetch } from '../http';

// POST /api/v1/contact — public (no auth), rate-limited 3 req/min per IP.
export interface ContactPayload {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

export interface ContactSubmission {
    ticket_id?: string | number;
    submission_id?: string;
    reference_id?: string;
}

export const submitContact = (payload: ContactPayload) =>
    apiFetch<ContactSubmission>(API.contact.submit, {
        method: 'POST',
        body: {
            first_name: payload.firstName,
            last_name: payload.lastName,
            email: payload.email,
            phone: payload.phone || undefined,
            subject: payload.subject,
            message: payload.message
        }
    });
