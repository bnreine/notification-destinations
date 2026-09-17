import getConsentStatus from './get-consent-status.js'

test('false returns a null', () => {
    const consent = getConsentStatus({userConsented: false})
    expect(consent).toBe(null)
})

test('true returns consented', () => {
    const consent = getConsentStatus({userConsented: true})
    expect(consent).toBe('consented')
})