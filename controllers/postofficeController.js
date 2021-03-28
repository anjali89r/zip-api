import { creation, success, failure, invalidrequest } from "../libs/response-lib";

import * as postoffice from "../models/postofficeModel.js";

export async function insertPostoffice(event, context) {
  const data = JSON.parse(event.body);
  console.log(data);
  // if (typeof data.Postoffice !== "string" || typeof data.Pincode !== "string" || typeof data.District !== "string" || typeof data.StateName !== "string" ) {
  //   console.error("Validation Failed");

  //   return invalidrequest({ status: "Invalid Request" });
  // }

  try {
    let response = await postoffice.createrecord(data);
    console.log("Zip details ",response);
    if (response) {
      return creation({ status: "Zip Details Successfully inserted" });
    } else {
      return failure({ status: "Exception in inserting the zip" });
    }
  } catch (ex) {
    console.log("Exception in inserting the zip to the db ", ex);
    return failure({ status: "Exception in inserting the zip" });
  }
}

export async function getPost(event, context) {
  let query = event.queryStringParameters;
  console.log('query parameter', query);
  if (query === null)
  {
    console.error("Validation Failed ",query);

    return invalidrequest({ status: "Query parameter is mandatory for the Request" });
  }
  let pinCode= query.pinCode;
  let cartamount = parseInt(query.amount);
  // let state=query.state;
  // let city=query.city;
  console.log(typeof pinCode);
  if (typeof pinCode !== "string" ) {
    console.error("Validation Failed");

    return invalidrequest({ status: "Query parameter is mandatory for the Request" });
  }
 if (!cartamount || cartamount === 0)
 {
  cartamount = 0;
 }
  try{
    let response = await postoffice.getpostoffice(pinCode,cartamount);

    if (response) {
      return success( response );
    } else {
      return failure({ status: "Exception in getting the zip" });
    }
  }catch(ex)
  {
    console.log("Exception in reteriving the order details from db ", ex);
    return failure({ status: "Exception in reteriving the order details" });
  }


}
