const { Lambda } = require('aws-sdk');
const lambda = new Lambda();
const HEADERS = { 'Content-Type': 'text/json' };
const rootResource = '/animals';


exports.handler = async function (event) {
  const { path, pathParameters } = event;
  let response;

  try {
    /* ROOT RESOURCE HANDLERS */
    // list all items
    if (path === rootResource && event.httpMethod === 'GET') {
      response = await listAllItems();
    }
    // create item
    if (path === rootResource && event.httpMethod === 'POST') {
      response = await addItem(event.body);
    }

    /* NESTED ITEM RESOURCE HANDLERS */
    // get item by id
    if (pathParameters && pathParameters.id && event.httpMethod === 'GET') {
      response = await getItem(pathParameters.id);
    }
    // delete item by id
    if (pathParameters && pathParameters.id && event.httpMethod === 'DELETE') {
      response = await deleteItem(pathParameters.id);
    }

    return {
      statusCode: 200,
      headers: HEADERS,
      body: response.Payload
    };
  } catch(e) {
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify(e)
    }
  }
};


function addItem(item) {
  return lambda
    .invoke({
      FunctionName: process.env.DB_HANDLER,
      Payload: JSON.stringify({"DB_ACTION": "put", "Item": item}),
    })
    .promise();
}

function deleteItem(id) {
  return lambda
    .invoke({
      FunctionName: process.env.DB_HANDLER,
      Payload: JSON.stringify({ "DB_ACTION": "get", "Key": { "ANIMAL_ID": id }}),
    })
    .promise();
}

function getItem(id) {
  return lambda
    .invoke({
      FunctionName: process.env.DB_HANDLER,
      Payload: JSON.stringify({ "DB_ACTION": "get", "Key": { "ANIMAL_ID": id }}),
    })
    .promise();
}

function listAllItems() {
  return lambda
    .invoke({
      FunctionName: process.env.DB_HANDLER,
      Payload: JSON.stringify({ "DB_ACTION": "scan" }),
    })
    .promise();
}
