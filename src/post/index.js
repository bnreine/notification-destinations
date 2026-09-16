import { randomUUID } from 'node:crypto';
import { getDbPool } from '/opt/nodejs/db/connection.js';
import hal from 'halson';
import getConsentStatus from "./get-consent-status.js";
import getMetadata from "./get-metadata.js";
import validateInput from "./validate-input.js";

export const handler = async (event) => {
    try {
        const userId = event?.requestContext?.authorizer?.jwt?.claims?.sub;
        const body = JSON.parse(event.body);

        const isValidInput = validateInput(body);

        if (!isValidInput) {
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

        const consentStatus = getConsentStatus(body)
        const metadata = getMetadata(body)

        const {channelType, oAuthConnectionId = null  } = body

        const dbPool = await getDbPool('write_read_rds_db');
        const client = await dbPool.connect();

        let destinationResponse

        try {
            await client.query('BEGIN');

            const destinationId = randomUUID();
            const now = new Date()
            destinationResponse = await client.query(
                'INSERT INTO "Destination" ("id", "userId", "channelType", "createdAt", "metadata", "oAuthConnectionId","updatedAt") VALUES ($1, $2, $3,$4, $5,$6,$7) RETURNING *',
                [destinationId, userId, channelType, now, metadata, oAuthConnectionId, now ],
            );


            if(consentStatus){
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
                "updatedAt" = EXCLUDED."updatedAt"`, [consentId, destinationId, consentStatus, now, now ]
                );

                const consentEventId = randomUUID();

                await client.query(
                    `INSERT INTO "ConsentEvent" ("id","destinationId", "status", "createdAt")
     VALUES ($1, $2, $3, $4)`,
                    [consentEventId, destinationId, consentStatus, now]
                );
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

        const destinationItem = destinationResponse.rows[0];

        const destinationResource = {id: destinationItem.id, channelType: destinationItem.channelType, metadata: destinationItem.metadata, oAuthConnectionId: destinationItem.oAuthConnectionId, consentStatus};

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
