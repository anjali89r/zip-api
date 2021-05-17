//customer.js
//a model scheme for our customer documents
import { dbcall } from "../libs/awsLib";
import { checkPinCodeServiceability } from "../libs/delhiveryApi";
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
      createdAt: timestamp,
    },
    ReturnValues: "ALL_OLD",
  };

  try {
    // console.log(postofficeModel);
    let resp = await dbcall("put", postofficeModel);
    // console.log("db call ", resp);
    return { status: "Success " + resp };
  } catch (ec) {
    console.log("Failure in updating the data ", ec);
    return {
      status: "Error in Updating customer info",
    };
  }
  // });
}

export async function getpostoffice(item, cartamount) {
  //console.log(cartamount);
  var params = {
    ExpressionAttributeValues: {
      ":s": item,
    },
    KeyConditionExpression: "Pincode = :s",
    IndexName: "pinindex",
    TableName: process.env.DYNAMODB_TABLE,
  };
  try {
    let dbresp = await dbcall("query", params);
    if (cartamount >= process.env.freeshippingamount) {
      dbresp.Items.map((element) => {
        element.Shippingrate = "0";
      });
    }
    console.log(dbresp);
    let delhiveryresp = await checkPinCodeServiceability(item, "");
    if (delhiveryresp != "Failed") {
      let codEligible = delhiveryresp.cod === "Y";
      dbresp.Items.map((element) => {
        element.Codeligible = codEligible;
      });
    }
    return dbresp.Items;
  } catch (e) {
    console.log("Failure in getting the data ", e);
    return {
      status: "Error in getting customer info",
    };
  }
}

export async function getShippingcost(req) {
  let response;
  if (req.country === "IN") {
    let params = {
      TableName: process.env.DYNAMODB_TABLE,
      ScanIndexForward: false,
      ConsistentRead: true,
      KeyConditionExpression: "#cd421 = :cd421 And #cd422 >= :cd422",
      ProjectionExpression:
        "#cd421,#postoffice,#district,#state,#cod,#serviceable, #rate, #country",
      ExpressionAttributeValues: {
        ":cd421": "p#" + req.postalCode,
        ":cd422": 0,
      },
      ExpressionAttributeNames: {
        "#cd421": "PK",
        "#cd422": "SK",
        "#postoffice": "Postoffice",
        "#district": "District",
        "#state": "State",
        "#cod": "CoD",
        "#serviceable": "Serviceable",
        "#rate": "Rate",
        "#country": "Country"
      },
    };
    try {
      let dbresp = await dbcall("query", params);
      if (req.cartAmount >= process.env.freeshippingamount) {
        dbresp.Items.map((element) => {
          element.Shippingrate = 0;
        });
      }
      console.log(dbresp);
      if (dbresp.Items.length > 0) {
        let delhiveryresp = await checkPinCodeServiceability(
          req.postalCode,
          ""
        );
        if (delhiveryresp != "Failed") {
          let codEligible = delhiveryresp.cod === "Y";
          dbresp.Items.map((element) => {
            element.cod = codEligible;
          });
        }
      }
      if (dbresp.Items.length > 0) {
        response = dbresp.Items.map(function (row) {
          return {
            postCode: row.PK.replace("p#", ""),
            postOffice: row.Postoffice,
            district: row.District,
            state: row.State,
            country: row.Country,
            shippingRate: row.Rate,
            discountedShippingRate: row.Rate,
            cod: row.CoD,
          };
        });
      }
      return response;
    } catch (e) {
      console.log("Failure in getting the data ", e);
      return {
        status: "Error in getting customer info",
      };
    }
  } else {
  }
}
