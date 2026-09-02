const slackDeleteAndCleanup = async ({dbPool, userId, destinationId, oAuthConnectionId}) => {
    const client = await dbPool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            'Delete FROM "Destination" WHERE "userId" = $1 AND "id" = $2',
            [userId, destinationId]
        );

        await client.query(
            'DELETE FROM "NotificationPreference" where "destinationId" = $1',
            [destinationId]
        );


        await client.query(
            `
            Delete from "OAuthConnection" where "id" = $1
            `,
            [
                oAuthConnectionId,
            ]
        );

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export default slackDeleteAndCleanup;