import { Stage } from 'aws-cdk-lib'
import {NotificationDestinationsLambdaStack} from './notification-destinations-lambda-stack.js';

export class ProductionStage extends Stage {
    constructor(scope, id, props) {
        super(scope, id, props);

        new NotificationDestinationsLambdaStack(this, 'OAuthConnectionsLambdaStack',   {
            stackName: 'NotificationDestinationsLambdaStack',
        });

    }
}