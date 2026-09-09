const slackDeleteAndCleanup = async ({dbPool, userId, destinationId, oAuthConnectionId}) => {
    const client = await dbPool.connect();

    let accessToken = ''
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


        const destinationsLeftResponse = await client.query(
            'Select * FROM "Destination" WHERE "userId" = $1 AND "oAuthConnectionId" = $2',
            [userId, oAuthConnectionId]
        );

        if(!destinationsLeftResponse.rows.length) {
            const authDeleteResponse = await client.query(
                `
            Delete from "OAuthConnection" where "id" = $1 returning *
            `,
                [
                    oAuthConnectionId,
                ]
            );

            accessToken = authDeleteResponse.rows[0].authData.accessToken;
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }

    if(accessToken){
        const response = await fetch("https://slack.com/api/auth.revoke", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const result = await response.json();

        if (!result.ok || !result.revoked) {
            throw new Error(
                `Failed to revoke Slack token: ${result.error ?? "unknown error"}`
            );
        }
    }
}

export default slackDeleteAndCleanup;