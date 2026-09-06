/**
 * Australian phone helpers.
 *
 * The BENY add-on is activated by hand in BENY's own portal using the member's phone number,
 * so a badly formatted number means the member pays and never gets access. The PRD asks for
 * +61 validation on that form specifically — this keeps the rule in one place.
 */

/** Digits only, with a leading "+" preserved so 0011/+61 prefixes can be told apart. */
const clean = (value: string): string => value.replace(/[^\d+]/g, '');

/** Mobiles are 04xxxxxxxx; landlines and 1300/1800 services are the other accepted shapes. */
const LOCAL = /^0[2-478]\d{8}$/;
const INTERNATIONAL = /^\+61[2-478]\d{8}$/;
const SERVICE = /^1[38]00\d{6}$/;

export function isAuPhone(value: string): boolean {
    const digits = clean(value);

    return LOCAL.test(digits) || INTERNATIONAL.test(digits) || SERVICE.test(digits);
}

/** "0412 345 678" -> "+61412345678". Returns the cleaned input when it is not a local number. */
export function toAuE164(value: string): string {
    const digits = clean(value);
    if (LOCAL.test(digits)) return `+61${digits.slice(1)}`;

    return digits;
}

export const AU_PHONE_MESSAGE = 'Enter a valid Australian phone number, e.g. 0412 345 678';
