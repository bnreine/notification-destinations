import { randomUUID } from 'node:crypto';
import { getDbPool } from '/opt/nodejs/db/connection.js';
import hal from 'halson';

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
        metadata: {
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
        status: {
            type: "string",
            enum: ["active", "pending", "revoked", "inactive"]
        }
    },
    required: ["channelType"],
    additionalProperties: false
};

const validate = ajv.compile(schema);

export const handler = async (event) => {
    try {
        const userId = event?.requestContext?.authorizer?.jwt?.claims?.sub;
        const body = JSON.parse(event.body);

        if (!validate({...body})) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: {
                        message: 'Validation failed.',
                        details: validate.errors?.map((error) => error.message),
                    },
                }),
            };
        }

        const dbPool = await getDbPool('write_read_rds_db');

        const {channelType, metadata = {}, oAuthConnectionId = null, status = "inactive" } = body



        const client = await dbPool.connect();
        let destinationResponse

        try {
            await client.query('BEGIN');

            const destinationId = randomUUID();
            const now = new Date()
            destinationResponse = await client.query(
                'INSERT INTO "Destination" ("id", "userId", "channelType", "createdAt", "metadata", "oAuthConnectionId") VALUES ($1, $2, $3,$4, $5,$6) RETURNING *',
                [destinationId, userId, channelType, now, metadata, oAuthConnectionId ],
            );

            const consentId = randomUUID();

            await client.query(
                `INSERT INTO "Consent" (
                "id",
                "destinationId",
                "status",
                "createdAt",
                       "updatedAt"
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                    $5
            )
            ON CONFLICT ("destinationId")
            DO UPDATE SET
            "status" = EXCLUDED."status",
                "updatedAt" = EXCLUDED."updatedAt"`, [consentId, destinationId, status, now, now ]
            );

            const consentEventId = randomUUID();

            await client.query(
                `INSERT INTO "ConsentEvent" ("id","destinationId", "status", "createdAt")
     VALUES ($1, $2, $3, $4)`,
                [consentEventId, destinationId, status, now]
            );

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

        const destinationItem = destinationResponse.rows[0];

        const destinationResource = {id: destinationItem.id, channelType: destinationItem.channelType, metadata: destinationItem.metadata, oAuthConnectionId: destinationItem.oAuthConnectionId, status: "active"};

        const { host, 'x-forwarded-proto': protocol } = event.headers;
        const resourceHref = `${protocol}://${host}/destinations/${destinationResource.id}`;
        const returnResource = hal(destinationResource).addLink('self', resourceHref);

        return {
            statusCode: 201,
            headers: {
                'Location': resourceHref,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(returnResource),
        };

    } catch (e) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: { message: e.message },
            }),
        };
    }
};
