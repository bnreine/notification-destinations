import getConsentStatus from './get-consent-status.js'
import happyBody from './__test__/happy-body.js';

test('get metadata new style input validation', () => {
    const consent = getConsentStatus(happyBody)
    expect(consent).toBe(null)
})