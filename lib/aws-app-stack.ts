import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apiGateway from '@aws-cdk/aws-apigateway';

import DataService from './data-service';

import ApiGatewayService from './api-gateway-service';

export function addCorsOptions(apiResource: apiGateway.IResource) {
  apiResource.addMethod('OPTIONS', new apiGateway.MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': '\'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent\'',
        'method.response.header.Access-Control-Allow-Origin': '\'*\'',
        'method.response.header.Access-Control-Allow-Credentials': '\'false\'',
        'method.response.header.Access-Control-Allow-Methods': '\'OPTIONS,GET,PUT,POST,DELETE\'',
      },
    }],
    passthroughBehavior: apiGateway.PassthroughBehavior.NEVER,
    requestTemplates: {
      'application/json': '{"statusCode": 200}'
    },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true,
      },
    }]
  });
}


export class AwsAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const dataService = new DataService(this, 'DataService');

    /* CREATE API with Lambdas */

    // const listUsers = new lambda.Function(this, 'listUsersFunction', {
    //   ...LAMBDA_CONFIG,
    //   handler: 'api-req-handlers.listAll'
    // });

    // userDataService.grantInvokeHandler(listUsers);

    const gatewayService = new ApiGatewayService(this, 'ApiGatewayService', {
      functionName: dataService.serviceHandlerName
    });

    dataService.grantInvokeServiceHandler(gatewayService.handler)


  }
}
