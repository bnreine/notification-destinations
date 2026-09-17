import getMetadata from './get-metadata'
import happyBody from './__test__/happy-body.js';

test('get metadata new style input validation', () => {
    const metadata = getMetadata(happyBody)
    expect(JSON.stringify(metadata)).toBe(JSON.stringify({phoneNumber:'+5548988016078'}))
})