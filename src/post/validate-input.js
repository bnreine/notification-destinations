import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv();
addFormats(ajv);

const schema = {
    type: "object",
    properties: {
        oAuthConnectionId: {
            type: "string",
            format: "uuid"
        },
        phoneNumber: { // this is the new top level prop we should have client side
            "type": "string",
            "pattern": "^\\+[1-9]\\d{1,14}$"
        },
        metadata: { // get rid of this when the other one is working properly
            type: "object",
            properties: {
                phoneNumber: {
                    "type": "string",
                    "pattern": "^\\+[1-9]\\d{1,14}$"
                }
            },
            additionalProperties: false
        },
        channelType: {
            type: "string",
            enum: ["whatsapp", "sms"]
        },
        consentStatus: { // this is the old thing that is wonky and not client perspective
            type: "string",
            enum: ["active", "inactive"] // these are the only fields from the client right now, so restict those at least for now
        },
        userConsented: { // this is a better client name for this thing
            type: "boolean"
        }
    },
    required: ["channelType"],
    additionalProperties: false
};

const validate = ajv.compile(schema);

const validateInput =  (body) => {
    return validate(body)
}

export default validateInput;