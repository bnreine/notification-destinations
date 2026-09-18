import { getDbPool } from '/opt/nodejs/db/connection.js';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import deleteAndCleanupTypeMapping from "./delete-and-cleanup-type-mapping.js";

const ajv = new Ajv();
addFormats(ajv);

const schema = {
    type: "object",
    properties: {
        destinationId: {
            type: "string",
            format: "uuid"
        }
    },
    required: ["destinationId"],
    additionalProperties: false
};

const validate = ajv.compile(schema);

export const handler = async (event) => {
    try {
        const userId = event?.requestContext?.authorizer?.jwt?.claims?.sub;
        const destinationId = event.pathParameters?.destinationId;

        if (!validate({destinationId})) {
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

        const destinationDeleteResponse = await dbPool.query(
            'Select * FROM "Destination" WHERE "userId" = $1 AND "id" = $2 AND "deleted" is not true',
            [userId, destinationId]
        );

        if (destinationDeleteResponse.rows.length === 0) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: {
                        message: 'Not found.',
                    },
                }),
            };
        }

        const deleteAndCleanup = deleteAndCleanupTypeMapping[destinationDeleteResponse.rows[0].channelType]

        await deleteAndCleanup({dbPool, userId, destinationId, oAuthConnectionId: destinationDeleteResponse.rows[0].oAuthConnectionId});

        return { statusCode: 204 };
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
