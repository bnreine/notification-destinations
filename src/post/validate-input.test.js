import validateInput from './validate-input';
import oldBody from './__test__/old-body.js';
import mixedBody from './__test__/mixed-body.js';
import newBody from './__test__/new-body.js';

test('validate old style input validation', () => {
    const validInput = validateInput(oldBody)
    expect(validInput).toBe(true)
})

test('validate mixed style input validation where both  the old and the new fields are there', () => {
    const validInput = validateInput(mixedBody)
    expect(validInput).toBe(true)
})

test('validate new style input validation', () => {
    const validInput = validateInput(newBody)
    expect(validInput).toBe(true)
})