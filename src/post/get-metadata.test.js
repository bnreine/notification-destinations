import getMetadata from './get-metadata'
import oldBody from './__test__/old-body.js';
import mixedBody from './__test__/mixed-body.js';
import newBody from './__test__/new-body.js';

test('get metadata old style input validation', () => {
    const metadata = getMetadata(oldBody)
    expect(JSON.stringify(metadata)).toBe(JSON.stringify({phoneNumber:'+17165479999'}))
})

test('get metadata mixed style input validation where both  the old and the new fields are there', () => {
    const metadata = getMetadata(mixedBody)
    expect(JSON.stringify(metadata)).toBe(JSON.stringify({phoneNumber:'+5548988016078'}))
})

test('get metadata new style input validation', () => {
    const metadata = getMetadata(newBody)
    expect(JSON.stringify(metadata)).toBe(JSON.stringify({phoneNumber:'+5548988016078'}))
})