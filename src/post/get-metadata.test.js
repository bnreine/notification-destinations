import getMetadata from './get-metadata'

test('get metadata new style input validation', () => {
    const metadata = getMetadata({phoneNumber: '+5548988016078'})
    expect(metadata.phoneNumber).toBe('+5548988016078')
})