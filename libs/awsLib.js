import { DynamoDB, SecretsManager } from "aws-sdk";


let options = {
  region: process.env.region,
  endpoint: process.env.dbendpoint
};
// console.log(options);
export async function dbcall(action, params) {
  try {
    const dynamoDb = new DynamoDB.DocumentClient(options);
    let dbaction = await dynamoDb[action](params).promise();

    return dbaction;
  } catch (ex) {
    console.log("ERR:" + JSON.stringify(params), ex);
    return { status: "Error in running DB query" };
  }
}
export async function retrieveSecrets(secretName) {
  try {
    var client = new SecretsManager({
      region: process.env.region,
    });

    let secrets = await client
      .getSecretValue({ SecretId: secretName })
      .promise();
    // console.log('Secret Data -', secrets);
    if ("SecretString" in secrets) {
      return secrets.SecretString;
    } else {
      let buff = new Buffer(secrets.SecretBinary, "base64");
      return buff.toString("ascii");
    }
  } catch (ex) {
    console.log("ERR:", ex.message);
    var response = '{"SURFACE":null,"EXPRESS":null}';
    return response;
  }
}
