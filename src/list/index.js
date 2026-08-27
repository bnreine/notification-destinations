import { getDbPool } from '/opt/nodejs/db/connection.js';
import hal from 'halson'

export const handler = async (event) => {
    try {
        const userId = event?.requestContext?.authorizer?.jwt?.claims?.sub;

        const dbPool = await getDbPool('readonly_rds_db');

        const destinationResponse = await dbPool.query(
            'SELECT "id", "channelType", "metadata", "oAuthConnectionId" FROM "Destination" WHERE "userId" = $1',
            [userId]
        );

        const headers = event.headers;
        const { host, 'x-forwarded-proto': protocol } = headers;

        const resourceHref = `${protocol}://${host}/destinations`;

        const destinations = destinationResponse.rows.map((dest) => {
            const destinationHref = `${resourceHref}/${dest.id}`;
            return hal(dest).addLink('self', destinationHref);
        });

        const resource = hal({})
            .addLink('self', resourceHref)
            .addEmbed('destinations', destinations);

        return { statusCode: 200, body: JSON.stringify(resource), headers: { 'Content-Type': 'application/json' }, };
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
