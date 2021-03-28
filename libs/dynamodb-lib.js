import AWS from "aws-sdk";
let options = {};

// connect to local DB if running offline
if (process.env.IS_OFFLINE) {
  options = {
    region: "localhost",
    endpoint: "http://localhost:8000"
  };

} else {

  options = {
    region: process.env.region,
    endpoint: process.env.endpoint
  };

}
console.log("my conn details ",options);
export async function call(action, params) {
  const dynamoDb = new AWS.DynamoDB.DocumentClient(options);

  try {
    //console.log(params);
    // console.log("my params ",dynamoDb);
    let dbaction = await dynamoDb[action](params).promise();
    //console.log("my action ", dbaction.Items);
    return dbaction.Items;
  } catch (ex) {
    console.log("Error in inserting the data to db ", ex);
  }
}
// aws dynamodb scan \
//     --table-name my_table_name
//     --endpoint-url http://localhost:8000
