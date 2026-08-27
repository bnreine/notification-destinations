import { Duration, aws_ec2 } from 'aws-cdk-lib';
import { Runtime, LayerVersion, Code } from 'aws-cdk-lib/aws-lambda';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { LambdaRouteConnection } from '@bnreine/cdk-constructs';
import { Stack } from 'aws-cdk-lib'
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as lambda from "aws-cdk-lib/aws-lambda";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_GATEWAY_ID_SSM_PARAMETER = '/notifications/apigateway/api2/id';

export class NotificationDestinationsLambdaStack extends Stack {
    constructor(scope, id, props){
        super(scope, id, props);



        const vpc = aws_ec2.Vpc.fromLookup(this, 'Vpc', {
            vpcId: 'vpc-084bacc70db0dcefd',
        });


        const rdsSgId = ssm.StringParameter.valueForStringParameter(
            this,
            '/notifications/rds-sg-id'
        );

        const rdsSg = aws_ec2.SecurityGroup.fromSecurityGroupId(
            this,
            'RdsSg',
            rdsSgId,
            { mutable: true }
        );


        const apiId = ssm.StringParameter.valueForStringParameter(
            this,
            API_GATEWAY_ID_SSM_PARAMETER,
        );

        const defaultAuthorizerId = ssm.StringParameter.valueForStringParameter(
            this,
            "/notifications/apigateway/api2/default-authorizer-id"
        );

        const defaultAuthorizerType = ssm.StringParameter.valueForStringParameter(
            this,
            "/notifications/apigateway/api2/default-authorizer-type"
        );

        const sharedLayerArn =
            ssm.StringParameter.valueForStringParameter(
                this,
                "/notifications/shared-layer/arn"
            );

        const sharedLayer =
            lambda.LayerVersion.fromLayerVersionArn(
                this,
                "SharedLayer",
                sharedLayerArn
            );

        const listLambdaDir = path.join(__dirname, '../src/list');
        const deleteLambdaDir = path.join(__dirname, '../src/delete');


        const lambdaSecurityGroup = new aws_ec2.SecurityGroup(this, 'NotificationDestinationsLambdaSecurityGroup', {
            vpc,
            description: 'Security group for Notification Destination Lambda functions',
            allowAllOutbound: true, // Allows the Lambda to initiate connections (e.g. to RDS)
        });

        const listLambda = new NodejsFunction(this, 'NotificationDestinationsListLambda', {
            runtime: Runtime.NODEJS_22_X,
            entry: path.join(listLambdaDir, 'index.js'),
            handler: 'handler',
            timeout: Duration.seconds(29),
            projectRoot: listLambdaDir,
            depsLockFilePath: path.join(listLambdaDir, 'package-lock.json'),
            layers: [sharedLayer],
            bundling: {
                externalModules: ['/opt/*'],
                format: OutputFormat.ESM,
            },
            vpc,
            vpcSubnets: {
                subnetType: aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            securityGroups: [lambdaSecurityGroup],
            environment: {
                // NODE_ENV: "sam-local",
            }
        });

        const writeReadRDSdbSecret = secretsmanager.Secret.fromSecretNameV2(
            this,
            'DbSecret',
            'write_read_rds_db',
        );

        const readOnlyRDSdbSecret = secretsmanager.Secret.fromSecretNameV2(
            this,
            'ReadOnlyRDSDbSecret',
            'readonly_rds_db',
        );


        readOnlyRDSdbSecret.grantRead(listLambda);

        new LambdaRouteConnection(this, 'NotificationDestinationsListRoute', {
            lambdaFunction: listLambda,
            region: this.region,
            apiId,
            routeKey: 'GET /destinations',
            authorizationType: defaultAuthorizerType,
            authorizerId: defaultAuthorizerId,
        });


        const deleteLambda = new NodejsFunction(this, 'NotificationDestinationsDeleteLambda', {
            runtime: Runtime.NODEJS_22_X,
            entry: path.join(deleteLambdaDir, 'index.js'),
            handler: 'handler',
            timeout: Duration.seconds(29),
            projectRoot: deleteLambdaDir,
            depsLockFilePath: path.join(deleteLambdaDir, 'package-lock.json'),
            layers: [sharedLayer],
            bundling: {
                externalModules: ['/opt/*'],
                format: OutputFormat.ESM,
            },
            vpc,
            vpcSubnets: {
                subnetType: aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            securityGroups: [lambdaSecurityGroup],
            environment: {
                // NODE_ENV: "sam-local",
            }
        });

        writeReadRDSdbSecret.grantRead(deleteLambda);

        new LambdaRouteConnection(this, 'NotificationDestinationsDeleteRoute', {
            lambdaFunction: deleteLambda,
            region: this.region,
            apiId,
            routeKey: 'DELETE /destinations/{destinationId}',
            authorizationType: defaultAuthorizerType,
            authorizerId: defaultAuthorizerId,
        });

        rdsSg.addIngressRule(
            lambdaSecurityGroup,
            aws_ec2.Port.tcp(5432),
            "Allow Lambda to connect"
        );




    }
}