import { getDbPool } from '/opt/nodejs/db/connection.js';
import hal from 'halson'

export const handler = async (event) => {
    try {
        const userId = event?.requestContext?.authorizer?.jwt?.claims?.sub;

        const dbPool = await getDbPool('readonly_rds_db');

        const destinationResponse = await dbPool.query(
            `SELECT d."id", "channelType", case when "channelType"='slack' then jsonb_build_object(
                    'channelName', d."metadata"->>'channelName',
                    'workspaceName', oa."authData"->>'workspaceName'
                                                                                ) else d."metadata" end as "metadata", "oAuthConnectionId", case when "channelType"='slack' and oa."id" is not null then 'connected' when "channelType" = 'slack' then 'disconnected' else null end as "authStatus", case when "channelType" in ('sms','whatsapp') then c."status" else null end as "consentStatus" FROM "Destination" as d left join "Consent" as c on c."destinationId" = d.id left join "OAuthConnection" as oa on oa."id" = d."oAuthConnectionId" WHERE d."userId" = $1 and d."deleted" is not true`,
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
