const S3 = require('aws-sdk/clients/s3');
const s3Client = new S3();

const {
  BUCKET_NAME: Bucket,
  S3_ACTION
} = process.env;

const ACTION_LIST = ['listObjectsV2', 'putObject',/* 'deleteObject', 'getObject'*/];


const __trace = (event) => {
  console.log(JSON.stringify(event, null, 2));

  ["AWS_LAMBDA_EVENT_BODY", "_HANDLER"]
    .forEach(ENV_VAR => console.log(`${ENV_VAR}: ${process.env[ENV_VAR]}`))
}


exports.handler = async (event) => {
  __trace(event);

  if (ACTION_LIST.indexOf(event[S3_ACTION]) === -1) {
    throw Error(`${event[S3_ACTION]} is not allowed`)
  }

  try {
    const params = getParamsByEvent(event);
    const response = await s3Client[event.S3_ACTION](params).promise();
    console.log('RESPONSE ', response);

    return {
      data: JSON.stringify(response.Contents)
    }


  } catch (e) {
    console.error(e);
    return Promise.reject(JSON.stringify(e));
  }
};

async function getParamsByEvent(event) {
  const { Key, Body } = event;

  /*if (event.S3_ACTION === 'putObject') {
     // const Body = fs.readFileSync('./../__mock__/_108848302_a0d15811-30d8-4a51-8dd3-ab45f3dbc387.jpg');

     return { Bucket, Key, Body };
  }*/


  // const Body =
  return ({
    'listObjectsV2': { Bucket },
    'putObject': { Bucket, Key, Body },
    // 'getObject': { Bucket, Key, Body },
    // 'deleteObject': { TableName, Key, UpdateExpression, ExpressionAttributeValues }
  })[event.S3_ACTION]
}
