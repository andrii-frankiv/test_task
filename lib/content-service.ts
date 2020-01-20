import { IFunction } from '@aws-cdk/aws-lambda';
import { Construct } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { Bucket, BucketProps } from '@aws-cdk/aws-s3';
import { Table, AttributeType, TableProps } from '@aws-cdk/aws-dynamodb';


const LAMBDA_CONFIG = {
  runtime: lambda.Runtime.NODEJS_10_X,
  code: new lambda.AssetCode('./lambda'),
  handler: 's3.handler'
};

const BUCKET_NAME = 'Content';

const BUCKET_CONFIG: BucketProps = {

}

interface IAppService {
  readonly serviceHandler: IFunction

  grantInvokeServiceHandler(fn: IFunction): void

  readonly serviceHandlerName: string
}

export default class ContentService extends Construct implements IAppService {
  readonly serviceHandler: IFunction;

  public grantInvokeServiceHandler(fn: IFunction): void {
    this.serviceHandler.grantInvoke(fn);
  }

  get serviceHandlerName(): string {
    return this.serviceHandler.functionName;
  }

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const bucket = new Bucket(this, `${BUCKET_NAME}Service`);

    this.serviceHandler = new lambda.Function(this, `${BUCKET_NAME}Handler`, {
      ...LAMBDA_CONFIG,
      environment: {
        BUCKET_NAME: bucket.bucketName,
        S3_ACTION: 'S3_ACTION'
      }
    });

    bucket.grantReadWrite(this.serviceHandler);
  }
}


