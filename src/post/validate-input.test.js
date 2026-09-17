import validateInput from './validate-input';
import happyBody from './__test__/happy-body.js';
import missingPhoneNumberBody from './__test__/missing-phone-number-body.js';
import missingChannelTypeBody from './__test__/missing-channel-type-body.js';
import missingUserConsentedBody from './__test__/missing-user-consented-body.js';
import invalidChannelTypeBody from './__test__/invalid-channel-type-body.js';
import channelTypeWrongTypeBody from './__test__/channel-type-wrong-type-body.js';
import userConsentedWrongTypeBody from './__test__/user-consented-wrong-type-body.js';
import phoneNumberWrongTypeBody from './__test__/phone-number-wrong-type-body.js';
import phoneNumberWithoutPlusBody from './__test__/phone-number-without-plus-body.js';
import phoneNumberTooShortBody from './__test__/phone-number-too-short-body.js';
import phoneNumberTooLongBody from './__test__/phone-number-too-long-body.js';
import phoneNumberLeadingZeroBody from './__test__/phone-number-leading-zero-body.js';
import tooManyFieldsBody from './__test__/too-many-fields-body.js';

test('happy path for validation', () => {
    const validInput = validateInput(happyBody)
    expect(validInput).toBe(true)
})

test('rejects body missing phoneNumber', () => {
    const validInput = validateInput(missingPhoneNumberBody)
    expect(validInput).toBe(false)
})

test('rejects body missing channelType', () => {
    const validInput = validateInput(missingChannelTypeBody)
    expect(validInput).toBe(false)
})

test('rejects body missing userConsented', () => {
    const validInput = validateInput(missingUserConsentedBody)
    expect(validInput).toBe(false)
})

test('rejects body with channelType not in enum', () => {
    const validInput = validateInput(invalidChannelTypeBody)
    expect(validInput).toBe(false)
})

test('rejects body with channelType of the wrong type', () => {
    const validInput = validateInput(channelTypeWrongTypeBody)
    expect(validInput).toBe(false)
})

test('rejects body with userConsented of the wrong type', () => {
    const validInput = validateInput(userConsentedWrongTypeBody)
    expect(validInput).toBe(false)
})

test('rejects body with phoneNumber of the wrong type', () => {
    const validInput = validateInput(phoneNumberWrongTypeBody)
    expect(validInput).toBe(false)
})

test('rejects body with phoneNumber missing plus prefix', () => {
    const validInput = validateInput(phoneNumberWithoutPlusBody)
    expect(validInput).toBe(false)
})

test('rejects body with phoneNumber that is too short', () => {
    const validInput = validateInput(phoneNumberTooShortBody)
    expect(validInput).toBe(false)
})

test('rejects body with phoneNumber that is too long', () => {
    const validInput = validateInput(phoneNumberTooLongBody)
    expect(validInput).toBe(false)
})

test('rejects body with phoneNumber starting with plus zero', () => {
    const validInput = validateInput(phoneNumberLeadingZeroBody)
    expect(validInput).toBe(false)
})

test('rejects body with more fields than the three allowed', () => {
    const validInput = validateInput(tooManyFieldsBody)
    expect(validInput).toBe(false)
})
