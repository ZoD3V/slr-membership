import { CONSENT_VERSION, consentMap, isKnownConsent, marketingEmailState, signUpConsents } from './consents';
import { describe, expect, it } from 'vitest';

describe('signUpConsents', () => {
    it('records terms and privacy from the single required checkbox', () => {
        const consents = signUpConsents(true, false);

        expect(consents).toEqual([
            { consent_type: 'TERMS_OF_SERVICE', agreed: true, version: CONSENT_VERSION },
            { consent_type: 'PRIVACY_POLICY', agreed: true, version: CONSENT_VERSION },
            { consent_type: 'MARKETING_EMAIL', agreed: false, version: CONSENT_VERSION }
        ]);
    });

    it('keeps marketing independent of the legal consent', () => {
        expect(signUpConsents(true, true).find((c) => c.consent_type === 'MARKETING_EMAIL')?.agreed).toBe(true);
        expect(signUpConsents(false, true).find((c) => c.consent_type === 'TERMS_OF_SERVICE')?.agreed).toBe(false);
    });
});

describe('consentMap', () => {
    it('reduces records to the latest flag per type', () => {
        expect(
            consentMap([
                { consent_type: 'MARKETING_EMAIL', agreed: false },
                { consent_type: 'TERMS_OF_SERVICE', agreed: true }
            ])
        ).toEqual({ MARKETING_EMAIL: false, TERMS_OF_SERVICE: true });
    });
});

describe('marketingEmailState', () => {
    it('separates opted out from never asked', () => {
        expect(marketingEmailState([{ consent_type: 'MARKETING_EMAIL', agreed: true }])).toBe('in');
        expect(marketingEmailState([{ consent_type: 'MARKETING_EMAIL', agreed: false }])).toBe('out');
        expect(marketingEmailState([{ consent_type: 'TERMS_OF_SERVICE', agreed: true }])).toBe('unset');
        expect(marketingEmailState(undefined)).toBe('unset');
    });
});

describe('isKnownConsent', () => {
    it('rejects types the API would otherwise store verbatim', () => {
        expect(isKnownConsent('MARKETING_SMS')).toBe(true);
        expect(isKnownConsent('NONSENSE')).toBe(false);
    });
});
