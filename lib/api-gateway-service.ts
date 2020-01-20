import { IFunction } from '@aws-cdk/aws-lambda';
import * as lambda from '@aws-cdk/aws-lambda';
import { LambdaIntegration, IResource, LambdaRestApi, MockIntegration, PassthroughBehavior } from '@aws-cdk/aws-apigateway';
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

    rootResource.addCorsPreflight({
      allowOrigins: [ "*" ]
    });

    // addCorsOptions(rootResource)


    const itemResource = rootResource.addResource(ITEM_RESOURCE);
    itemResource.addMethod('ANY', new LambdaIntegration(this.handler));

    // addCorsOptions(itemResource);
  }
}


/*
function addCorsOptions(apiResource: IResource) {
  apiResource.addMethod('OPTIONS', new MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Credentials': "'false'",
        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      },
    }],
    passthroughBehavior: PassthroughBehavior.NEVER,
    requestTemplates: {
      "application/json": "{\"statusCode\": 200}"
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
  })
}*/
