import {randomUUID} from "node:crypto";

const smsDeleteAndCleanup = async ({dbPool, userId, destinationId}) => {
    const client = await dbPool.connect();

    try {
        await client.query('BEGIN');

        const now = new Date()
        await client.query(
            'Update "Destination" set "deleted" = true, "updatedAt" = $1 WHERE "userId" = $2 AND "id" = $3',
            [now, userId, destinationId]
        );

        await client.query(
            'DELETE FROM "NotificationPreference" where "destinationId" = $1',
            [destinationId]
        );


        const consentUpdateResponse = await client.query(
            `Update "Consent" set "status" = 'revoked', "updatedAt" = $1 where "destinationId" = $2 returning *`,
            [now, destinationId]
        );

        if(consentUpdateResponse.rows.length > 0){
            const consentEventId = randomUUID();
            await client.query(
                `INSERT INTO "ConsentEvent" ("id","destinationId", "status", "createdAt")
     VALUES ($1, $2, $3, $4)`,
                [consentEventId, destinationId, 'revoked', now]
            );
        }

        const verifyUpdateResponse = await client.query(
            `Update "Verify" set "status" = 'revoked', "updatedAt" = $1 where "destinationId" = $2 returning *`,
            [now, destinationId]
        );

        if(verifyUpdateResponse.rows.length > 0){
            const verifyEventId = randomUUID();
            await client.query(
                `INSERT INTO "VerifyEvent" ("id","verifyId", "status", "createdAt")
     VALUES ($1, $2, $3, $4)`,
                [verifyEventId, verifyUpdateResponse.rows[0].id, 'revoked', now]
            );
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export default smsDeleteAndCleanup;