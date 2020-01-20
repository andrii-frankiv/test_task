import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apiGateway from '@aws-cdk/aws-apigateway';

import DataService from './data-service';
import ContentService from './content-service';
import ApiGatewayService from './api-gateway-service';


export class AwsAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dataService = new DataService(this, 'DataService');
    const contentService = new ContentService(this, 'ContentService');

    const gatewayService = new ApiGatewayService(this, 'ApiGatewayService', {
      dbHandlerName: dataService.serviceHandlerName,
      s3HandlerName: contentService.serviceHandlerName
    });

    /* apply service permissions */
    [dataService, contentService]
      .forEach(service => service.grantInvokeServiceHandler(gatewayService.handler));



  }
}
