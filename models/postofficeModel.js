//customer.js
//a model scheme for our customer documents
import * as db from "../libs/dynamodb-lib";
const uuid = require("uuid");
const timestamp = new Date().toLocaleDateString();

export async function createrecord(params) {
   let postofficeModel = {
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        id: uuid.v1(),
        Pincode: params.Pincode,
        Postoffice: params.Postoffice,
        District: params.District,
        StateName: params.StateName,
        Serviceable: params.Serviceable,
        Servicearea: params.Servicearea,
        Servicecode: params.Servicecode,
        Codeligible: params.Codeligible,
        Shippingrate: params.Shippingrate,
        createdAt: timestamp
      },
      ReturnValues: "ALL_OLD"
    };

    try {
      // console.log(postofficeModel);
      let resp = await db.call("put", postofficeModel);
      // console.log("db call ", resp);
      return {'status': 'Success '+ resp};
    } catch (ec) {
      console.log("Failure in updating the data ", ec);
      return {
        status: "Error in Updating customer info"
      };
    }
  // });

}

export async function getpostoffice(item,cartamount) {
  //console.log(cartamount);
  var params = {
    ExpressionAttributeValues: {
      ':s': item
     },
   KeyConditionExpression: 'Pincode = :s',
   IndexName: 'pinindex',
   TableName: process.env.DYNAMODB_TABLE
  };
  try {
    let dbresp = await db.call("query", params);
    if (cartamount >= process.env.freeshippingamount)
    {
      dbresp.map(element =>
        {
          element.Shippingrate = "0";
        });
      console.log(dbresp);
    }

    return dbresp;
  } catch (e) {
    console.log("Failure in getting the data ", e);
    return {
      status: "Error in getting customer info"
    };
  }
}
