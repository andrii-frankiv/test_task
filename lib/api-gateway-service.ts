import { IFunction } from '@aws-cdk/aws-lambda';
import * as lambda from '@aws-cdk/aws-lambda';
import { LambdaIntegration, LambdaRestApi } from '@aws-cdk/aws-apigateway';
import { Construct } from '@aws-cdk/core';

const LAMBDA_CONFIG = {
  runtime: lambda.Runtime.NODEJS_10_X,
  code: new lambda.AssetCode('lambda'),
  handler: 'api-proxy.handler'
};


const
  ROOT_RESOURCE = 'animals',
  ITEM_RESOURCE = '{id}'
;


interface IRestApiServiceProps {
  dbHandlerName: string,
  s3HandlerName: string
}

export default class RestApiService extends Construct {
  static get serviceName(): string {
    return 'RestApi';
  }

  readonly handler: lambda.IFunction;

  constructor(scope: Construct, id: string, props: IRestApiServiceProps) {
    super(scope, id);

    const { serviceName } = RestApiService;

    this.handler = new lambda.Function(this, `${serviceName}LambdaProxyHandler`, {
      ...LAMBDA_CONFIG,
      environment: {
        DB_HANDLER: props.dbHandlerName,
        S3_HANDLER: props.s3HandlerName
      }
    });

    const service = new LambdaRestApi(this, serviceName, { handler: this.handler, proxy: false });

    const rootResource = service.root.addResource(ROOT_RESOURCE);
    // list items
    rootResource.addMethod('GET', new LambdaIntegration(this.handler));
    // create new item
    rootResource.addMethod('POST', new LambdaIntegration(this.handler));


    const itemResource = rootResource.addResource(ITEM_RESOURCE);
    itemResource.addMethod('ANY', new LambdaIntegration(this.handler));
  }
}