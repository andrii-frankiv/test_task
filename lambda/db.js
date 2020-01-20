const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const dbClient = new DocumentClient();
const {
  TABLE_NAME: TableName = '',
  DB_ACTION
} = process.env;


// Methods/actions of dynamoDB documentClient used to implement CRUD operations.
const dbClientActionList = [ 'scan', 'put', 'get', 'update', 'delete' ];

exports.handler = async (event) => {
  console.log(JSON.stringify(event, null, 2));

  if (dbClientActionList.indexOf(event[DB_ACTION]) === -1) {
    throw Error(`${event[DB_ACTION]} is not allowed`)
  }

  try {
    const params = getParamsByEvent(event);
    const response = await dbClient[event.DB_ACTION](params()).promise();
    console.log('RESPONSE ', response);

    return {
      data: response.Items || response.Item || response
    }

  } catch (e) {
    console.error(e);
    return Promise.reject(JSON.stringify(e));
  }
};


function getParamsByEvent(event) {
  return ({
    'scan': () =>( { TableName }),
    'put': () => ({ TableName, Item: JSON.parse(event.Item) }),
    'get': () => ({ TableName, Key: event.Key }),
    'delete': () => ({ TableName, Key: event.Key }),
    'update': () => ({ TableName, Key: event.Key, UpdateExpression: event.UpdateExpression })
  })[event.DB_ACTION]
}
