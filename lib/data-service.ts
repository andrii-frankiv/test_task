import { IFunction } from '@aws-cdk/aws-lambda';
import { Construct } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { Table, AttributeType, TableProps } from '@aws-cdk/aws-dynamodb';


const LAMBDA_CONFIG = {
  runtime: lambda.Runtime.NODEJS_10_X,
  code: new lambda.AssetCode('./lambda'),
  handler: 'db.handler'
};


const
  KEY = 'ANIMAL_ID',
  TABLE_NAME = 'Animals'
;

const TABLE_CONFIG:TableProps = {
  tableName: TABLE_NAME,
  partitionKey: { name: KEY, type: AttributeType.STRING }
};


interface IUserService {
  readonly serviceHandler: IFunction

  grantInvokeServiceHandler(fn: IFunction): void

  readonly serviceHandlerName: string
}

export default class DataService extends Construct implements IUserService {
  readonly serviceHandler: IFunction;

  public grantInvokeServiceHandler(fn: IFunction): void {
    this.serviceHandler.grantInvoke(fn);
  }

  get serviceHandlerName(): string {
    return this.serviceHandler.functionName;
  }

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const table = new Table(this, `${TABLE_NAME}Table`, TABLE_CONFIG);

    this.serviceHandler = new lambda.Function(this, `${TABLE_NAME}Handler`, {
      ...LAMBDA_CONFIG,
      environment: {
        TABLE_NAME: table.tableName,
        PRIMARY_KEY: KEY,
        DB_ACTION: 'DB_ACTION'
      }
    });


    table.grantReadWriteData(this.serviceHandler);
  }
}


