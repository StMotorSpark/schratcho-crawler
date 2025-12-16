import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function for the backend API
    const apiLambda = new lambda.Function(this, 'SchratchoBackendFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      environment: {
        NODE_ENV: 'production'
      },
      description: 'Schratcho Crawler Backend API Lambda Function'
    });

    // API Gateway REST API
    const api = new apigateway.RestApi(this, 'SchratchoBackendAPI', {
      restApiName: 'Schratcho Crawler Backend API',
      description: 'Backend API for Schratcho Crawler game',
      deployOptions: {
        stageName: 'prod',
        throttlingBurstLimit: 100,
        throttlingRateLimit: 50
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      }
    });

    // TODO: Authentication Placeholder
    // When implementing authentication, uncomment and configure one of these options:
    // 1. AWS Cognito User Pool
    // 2. API Keys
    // 3. Custom Lambda Authorizer
    // 4. IAM Authentication
    // For now, endpoints are open (no authorizer applied)

    // Integration with Lambda
    const lambdaIntegration = new apigateway.LambdaIntegration(apiLambda, {
      proxy: true
    });

    // Add routes
    // Health check endpoint (no auth required for health checks)
    const healthResource = api.root.addResource('health');
    healthResource.addMethod('GET', lambdaIntegration);

    // Root endpoint
    api.root.addMethod('GET', lambdaIntegration);

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'Backend API Gateway URL',
      exportName: 'SchratchoBackendApiUrl'
    });

    // Output the Lambda function name
    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: apiLambda.functionName,
      description: 'Backend Lambda Function Name',
      exportName: 'SchratchoBackendLambdaName'
    });
  }
}
