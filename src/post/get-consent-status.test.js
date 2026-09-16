import getConsentStatus from './get-consent-status.js'
import oldBody from './__test__/old-body.js';
import mixedBody from './__test__/mixed-body.js';
import newBody from './__test__/new-body.js';

test('get metadata old style input validation', () => {
    const consent = getConsentStatus(oldBody)
    expect(consent).toBe('active')
})

test('get metadata mixed style input validation where both  the old and the new fields are there', () => {
    const consent = getConsentStatus(mixedBody)
    expect(consent).toBe(null)
})

test('get metadata new style input validation', () => {
    const consent = getConsentStatus(newBody)
    expect(consent).toBe(null)
})