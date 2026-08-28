const postEvent = {
    "version": "2.0",
    "routeKey": "PUT /configurations/{configurationId}/preferences/{destinationId}",
    "rawPath": "/configurations/e75883fb-9270-4902-89a5-8c1fb67bbcd3/preferences/32590bfa-a218-404a-9dfa-f18aa912ed58",
    "rawQueryString": "",
    "headers": {
        "accept": "application/json;v=2",
        "accept-encoding": "gzip, deflate, br",
        "authorization": "abcd",
        "content-length": "33",
        "content-type": "application/json",
        "host": "o1ujxahgeg.execute-api.us-east-1.amazonaws.com",
        "postman-token": "be820a98-5967-40ed-82f4-b4c8b49f7c3d",
        "user-agent": "PostmanRuntime/7.37.3",
        "x-amzn-trace-id": "Root=1-6a0f66cd-35667e5b4e5a34b01e589320",
        "x-forwarded-for": "179.218.10.163",
        "x-forwarded-port": "443",
        "x-forwarded-proto": "https"
    },
    "requestContext": {
        "accountId": "010273536955",
        "apiId": "o1ujxahgeg",
        "authorizer": {
            "jwt": {
                "claims": {
                    "sub": "44085488-0091-707c-2208-9b6753027a15"
                }
            }
        },
        "domainName": "o1ujxahgeg.execute-api.us-east-1.amazonaws.com",
        "domainPrefix": "o1ujxahgeg",
        "http": {
            "method": "PUT",
            "path": "/configurations/{configurationId}/preferences/{destinationId}",
            "protocol": "HTTP/1.1",
            "sourceIp": "179.218.10.163",
            "userAgent": "PostmanRuntime/7.37.3"
        },
        "requestId": "du0AJiy6oAMEYEw=",
        "routeKey": "PUT /configurations/{configurationId}/preferences/{destinationId}",
        "stage": "$default",
        "time": "21/May/2026:20:10:53 +0000",
        "timeEpoch": 1779394253327
    },
    "isBase64Encoded": false,
    "body": JSON.stringify({
        "channelType":  "whatsapp",
        "metadata": {
            "phoneNumber": "+5548988016078"
        }
    }),
}


export default postEvent