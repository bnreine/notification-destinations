import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv();
addFormats(ajv);

const schema = {
    type: "object",
    properties: {
        phoneNumber: {
            "type": "string",
            "pattern": "^\\+[1-9]\\d{1,14}$"
        },
        channelType: {
            type: "string",
            enum: ["whatsapp", "sms"]
        },
        userConsented: {
            type: "boolean"
        }
    },
    required: ["channelType", "userConsented", "phoneNumber"],
    additionalProperties: false
};

const validate = ajv.compile(schema);

const validateInput =  (body) => {
    return validate(body)
}

export default validateInput;