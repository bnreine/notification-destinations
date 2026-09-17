import validateInput from './validate-input';
import happyBody from './__test__/happy-body.js';

test('happy path for validation', () => {
    const validInput = validateInput(happyBody)
    expect(validInput).toBe(true)
})